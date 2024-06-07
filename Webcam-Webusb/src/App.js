import React, { useRef, useEffect, useState } from 'react';
import './App.css';

function App() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [device, setDevice] = useState(null);
  const [imageSrc, setImageSrc] = useState(null);
  const [photoTaken, setPhotoTaken] = useState(false);
  const [videoStreamActive, setVideoStreamActive] = useState(false); // Neuer Zustand für Video-Stream
  const [timerValue, setTimerValue] = useState(3); // Timer Slider value
  const [countdown, setCountdown] = useState(0); // Countdown value

  async function connectUSBDevice() {
    try {
      const newDevice = await navigator.usb.requestDevice({ filters: [{ vendorId: 0x054C }] }); // Ersetzen Sie 0x054C (Sony Alpha7 III) durch die tatsächliche vendorId Ihres USB-Geräts
      await newDevice.open(); // Öffnen Sie das Gerät
      if (newDevice.configuration === null)
        await newDevice.selectConfiguration(1); // Wählen Sie eine Konfiguration, wenn notwendig
      await newDevice.claimInterface(0); // Beanspruchen Sie die erste Schnittstelle
      setDevice(newDevice);
      console.log('Device connected:', newDevice);
      // Nachdem das USB-Gerät verbunden ist, erhalten wir die Kamera-ID und starten die Kamera
      getCameraAccess(newDevice);
    } catch (error) {
      console.error('Error connecting USB device:', error);
    }
  }

  async function getCameraAccess(newDevice) {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      let selectedDeviceId;

      // Wenn ein USB-Gerät verbunden ist, suchen wir nach einer Kamera mit der gleichen deviceId
      if (newDevice) {
        selectedDeviceId = videoDevices.find(device => device.label.includes(newDevice.productName))?.deviceId;
      }

      if (!selectedDeviceId && videoDevices.length > 0) {
        selectedDeviceId = videoDevices[0].deviceId; // Fallback zur ersten Kamera
      }

      if (selectedDeviceId) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { deviceId: selectedDeviceId } });
        videoRef.current.srcObject = stream;
        setVideoStreamActive(true); // Video-Stream ist aktiv
      } else {
        alert('Keine Kamera gefunden.');
      }
    } catch (error) {
      console.error('Error accessing the camera:', error);
      if (error.name === "NotAllowedError") {
        alert('Kamerazugriff wurde verweigert. Bitte erlauben Sie den Zugriff und versuchen Sie es erneut.');
      }
    }
  }

  useEffect(() => {
    if (cameraActive) {
      getCameraAccess();
    } else {
      setVideoStreamActive(false); // Video-Stream ist nicht aktiv
    }
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
    };
  }, [cameraActive]);

  const handleCameraToggle = () => {
    setCameraActive(prev => !prev);
  };

  const startCountdown = () => {
    setCountdown(timerValue);
    const interval = setInterval(() => {
      setCountdown(prevCountdown => {
        if (prevCountdown === 1) {
          clearInterval(interval);
          takePicture();
          return 0;
        } else {
          return prevCountdown - 1;
        }
      });
    }, 1000);
  };

  const takePicture = () => {
    if (videoRef.current) {
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const imageData = canvas.toDataURL('image/png');
      setImageSrc(imageData);
      setPhotoTaken(true);
    }
  };

  const downloadImage = () => {
    if (imageSrc) {
      const link = document.createElement('a');
      link.href = imageSrc;
      link.download = 'captured_image.png';
      link.click();
    }
  };

  const retakePicture = () => {
    setImageSrc(null);
    setPhotoTaken(false);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Live Camera Feed</h1>
        {!photoTaken ? (
          <>
            <button onClick={handleCameraToggle}>
              {cameraActive ? 'Kamera ausschalten' : 'Kamera einschalten'}
            </button>
            <button onClick={connectUSBDevice}>Connect USB Device</button>
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
                <button onClick={startCountdown}>Take Picture</button>
              </>
            )}
            {countdown > 0 && <div className="countdown">{countdown}</div>}
          </>
        ) : (
          <>
            <img src={imageSrc} alt="Captured" />
            <button onClick={downloadImage}>Download Image</button>
            <button onClick={retakePicture}>Neues Foto</button>
          </>
        )}
      </header>
    </div>
  );
}

export default App;
  