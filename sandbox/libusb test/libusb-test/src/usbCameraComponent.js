import React, { useState, useEffect } from "react";

const UsbCameraComponent = () => {
  const [cameraConnected, setCameraConnected] = useState(false);

  const connectToCamera = async () => {
    try {
      const device = await navigator.usb.requestDevice({ filters: [{ vendorId: 0x1234 }] }); // Ersetze "vendorId" mit der ID deiner Kamera.
      await device.open();
      if (device.configuration === null) {
        await device.selectConfiguration(1);
      }
      await device.claimInterface(0);
      setCameraConnected(true);
    } catch (error) {
      console.error("Kamera-Verbindung fehlgeschlagen:", error);
    }
  };

  const captureImage = async () => {
    if (!cameraConnected) return;
    // Daten von der Kamera abrufen
    try {
      const result = await device.transferIn(1, 64); // Transfer-Größe und Endpunkt anpassen
      console.log("Bilddaten:", result.data);
    } catch (error) {
      console.error("Fehler beim Abrufen der Bilddaten:", error);
    }
  };

  return (
    <div>
      <h1>USB Kamera Anwendung</h1>
      <button onClick={connectToCamera}>Mit Kamera verbinden</button>
      {cameraConnected && <button onClick={captureImage}>Bild aufnehmen</button>}
    </div>
  );
};

export default UsbCameraComponent;
