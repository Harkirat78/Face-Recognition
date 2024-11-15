import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface WebcamState {
  isStreamActive: boolean;
  detectedFaces: any[];
  processing: boolean;
  error: string | null;
}

const initialState: WebcamState = {
  isStreamActive: false,
  detectedFaces: [],
  processing: false,
  error: null,
};

const webcamSlice = createSlice({
  name: 'webcam',
  initialState,
  reducers: {
    setStreamActive: (state, action: PayloadAction<boolean>) => {
      state.isStreamActive = action.payload;
    },
    setDetectedFaces: (state, action: PayloadAction<any[]>) => {
      state.detectedFaces = action.payload;
    },
    setProcessing: (state, action: PayloadAction<boolean>) => {
      state.processing = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { setStreamActive, setDetectedFaces, setProcessing, setError } = webcamSlice.actions;
export default webcamSlice.reducer;