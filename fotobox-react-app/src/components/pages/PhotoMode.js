import React, { useRef, useEffect, useState } from 'react';
import './PhotoMode.css';
import { connectUSBDevice, getCameraAccess, startCountdown, takePicture, downloadImage, retakePicture } from '../controllers/Controller.js';
import Peripherie from '../controllers/Peripherie.js';

function PhotoMode() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [cameraActive, setCameraActive] = useState(true); // Kamera sofort aktiv
  const [device, setDevice] = useState(null);
  const [imageSrc, setImageSrc] = useState(null);
  const [photoTaken, setPhotoTaken] = useState(false);
  const [showButtons, setButtonsShown] = useState(true); // Buttons initially shown
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
  }, [cameraActive, device]);

  useEffect(() => {
    if (Peripherie.hasExternCamera) {
      connectUSBDevice(setDevice, (device) => getCameraAccess(device, videoRef, setVideoStreamActive));
    } else {
      getCameraAccess(null, videoRef, setVideoStreamActive);
    }
  }, []);

  const handleRetakePicture = () => {
    setImageSrc(null);
    setPhotoTaken(false);
    setCameraActive(false);
    setButtonsShown(true);
    // Kleine Verzögerung einfügen, um die Kamera aus- und wieder einzuschalten
    setTimeout(() => {
      setCameraActive(true);
    }, 1);
  };

  const startPhotoCountdown = () => {
    setButtonsShown(false);
    startCountdown(timerValue, setCountdown, () => takePicture(videoRef, canvasRef, setImageSrc, setPhotoTaken));
  };

  return (
    <div className="PhotoMode">
      <img id="bg" src={process.env.PUBLIC_URL + '/images/home-bg.png'} alt="Background" />
      <header className="App-header">
        {!photoTaken ? (
          <>
            {cameraActive && <video ref={videoRef} autoPlay playsInline />}
            <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
            {videoStreamActive && showButtons && (
              <>
                <div className="button-container">
                  <button className="start-button" onClick={startPhotoCountdown}>
                    Start Countdown
                  </button>
                  <input
                    type="range"
                    min="3"
                    max="10"
                    value={timerValue}
                    onChange={(e) => setTimerValue(e.target.value)}
                  />
                  <button className="end-button" onClick={() => handleRetakePicture()}>
                    End Session
                  </button>
                </div>
              </>
            )}
            {countdown > 0 && <div className="countdown">{countdown}</div>}
          </>
        ) : (
          <>
            <img id="captured" src={imageSrc} alt="Captured" />
            <div className="button-container">
              <button className="start-button" onClick={() => downloadImage(imageSrc)}>Download Image</button>
              <button className="end-button" onClick={handleRetakePicture}>Neues Foto</button>
            </div>
          </>
        )}
        {!photoTaken && showButtons && (
          <div className="footer-text">
            Timer: {timerValue} Sekunden
          </div>
        )}
      </header>
    </div>
  );
}

export default PhotoMode;
