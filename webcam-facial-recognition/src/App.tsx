import React from 'react';
import WebcamFacialRecognition from './components/WebcamFacialRecognition/WebcamFacialRecognition';
import './App.css';

const App: React.FC = () => {
  return (
    <div className="app">
      <header className="app-header">
        <h1>Facial Recognition App</h1>
      </header>
      <main>
        <WebcamFacialRecognition />
      </main>
    </div>
  );
};

export default App;