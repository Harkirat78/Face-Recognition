import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import * as tf from '@tensorflow/tfjs';
import * as blazeface from '@tensorflow-models/blazeface';
import { RootState } from '../../app/store';
import { setDetectedFaces, setError, setProcessing, setStreamActive } from '../../features/webcam/webcamSlice';
import './WebcamFacialRecognition.css';

const WebcamFacialRecognition: React.FC = () => {
  const dispatch = useDispatch();
  const { isStreamActive, processing, error } = useSelector((state: RootState) => state.webcam);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [model, setModel] = useState<blazeface.BlazeFaceModel | null>(null);

  // Load BlazeFace model
  const loadModel = async () => {
    dispatch(setProcessing(true));
    try {
      await tf.setBackend('webgl');
      const loadedModel = await blazeface.load();
      setModel(loadedModel);
      console.log('BlazeFace model loaded:', loadedModel);
    } catch (err) {
      dispatch(setError('Failed to load BlazeFace model'));
    }
    dispatch(setProcessing(false));
  };
  
  // Start the webcam
  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: false,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          dispatch(setStreamActive(true));
          dispatch(setError(null));
          startDetection();
        };
      }
    } catch (err) {
      dispatch(setError('Could not access webcam. Please ensure you have granted permission.'));
    }
  };

  // Stop the webcam
  const stopWebcam = useCallback(() => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
      dispatch(setStreamActive(false));
      dispatch(setDetectedFaces([]));
    }
  }, [dispatch]);

  // Detect faces using BlazeFace
  const startDetection = () => {
    if (videoRef.current && canvasRef.current && model) {
      const detectFaces = async () => {
        if (videoRef.current && videoRef.current.readyState === 4) {
          const predictions = await model.estimateFaces(videoRef.current, false);

          if (predictions.length > 0) {
            drawFaces(predictions);
            dispatch(setDetectedFaces(predictions));
          }
        }
        if (isStreamActive) {
          requestAnimationFrame(detectFaces);
        }
      };
      detectFaces();
    }
  };

  // Draw detected faces on the canvas
  const drawFaces = async (predictions: blazeface.NormalizedFace[]) => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx || !canvasRef.current) return;
  
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  
    for (const prediction of predictions) {
      // Handle topLeft
      const topLeft = Array.isArray(prediction.topLeft)
        ? prediction.topLeft
        : await prediction.topLeft.array();
      const bottomRight = Array.isArray(prediction.bottomRight)
        ? prediction.bottomRight
        : await prediction.bottomRight.array();
  
      const [x1, y1] = topLeft as [number, number];
      const [x2, y2] = bottomRight as [number, number];
      const width = x2 - x1;
      const height = y2 - y1;
  
      // Draw bounding box
      ctx.strokeStyle = '#00ff00';
      ctx.lineWidth = 2;
      ctx.strokeRect(x1, y1, width, height);
  
      // Add label
      ctx.fillStyle = '#00ff00';
      ctx.font = '16px Arial';
      ctx.fillText('Face Detected', x1, y1 - 10);
    }
  };
  
  useEffect(() => {
    return () => {
      stopWebcam();
    };
  }, [stopWebcam]);

  return (
    <div className="webcam-container">
      <div className="controls">
        <button
          className={`control-button ${isStreamActive ? 'disabled' : ''}`}
          onClick={startWebcam}
          disabled={isStreamActive}
        >
          Start Camera
        </button>
        <button
          className={`control-button stop ${!isStreamActive ? 'disabled' : ''}`}
          onClick={stopWebcam}
          disabled={!isStreamActive}
        >
          Stop Camera
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}
      {processing && <div className="loading">Loading model...</div>}

      <div className="video-container">
        <video ref={videoRef} autoPlay playsInline className="video-feed" />
        <canvas ref={canvasRef} className="detection-overlay" />
      </div>
    </div>
  );
};

export default WebcamFacialRecognition;
