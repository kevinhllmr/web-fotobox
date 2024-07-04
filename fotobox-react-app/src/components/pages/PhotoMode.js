// PhotoMode.js

import React, { useRef, useEffect, useState } from 'react';
import './PhotoMode.css';
import { connectUSBDevice, getCameraAccess, handleCameraToggle, startCountdown, takePicture, downloadImage, retakePicture } from '../controllers/Controller.js';

function PhotoMode() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [device, setDevice] = useState(null);
  const [imageSrc, setImageSrc] = useState(null);
  const [photoTaken, setPhotoTaken] = useState(false);
  const [videoStreamActive, setVideoStreamActive] = useState(false);
  const [timerValue, setTimerValue] = useState(3);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (cameraActive) {
      getCameraAccess(device, videoRef, setVideoStreamActive);
    } else {
      setVideoStreamActive(false);
    }
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
    };
  }, [cameraActive]);

  return (
    <div className="PhotoMode">
      <header className="App-header">
        <h1>Live Camera Feed</h1>
        {!photoTaken ? (
          <>
            <button onClick={() => handleCameraToggle(setCameraActive)}>
              {cameraActive ? 'Kamera ausschalten' : 'Kamera einschalten'}
            </button>
            <button onClick={() => connectUSBDevice(setDevice, (device) => getCameraAccess(device, videoRef, setVideoStreamActive))}>
              Connect USB Device
            </button>
            {cameraActive && <video ref={videoRef} autoPlay playsInline />}
            <canvas ref={canvasRef} style={{ display: 'none' }} width="640" height="480"></canvas>
            {videoStreamActive && (
              <>
                <input
                  type="range"
                  min="3"
                  max="10"
                  value={timerValue}
                  onChange={(e) => setTimerValue(e.target.value)}
                />
                <span>{timerValue} Sekunden</span>
                <button onClick={() => startCountdown(timerValue, setCountdown, () => takePicture(videoRef, canvasRef, setImageSrc, setPhotoTaken))}>
                  Take Picture
                </button>
              </>
            )}
            {countdown > 0 && <div className="countdown">{countdown}</div>}
          </>
        ) : (
          <>
            <img src={imageSrc} alt="Captured" />
            <button onClick={() => downloadImage(imageSrc)}>Download Image</button>
            <button onClick={() => retakePicture(setImageSrc, setPhotoTaken)}>Neues Foto</button>
          </>
        )}
      </header>
    </div>
  );
}

export default PhotoMode;
