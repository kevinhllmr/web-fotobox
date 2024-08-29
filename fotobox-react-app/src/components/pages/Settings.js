import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Settings.css'; // Sicherstellen, dass diese Datei existiert und korrekt geschrieben ist

function Settings({ setIsAuthenticated }) {
  const navigate = useNavigate();

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

  const handleBackClick = () => {
    setIsAuthenticated(false);  // Benutzer abmelden
    navigate('/home/');
  };

  return (
    <div className="settings-container">
      <h2>Admin Einstellungen</h2>
      <div className="settings-item">
        <label>Externe Kamera</label>
        <button>An</button>
        <button>Aus</button>
      </div>

      <div className="settings-item">
        <label>Vendor ID</label>
        <input type="text" placeholder="Suche nach..." />
        <button>Suche nach...</button>
      </div>

      <div className="settings-item">
        <label>Cloud Adresse:</label>
        <input type="text" placeholder="https://cloud.hs-anhalt.de/" />
        <button>Eingabe</button>
      </div>

      <button className="back-button" onClick={handleBackClick}>zurück</button>
    </div>
  );
}

export default Settings;
