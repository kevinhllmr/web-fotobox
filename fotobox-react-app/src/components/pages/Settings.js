import React, { useEffect, useState } from 'react';
import '../../App.css';
import './Settings.css'; 
import { useNavigate } from 'react-router-dom';
import Peripherie from "../controllers/Peripherie";  // Import der Peripherie-Daten
import AdminSettingsController, {deleteDataFromIndexedDB} from '../controllers/Controller'; // Import der Controller-Klasse

function Settings({ setIsAuthenticated }) {
  const navigate = useNavigate();
  const controller = new AdminSettingsController();  // Controller instanziieren

  // Zustand für die Schalter
  const [isCameraOn, setIsCameraOn] = useState(Peripherie.hasExternCamera);
  const [isCloudAccessOn, setIsCloudAccessOn] = useState(Peripherie.cloudAccess); // Zustand für Cloud Access
  const [vendorID, setVendorID] = useState(`0x${Peripherie.vendorID.toString(16).toUpperCase()}`);  // In String umwandeln
  const [cloudAdress] = useState(Peripherie.cloudAdress);

  const handleToggleCamera = () => {
    setIsCameraOn(!isCameraOn);  // Toggle-Zustand wechseln
    controller.toggleExternCamera();  // Verwende den Controller, um die Daten in Peripherie zu aktualisieren
  };

  const handleToggleCloudAccess = () => {
    setIsCloudAccessOn(!isCloudAccessOn);  // Toggle-Zustand wechseln
    controller.toggleCloudAccess();  // Verwende den Controller, um die Daten in Peripherie zu aktualisieren
  };

  const handleVendorIDChange = (e) => {
    setVendorID(e.target.value);  // Setze den VendorID Zustand als String
  };

  const handleVendorIDUpdate = () => {
    const newVendorID = parseInt(vendorID, 16);  // Konvertiere String zurück in eine Zahl im Hexadezimalformat
    controller.updateVendorID(newVendorID);  // Verwende den Controller, um die Vendor ID zu aktualisieren
  };

  const handleCloudAdressChange = () => {
    controller.updateCloudAddress(cloudAdress);  // Verwende den Controller, um die Cloud-Adresse zu aktualisieren
  };

  const handleShowPeripherieData = () => {
    alert(JSON.stringify(Peripherie, null, 2));  // Zeige alle Daten in einem Alert an
  };

  // Funktion zum Handling beim Verlassen der Seite
  const handleBeforeUnload = () => {
    setIsAuthenticated(false);
  };

  // Event Listeners hinzufügen und entfernen
  useEffect(() => {
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handleBeforeUnload); // Zurückknopf des Browsers

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handleBeforeUnload);
    };
  }, []);

  // Funktion für den Zurück-Button
  const handleBackClick = () => {
    setIsAuthenticated(false);  // Benutzer abmelden
    navigate('/home/');
  };

  const handleDeleteFotos = () => {
    deleteDataFromIndexedDB();
  };

  

  return (
    <div className="settings-container">
      <img id="bg" src={process.env.PUBLIC_URL + '/images/home-bg.png'} alt="Background" />
      <div className="header">
          <img src={process.env.PUBLIC_URL + '/images/hsa-logo.png'} alt="HSA Logo" id="hsa-logo" />
          <img src={process.env.PUBLIC_URL + '/images/novotrend-logo.png'} alt="Novotrend Logo" id="novotrend-logo" />
      
      </div>
      <div className="itemContainer">
        <h2>Admin Einstellungen</h2>
        <div className="settings-item">
          <label>Externe Kamera</label>
          {/* Toggle-Switch für Externe Kamera */}
          <label className="switch">
            <input type="checkbox" checked={isCameraOn} onChange={handleToggleCamera} />
            <span className="slider"></span>
          </label>
        </div>
        
        {/* Anzeige der Vendor ID nur wenn die Kamera aktiv ist */}
        {isCameraOn && (
          <div className="settings-item">
            <label>Vendor ID</label>
            <input 
              type="text" 
              placeholder="Suche nach..." 
              value={vendorID} 
              onChange={handleVendorIDChange}  // Setze den VendorID Zustand als String
            />
            <button onClick={handleVendorIDUpdate}>Aktualisieren</button>
          </div>
        )}

        <div className="settings-item">
          <label>Cloud Access</label>
          {/* Toggle-Switch für Cloud Access */}
          <label className="switch">
            <input type="checkbox" checked={isCloudAccessOn} onChange={handleToggleCloudAccess} />
            <span className="slider"></span>
          </label>
        </div>

        {/* Button zum Löschen aller IndexDB-Daten */}
        <div className="settings-item">
          <button onClick={handleDeleteFotos}>Lösche alle Fotos</button>
        </div>

        {/* Button zum Anzeigen aller Peripherie-Daten */}
        <div className="settings-item">
          <button onClick={handleShowPeripherieData}>Zeige Peripherie-Daten</button>
        </div>
      </div>
      <div className="footer">
        <p id="back-button" onClick={handleBackClick}>zurück</p>
      </div>
    </div>
  );
}

export default Settings;
