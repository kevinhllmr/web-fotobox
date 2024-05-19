import React, { useRef, useEffect, useState } from 'react';
import './App.css';

function App() {
  const videoRef = useRef(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [device, setDevice] = useState(null);

  async function connectUSBDevice() {
    try {
      const newDevice = await navigator.usb.requestDevice({ filters: [{ vendorId: 0x0 }] }); // Ersetzen Sie 0x0 durch die tatsächliche vendorId Ihres USB-Geräts
      await newDevice.open(); // Öffnen Sie das Gerät
      if (newDevice.configuration === null)
        await newDevice.selectConfiguration(1); // Wählen Sie eine Konfiguration, wenn notwendig
      await newDevice.claimInterface(0); // Beanspruchen Sie die erste Schnittstelle
      setDevice(newDevice);
      console.log('Device connected:', newDevice);
    } catch (error) {
      console.error('Error connecting USB device:', error);
    }
  }

  async function getCameraAccess() {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoRef.current.srcObject = stream;
      } catch (error) {
        console.error('Error accessing the camera:', error);
        if (error.name === "NotAllowedError") {
          alert('Kamerazugriff wurde verweigert. Bitte erlauben Sie den Zugriff und versuchen Sie es erneut.');
        }
      }
    } else {
      alert('Die MediaDevices API wird von Ihrem Browser nicht unterstützt.');
      console.error('MediaDevices API not supported by this browser.');
    }
  }

  useEffect(() => {
    getCameraAccess();
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

  return (
    <div className="App">
      <header className="App-header">
        <h1>Live Camera Feed</h1>
        <button onClick={handleCameraToggle}>
          {cameraActive ? 'Kamera ausschalten' : 'Kamera einschalten'}
        </button>
        <button onClick={connectUSBDevice}>Connect USB Device</button>
        {cameraActive && <video ref={videoRef} autoPlay playsInline />}
      </header>
    </div>
  );
}

export default App;
