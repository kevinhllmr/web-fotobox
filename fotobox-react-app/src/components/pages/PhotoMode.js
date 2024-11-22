import React, { useRef, useEffect, useState } from "react";
import "../../App.css";
import "./PhotoMode.css";
import {
  getCameraAccess,
  selectUSBDevice,
  takePicture,
  saveImageToIndexedDB,
  startCountdown,
} from "../controllers/Controller.js";
import { useNavigate } from "react-router-dom";

function PhotoMode() {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [cameraActive, setCameraActive] = useState(false); // Kamera bleibt inaktiv bis Start gedrückt wird
  const [device, setDevice] = useState(null);
  const [imageSrc, setImageSrc] = useState(null);
  const [photoTaken, setPhotoTaken] = useState(false);
  const [showButtons, setButtonsShown] = useState(false); // Buttons erst nach Start anzeigen
  const [videoStreamActive, setVideoStreamActive] = useState(false);
  const [timerValue, setTimerValue] = useState(3);
  const [countdown, setCountdown] = useState(0);

  // Initialisiere die Kamera
  const initializeCamera = async () => {
    try {
      console.log("Initializing camera...");
      if (!videoRef.current) {
        console.error("VideoRef is null. Camera initialization aborted.");
        return;
      }
      const selectedCamera = await selectUSBDevice(setDevice);
      if (selectedCamera) {
        console.log("Selected Camera:", selectedCamera);
        await getCameraAccess(selectedCamera, videoRef, setVideoStreamActive);
      }
      setCameraActive(true);
      setButtonsShown(true); // Zeige Buttons nach erfolgreicher Initialisierung
    } catch (error) {
      console.error("Fehler bei der Kamera-Initialisierung:", error);
    }
  };

  // Effekt zur Überwachung von cameraActive und videoRef
  useEffect(() => {
    if (cameraActive && !videoStreamActive && videoRef.current) {
      console.log("Starting camera initialization...");
      initializeCamera();
    }
  }, [cameraActive, videoStreamActive]);

  // Handling für den Start der Kamera-App
  const handleStartApp = () => {
    console.log("Starting camera app...");
    setCameraActive(true); // Kamera wird aktiviert, wodurch der useEffect ausgelöst wird
  };

  const handleRetakePicture = () => {
    console.log("Retaking picture...");
    setImageSrc(null);
    setPhotoTaken(false);
    setCameraActive(false);
    setButtonsShown(false);
    setTimeout(() => {
      setCameraActive(true);
    }, 1);
  };

  const handleEndSession = () => {
    console.log("Ending session...");
    handleRetakePicture();
    navigate("/home/");
  };

  const startPhotoCountdown = () => {
    console.log("Starting photo countdown...");
    setButtonsShown(false);
    startCountdown(timerValue, setCountdown, () =>
      takePicture(videoRef, canvasRef, setImageSrc, setPhotoTaken)
    );
  };

  const handleSavePicture = () => {
    console.log("Saving picture...");
    saveImageToIndexedDB(imageSrc); // Bild in IndexedDB speichern
    handleRetakePicture();
  };

  return (
    <div className="PhotoMode">
      <img
        id="bg"
        src={process.env.PUBLIC_URL + "/images/home-bg.png"}
        alt="Background"
      />
      <header className="App-header">
        {!cameraActive ? (
          // Zeige Start-Button vor Kamera-Initialisierung
          <button className="start-button" onClick={handleStartApp}>
            Start
          </button>
        ) : (
          <>
            {!photoTaken ? (
              <>
                {cameraActive && <video ref={videoRef} autoPlay playsInline />}
                <canvas ref={canvasRef} style={{ display: "none" }}></canvas>
                {videoStreamActive && showButtons && (
                  <div className="button-container">
                    <button
                      className="start-button"
                      onClick={startPhotoCountdown}
                    >
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
                  </div>
                )}
                {countdown > 0 && <div className="countdown">{countdown}</div>}
              </>
            ) : (
              <>
                <img id="captured" src={imageSrc} alt="Captured" />
                <div className="button-container">
                  <button className="start-button" onClick={handleSavePicture}>
                    Save Picture
                  </button>
                  <button className="end-button" onClick={handleRetakePicture}>
                    Neues Foto
                  </button>
                </div>
              </>
            )}
          </>
        )}
      </header>
    </div>
  );
}

export default PhotoMode;
