import React, { useEffect, useState, useRef } from "react";
import "../../App.css";
import "./PhotoMode.css";
import { saveImageToIndexedDB, deleteLastImageFromIndexedDB, startCountdown , takePicture } from "../controllers/Controller.js";
import { useNavigate } from "react-router-dom";
import { Camera } from "../build/camera.js"; // Importiere die Camera-Klasse von web-gphoto2
import WebRTC from '../controllers/WebRTC';
import Peripherie from '../controllers/Peripherie.js';

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
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [webrtcConnected, setWebrtcConnected] = useState(false);
  const CHUNK_SIZE = 16000; // 16kB per chunk


  useEffect(() => {
    const handleUnload = async () => {
      console.log("Seite wird neugeladen, Kamera wird getrennt.");
      await cleanupResourcesGlobal();
    };

    window.addEventListener("beforeunload", handleUnload);

    const deviceUsed = localStorage.getItem('deviceUsed');
    if (deviceUsed === 'phone') {
      setButtonsShown(false);
    }

    const initializeCameraIntern = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    
        if (videoRef.current) {
          videoRef.current.pause(); // Stoppe das aktuelle Video, falls es läuft
          videoRef.current.srcObject = null; // Entferne die aktuelle Quelle
        }
    
        videoRef.current.srcObject = stream;
        await videoRef.current.play(); // Starte das Video
        setCameraActive(true);
      } catch (error) {
        console.error("Fehler beim Zugriff auf die Kamera:", error);
      }
    };

    if (!Peripherie.hasExternCamera) {
      initializeCameraIntern();
    }

    const checkWebRTCConnection = () => {
      if (WebRTC.dataChannel && WebRTC.dataChannel.readyState === 'open') {
        setButtonsShown(false);
      } else {
        setButtonsShown(true);
      }
    };

    checkWebRTCConnection();

    const peer = WebRTC.peer;
    if (peer) {
      peer.on('data', (data) => {
        handleIncomingData(data);
      });
    }

    WebRTC.onData(handleIncomingData);


    return () => {
      window.removeEventListener("beforeunload", handleUnload);
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, [camera, streamIntervalId]);


