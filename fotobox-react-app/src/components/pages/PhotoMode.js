import React, { useRef, useEffect, useState } from "react";
import "../../App.css";
import "./PhotoMode.css";
import { saveImageToIndexedDB, startCountdown } from "../controllers/Controller.js";
import { useNavigate } from "react-router-dom";
import { Camera } from "../build/camera.js"; // Importiere die Camera-Klasse von web-gphoto2

function PhotoMode() {
  const navigate = useNavigate();
  const [cameraActive, setCameraActive] = useState(false);
  const [imageSrc, setImageSrc] = useState(null);
  const [photoTaken, setPhotoTaken] = useState(false);
  const [showButtons, setButtonsShown] = useState(false);
  const [timerValue, setTimerValue] = useState(3);
  const [countdown, setCountdown] = useState(0);
  const [device, setDevice] = useState(null); // Zuständig für das Kameragerät
  const camera = new Camera(); // Kamera-Instanz

  const [blobURL, setBlobURL] = useState(null); // Hier speichern wir den Blob-URL für die Vorschau

  // Initialisiere die Kamera
  const initializeCamera = async () => {
    try {
      console.log("Initializing camera...");
      // Zeige den Picker, um verfügbare Kameras auszuwählen
      await Camera.showPicker();

      // Verbinde mit der Kamera
      await camera.connect();

      console.log("Operations supported by the camera:", await camera.getSupportedOps());
      console.log("Current configuration tree:", await camera.getConfig())

      // Sicherstellen, dass die Kamera vollständig verbunden ist, bevor wir fortfahren
      setTimeout(async () => {
        try {
          // Hole den ersten Blob von der Kamera für die Vorschau
          const blob = await camera.capturePreviewAsBlob();
          const imgURL = URL.createObjectURL(blob);

          // Speichere den URL, um ihn in einem <img>-Tag anzuzeigen
          setBlobURL(imgURL);

          // Kamera für das Preview-Stream vorbereiten
          setCameraActive(true);
          setButtonsShown(true); // Zeige Buttons nach erfolgreicher Initialisierung

          // Starte die kontinuierliche Frame-Abfrage für flüssige Vorschau
          startVideoStream();
        } catch (error) {
          console.error("Fehler beim Abrufen der Kamera-Vorschau:", error);
        }
      }, 1000); // Verzögerung, damit die Kamera sicher verbunden ist

    } catch (error) {
      console.error("Fehler bei der Kamera-Initialisierung:", error);
    }
  };

  // Funktion zum kontinuierlichen Abrufen von Kameraframes
  const startVideoStream = () => {
    const intervalId = setInterval(async () => {
      try {
        // Hole den nächsten Frame als Blob
        const blob = await camera.capturePreviewAsBlob();
        const imgURL = URL.createObjectURL(blob);
        setBlobURL(imgURL); // Setze die URL des Blobs für die Vorschau
      } catch (error) {
        console.error("Fehler beim Abrufen des Kamera-Streams:", error);
        clearInterval(intervalId); // Stoppe das Intervall bei Fehlern
      }
    }, 50); // Alle 50ms den nächsten Frame abfragen (20fps)
  };

  // Effekt zur Überwachung von cameraActive und videoRef
  useEffect(() => {
    if (cameraActive && !device) {
      console.log("Starting camera initialization...");
      initializeCamera();
    }
  }, [cameraActive]);

  // Handling für den Start der Kamera-App
  const handleStartApp = () => {
    console.log("Starting camera app...");
    setCameraActive(true);
  };

  const handleRetakePicture = () => {
    console.log("Retaking picture...");
    setImageSrc(null);
    setPhotoTaken(false);
    setCameraActive(false);
    setButtonsShown(false);
    setTimeout(() => {
      setCameraActive(true); // Starte die Kamera nach einem Retake
    }, 2000);
  };

  const handleEndSession = () => {
    console.log("Ending session...");
    // Kamera-Verbindung trennen, wenn der Benutzer die Sitzung beendet
    try {
      camera.disconnect();
      console.log("Kamera getrennt");
    } catch (error) {
      console.error("Fehler beim Trennen der Kamera:", error);
    }

    handleRetakePicture(); // Nach dem Beenden der Sitzung Retake
    navigate("/home/");
  };

  const startPhotoCountdown = () => {
    console.log("Starting photo countdown...");
    setButtonsShown(false);
    startCountdown(timerValue, setCountdown, capturePicture); // Aufrufen von capturePicture nach Countdown
  };

  const handleSavePicture = () => {
    console.log("Saving picture...");
    saveImageToIndexedDB(imageSrc); // Bild in IndexedDB speichern
    handleRetakePicture(); // Nach dem Speichern Retake
  };

  const capturePicture = async () => {
    try {

      console.log("Operations supported by the camera:", await camera.getSupportedOps());
      console.log("Current configuration tree:", await camera.getConfig())
  
      // Hole das vollständige Bild von der Kamera
      const file = await camera.captureImageAsFile();
      
      // Erstelle eine URL aus der Datei (z. B. JPEG)
      const imgURL = URL.createObjectURL(file);
  
      // Zeige das aufgenommene Bild an
      setImageSrc(imgURL);
      setBlobURL(null); // Stoppe den Live-Stream, indem wir den Bild-URL setzen
      setPhotoTaken(true); // Bild aufgenommen

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
          // Zeige Start-Button vor Kamera-Initialisierung
          <button className="start-button" onClick={handleStartApp}>
            Start
          </button>
        ) : (
          <>
            {!photoTaken ? (
              <>
                {/* Zeige das Bild vom Stream */}
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
                {/* Zeige das aufgenommene Bild an */}
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
