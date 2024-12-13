import React, { useEffect, useState } from "react";
import "../../App.css";
import "./PhotoMode.css";
import { saveImageToIndexedDB, deleteLastImageFromIndexedDB, startCountdown } from "../controllers/Controller.js";
import { useNavigate } from "react-router-dom";
import { Camera } from "../build/camera.js"; // Importiere die Camera-Klasse von web-gphoto2

function PhotoMode() {
  const navigate = useNavigate();
  const [camera, setCamera] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [imageSrc, setImageSrc] = useState(null);
  const [photoTaken, setPhotoTaken] = useState(false);
  const [showButtons, setButtonsShown] = useState(false);
  const [timerValue, setTimerValue] = useState(3);
  const [countdown, setCountdown] = useState(0);
  const [blobURL, setBlobURL] = useState(null);
  const [streamIntervalId, setStreamIntervalId] = useState(null); // Intervall-ID für den Stream

  useEffect(() => {
    const handleUnload = async () => {
      console.log("Seite wird neugeladen, Kamera wird getrennt.");
      await cleanupResources();
    };

    window.addEventListener("beforeunload", handleUnload);

    return () => {
      window.removeEventListener("beforeunload", handleUnload);
    };
  }, [camera, streamIntervalId]);

  const cleanupResources = async () => {
    if (streamIntervalId) {
      clearInterval(streamIntervalId);
      setStreamIntervalId(null);
      console.log("Video-Stream gestoppt.");
    }
    if (camera) {
      try {
        await camera.disconnect();
        console.log("Kamera erfolgreich getrennt.");
        setCamera(null);
      } catch (error) {
        console.error("Fehler beim Trennen der Kamera:", error);
      }
    }
  };

  const initializeCamera = async () => {
    try {
      console.log("Initializing camera...");
      const newCamera = new Camera();
      await Camera.showPicker(); // Zeige den Picker
      await newCamera.connect(); // Verbinde mit der Kamera
      setCamera(newCamera);

      console.log("Operations supported by the camera:", await newCamera.getSupportedOps());
      console.log("Current configuration tree:", await newCamera.getConfig());

      // Vorschau starten
      setTimeout(async () => {
        try {
          const blob = await newCamera.capturePreviewAsBlob();
          const imgURL = URL.createObjectURL(blob);
          setBlobURL(imgURL);
          setCameraActive(true);
          setButtonsShown(true);
          startVideoStream(newCamera);
        } catch (error) {
          console.error("Fehler beim Abrufen der Kamera-Vorschau:", error);
        }
      }, 1000);
    } catch (error) {
      console.error("Fehler bei der Kamera-Initialisierung:", error);
    }
  };

  const startVideoStream = (camera) => {
    const intervalId = setInterval(async () => {
      try {
        const blob = await camera.capturePreviewAsBlob();
        const imgURL = URL.createObjectURL(blob);
        setBlobURL(imgURL);
      } catch (error) {
        console.error("Fehler beim Abrufen des Kamera-Streams:", error);
        clearInterval(intervalId);
        setStreamIntervalId(null);
      }
    }, 50);
    setStreamIntervalId(intervalId); // Speichere die Intervall-ID
  };

  const handleStartApp = () => {
    console.log("Starting camera app...");
    initializeCamera();
  };

  const handleRetakePicture = () => {
    console.log("Retaking picture...");
    setImageSrc(null);
    setPhotoTaken(false);
    setButtonsShown(true);
  };

  const handleDeleteLastPhoto = async () => {
    console.log("Foto verwerfen...");
    await deleteLastImageFromIndexedDB();
    setImageSrc(null); // Bildquelle zurücksetzen
    setPhotoTaken(false); // Zustand zurücksetzen
    setButtonsShown(true); // Zeige die Buttons wieder an
  };
  

  const handleEndSession = async () => {
    console.log("Seite wird verlassen, Kamera wird getrennt.");
    await cleanupResources();
    navigate("/home/");
    window.location.reload();
  };

  const startPhotoCountdown = () => {
    console.log("Starting photo countdown...");
    setButtonsShown(false);
    startCountdown(timerValue, setCountdown, capturePicture);
  };

  const capturePicture = async () => {
    if (!camera) {
      console.error("Kamera ist nicht verbunden.");
      return;
    }

    try {
      console.log("Taking picture...");
      const file = await camera.captureImageAsFile();
      saveImageToIndexedDB(file);
      const imgURL = URL.createObjectURL(file);
      setImageSrc(imgURL);
      
      setBlobURL(null);
      setPhotoTaken(true);
    } catch (error) {
      console.error("Fehler beim Aufnehmen des Bildes:", error);
    }
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
          <button className="start-button" onClick={handleStartApp}>
            Start
          </button>
        ) : (
          <>
            {!photoTaken ? (
              <>
                <img src={blobURL} alt="Camera Preview" className="camera-preview" />
                {showButtons && (
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
                  </div>
                )}
                {countdown > 0 && <div className="countdown">{countdown}</div>}
              </>
            ) : (
              <>
                <img class="camera-preview" src={imageSrc} alt="Captured" />
                <div className="button-container">
                  <button className="start-button" onClick={handleRetakePicture}>
                    Neues Foto
                  </button>
                  <button className="end-button" onClick={handleDeleteLastPhoto}>
                    Foto verwerfen
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
