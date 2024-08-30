import React, { useRef, useEffect, useState } from 'react';
import '../../App.css';
import './PhotoMode.css';
import { connectUSBDevice, getCameraAccess, startCountdown, takePicture, downloadImage, uploadImageToCloud, retryUSBDeviceConnection} from '../controllers/Controller.js';
import Peripherie from '../controllers/Peripherie.js';
import { useNavigate } from 'react-router-dom';

function PhotoMode() {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [cameraActive, setCameraActive] = useState(true);
  const [device, setDevice] = useState(null);
  const [imageSrc, setImageSrc] = useState(null);
  const [photoTaken, setPhotoTaken] = useState(false);
  const [showButtons, setButtonsShown] = useState(true); 
  const [videoStreamActive, setVideoStreamActive] = useState(false);
  const [timerValue, setTimerValue] = useState(3);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (Peripherie.hasExternCamera) {
      // USB-Gerät verwenden
      connectUSBDevice(setDevice, (device) => {
        getCameraAccess(device, videoRef, setVideoStreamActive)
          .catch(() => retryUSBDeviceConnection());  // Fehler abfangen und erneut versuchen
      });
    } else {
      // Interne Kamera verwenden
      getCameraAccess(null, videoRef, setVideoStreamActive);
    }

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
    };
  }, [cameraActive, device]);

  const handleRetakePicture = () => {
    setImageSrc(null);
    setPhotoTaken(false);
    setCameraActive(false);
    setButtonsShown(true);
    setTimeout(() => {
      setCameraActive(true);
    }, 1);
  };

  const handleEndSession = () => {
    handleRetakePicture();
    navigate('/home/');
  };

  const startPhotoCountdown = () => {
    setButtonsShown(false);
    startCountdown(timerValue, setCountdown, () => takePicture(videoRef, canvasRef, setImageSrc, setPhotoTaken));
  };

  const handleSavePicture = () => {
    if (Peripherie.cloudAccess) {
      uploadImageToCloud(imageSrc); // Bild in die Cloud hochladen
    } else {
      downloadImage(imageSrc); // Bild herunterladen
    }
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
                  <button className="end-button" onClick={handleEndSession}>
                    End Session
                  </button>
                  {!photoTaken && showButtons && (
                    <div className="footer-text">
                      Timer: {timerValue} Sekunden
                    </div>
                  )}
                </div>
              </>
            )}
            {countdown > 0 && <div className="countdown">{countdown}</div>}
          </>
        ) : (
          <>
            <img id="captured" src={imageSrc} alt="Captured" />
            <div className="button-container">
              <button className="start-button" onClick={handleSavePicture}>Save Picture</button>
              <button className="end-button" onClick={handleRetakePicture}>Neues Foto</button>
            </div>
          </>
        )}
      </header>
    </div>
  );
}

export default PhotoMode;