/*WEB RTC FUNCTIONS */
/*****************************************************************/
/*****************************************************************/
/*****************************************************************/
/*****************************************************************/
/*****************************************************************/

  const handleIncomingData = (data) => {
    const message = JSON.parse(data);
    switch (message.type) {
      case 'startCountdown':
        startPhotoCountdownExtern();
        break;
      case 'savePhoto':
        uploadImageToCloud(imageSrc);
        break;
      case 'retryPhoto':
        handleRetakePictureExtern();
        break;
      case 'photoData':
        handleReceivedPhotoData(message.data);
        break;
      default:
        break;
    }
  };

  const sendPhotoData = (photoDataUrl) => {
    if (WebRTC.dataChannel && WebRTC.dataChannel.readyState === 'open') {
      const chunks = splitIntoChunks(photoDataUrl, CHUNK_SIZE);

      chunks.forEach((chunk, index) => {
        const message = JSON.stringify({
          type: 'photoData',
          data: chunk,
          index,
          totalChunks: chunks.length
        });

        console.log(`Sending chunk ${index + 1}/${chunks.length}:`, message);
        WebRTC.sendMessage(message);
      });
    } else {
      console.log('Data channel is not open. Unable to send photo data.');
    }
  };

  const splitIntoChunks = (data, chunkSize) => {
    const chunks = [];
    for (let i = 0; i < data.length; i += chunkSize) {
      chunks.push(data.substring(i, i + chunkSize));
    }
    return chunks;
  };

  const handleReceivedPhotoData = (photoData) => {
    const link = document.createElement('a');
    link.href = photoData;
    link.download = 'photo.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


/*Photomode FUNCTIONS EXTERN/INTERN */
/*****************************************************************/
/*****************************************************************/
/*****************************************************************/
/*****************************************************************/
/*****************************************************************/

  /*Intern Functions*/
  /*****************************************************************/
  const handleRetakeIntern=async () => {
    setImageSrc(null);
    setPhotoTaken(false);
    setButtonsShown(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  
      if (videoRef.current) {
        videoRef.current.pause(); // Stoppe das aktuelle Video, falls es läuft
        videoRef.current.srcObject = null; // Entferne die aktuelle Quelle
      }
  
      videoRef.current.srcObject = stream;
      await videoRef.current.play(); // Starte das Video
      setCameraActive(true);
    } catch (error) {
      console.error("Fehler beim Zugriff auf die Kamera:", error);
    }
  }

  const handleSavePhotoIntern = async () => {
    if (imageSrc) {
      const blob = await fetch(imageSrc).then((res) => res.blob());
      saveImageToIndexedDB(blob);
      handleRetakeIntern();
    }
  };

  const handleStartCountdownIntern = () => {
    startCountdown(3, setCountdown, () => {
      takePicture(videoRef, canvasRef, setImageSrc, setPhotoTaken);
    });
  };


  /*Extern Functions*/
  /*****************************************************************/
  const handleRetakePictureExtern = () => {
    setImageSrc(null);
    setPhotoTaken(false);
    setCameraActive(false);
    setButtonsShown(true);
    setTimeout(() => {
      setCameraActive(true);
    }, 1);
  };

  const handleDeleteLastPhotoExtern = async () => {
    console.log("Foto verwerfen...");
    await deleteLastImageFromIndexedDB();
    setImageSrc(null); // Bildquelle zurücksetzen
    setPhotoTaken(false); // Zustand zurücksetzen
    setButtonsShown(true); // Zeige die Buttons wieder an
  };



  const startPhotoCountdownExtern = () => {
    console.log("Starting photo countdown...");
    setButtonsShown(false);
    startCountdown(timerValue, setCountdown, capturePictureExtern);
  };


  const capturePictureExtern = async () => {
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

  const handleStartAppExtern = () => {
    console.log("Starting camera app...");
    initializeCameraExtern();
  };

  const initializeCameraExtern = async () => {
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
          startVideoStreamExtern(newCamera);
        } catch (error) {
          console.error("Fehler beim Abrufen der Kamera-Vorschau:", error);
        }
      }, 1000);
    } catch (error) {
      console.error("Fehler bei der Kamera-Initialisierung:", error);
    }
  };

  const startVideoStreamExtern = (camera) => {
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

  /*Global Functions*/
  /*****************************************************************/
  const handleEndSessionGlobal = async () => {
    console.log("Seite wird verlassen, Kamera wird getrennt.");
    await cleanupResourcesGlobal();
    navigate("/home/");
    window.location.reload();
  };

  const cleanupResourcesGlobal = async () => {
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

  return (
    <div className="PhotoMode">
      <img
        id="bg"
        src={process.env.PUBLIC_URL + "/images/home-bg.png"}
        alt="Background"
      />
      <header className="App-header">
        {Peripherie.hasExternCamera ? (
          !cameraActive ? (
            <>
              <button className="start-button" onClick={handleStartAppExtern}>
                Start
              </button>
              <div className="instructions">
                <ol>
                  <li>Drücke Start</li>
                  <li>Wähle die Kamera aus (die einzige Option)</li>
                  <li>Drücke auf Verbinden.</li>
                </ol>
              </div>
              <div className="footer">
                <p id="back-button" onClick={handleEndSessionGlobal}>zurück</p>
              </div>
            </>
          ) : (
            <>
              {!photoTaken ? (
                <>
                  <img src={blobURL} alt="Camera Preview" className="camera-preview" />
                  {showButtons && (
                    <div className="button-container">
                      <button className="start-button" onClick={startPhotoCountdownExtern}>
                        Starte Countdown
                      </button>
                      <button className="end-button" onClick={handleEndSessionGlobal}>
                        Sitzung beenden
                      </button>
                    </div>
                  )}
                  {countdown > 0 && <div className="countdown">{countdown}</div>}
                </>
              ) : (
                <>
                  <img className="camera-preview" src={imageSrc} alt="Captured" />
                  <div className="button-container">
                    <button className="start-button" onClick={handleRetakePictureExtern}>
                      Foto speichern
                    </button>
                    <button className="end-button" onClick={handleDeleteLastPhotoExtern}>
                      Foto verwerfen
                    </button>
                  </div>
                </>
              )}
            </>
          )
        ) : (
          <>
            {!photoTaken ? (
              <>
                <video ref={videoRef} className="camera-preview" playsInline />
                <canvas ref={canvasRef} style={{ display: "none" }} />
                {countdown > 0 && <div className="countdown">{countdown}</div>}
                <div className="button-container">
                  <button className="start-button" onClick={handleStartCountdownIntern}>
                    Starte Countdown
                  </button>
                  <button className="end-button" onClick={handleEndSessionGlobal}>
                        Sitzung beenden
                      </button>
                </div>
              </>
            ) : (
              <>
                <img className="camera-preview" src={imageSrc} alt="Captured" />
                <div className="button-container">
                  <button className="start-button" onClick={handleSavePhotoIntern}>
                    Foto speichern
                  </button>
                  <button
                    className="end-button"
                    onClick={() => {
                      handleRetakeIntern();
                    }}
                  >
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
