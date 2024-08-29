import { useRef, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

// Funktion zum Verbinden des USB-Geräts
export async function connectUSBDevice(setDevice, getCameraAccess) {
  try {
    const newDevice = await navigator.usb.requestDevice({ filters: [{ vendorId: 0x054C }] }); //0x054C für Sony a7 III
    await newDevice.open();
    if (newDevice.configuration === null)
      await newDevice.selectConfiguration(1);
    await newDevice.claimInterface(0);
    setDevice(newDevice);
    console.log('Device connected:', newDevice);
    getCameraAccess(newDevice);
  } catch (error) {
    console.error('Error connecting USB device:', error);
  }
}

// Funktion zum Abrufen des Kamera-Zugriffs
export async function getCameraAccess(newDevice, videoRef, setVideoStreamActive) {
  try {
    await navigator.mediaDevices.getUserMedia({audio: false, video: true});
    console.log('Versuche, Kamerazugriff zu erhalten...');
    const devices = await navigator.mediaDevices.enumerateDevices();
    console.log('Gefundene Geräte:', devices);

    const videoDevices = devices.filter(device => device.kind === 'videoinput');
    console.log('Videogeräte:', videoDevices);

    let selectedDeviceId;
    if (newDevice) {
      selectedDeviceId = videoDevices.find(device => device.label.includes(newDevice.productName))?.deviceId;
      console.log('Ausgewähltes Gerät:', selectedDeviceId);
    }

    if (!selectedDeviceId && videoDevices.length > 0) {
      selectedDeviceId = videoDevices[0].deviceId;
      console.log('Fallback-Gerät:', selectedDeviceId);
    }

    if (selectedDeviceId) {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { deviceId: selectedDeviceId } });
      console.log('Erhaltener Stream:', stream);
      videoRef.current.srcObject = stream;
      setVideoStreamActive(true);
    } else {
      alert('Keine Kamera gefunden.');
    }
  } catch (error) {
    console.error('Fehler beim Zugriff auf die Kamera:', error);
    if (error.name === "NotAllowedError") {
      alert('Kamerazugriff wurde verweigert. Bitte erlauben Sie den Zugriff und versuchen Sie es erneut.');
    }
  }
}

// Funktion zum Umschalten der Kamera
export function handleCameraToggle(setCameraActive) {
  setCameraActive(prev => !prev);
}

// Funktion zum Starten des Countdowns
export function startCountdown(timerValue, setCountdown, takePicture) {
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
}

// Funktion zum Aufnehmen eines Fotos
export function takePicture(videoRef, canvasRef, setImageSrc, setPhotoTaken) {
  if (videoRef.current) {
    const videoWidth = videoRef.current.videoWidth;
    const videoHeight = videoRef.current.videoHeight;
    const canvas = canvasRef.current;
    canvas.width = videoWidth;
    canvas.height = videoHeight;
    const context = canvas.getContext('2d');
    context.drawImage(videoRef.current, 0, 0, videoWidth, videoHeight);
    const imageData = canvas.toDataURL('image/png');
    setImageSrc(imageData);
    setPhotoTaken(true);
  }
}

// Funktion zum Herunterladen des Bildes
export function downloadImage(imageSrc) {
  if (imageSrc) {
    const link = document.createElement('a');
    link.href = imageSrc;
    link.download = 'captured_image.png';
    link.click();
  }
}

// Funktion zum Neuaufnehmen eines Fotos
export function retakePicture(setImageSrc, setPhotoTaken) {
  setImageSrc(null);
  setPhotoTaken(false);
}

class AdminSettingsController {
  constructor() {
      this.validUsername = "Novotrend Nöthen";
      this.validPassword = "ASDjkl159";
  }

  validateLogin(username, password) {
      return username === this.validUsername && password === this.validPassword;
  }
}

export default AdminSettingsController;

// ProtectedRoute-Komponente
export function ProtectedRoute({ isAuthenticated, children }) {
    return isAuthenticated ? children : <Navigate to="/home" />;
}
