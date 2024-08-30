import React, { useEffect } from 'react';
import '../../App.css';
import './Settings.css'; 
import { useNavigate } from 'react-router-dom';

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

  // Funktion für den Zurück-Button
  const handleBackClick = () => {
    setIsAuthenticated(false);  // Benutzer abmelden
    navigate('/home/');
  };

  return (
    <div className="settings-container">
      <img id="bg" src={process.env.PUBLIC_URL + '/images/home-bg.png'} alt="Background" />
      <div className="header">
          <img src={process.env.PUBLIC_URL + '/images/hsa-logo.png'} alt="HSA Logo" id="hsa-logo" />
          <img src={process.env.PUBLIC_URL + '/images/novotrend-logo.png'} alt="Novotrend Logo" id="novotrend-logo" />
      
          <span className="flags" id="btn_lng">
            <img id='imglng' alt="Language Button"></img>
          </span>
      </div>
      <div className = "itemContainer">
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
      </div>
      <div className="footer">
        <p id="back-button" onClick={handleBackClick}>zurück</p>
      </div>
    </div>
  );
}

export default Settings;
