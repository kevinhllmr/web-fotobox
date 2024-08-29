import React, { useState } from 'react';
import '../../App.css';
import './AdminSettings.css';
import { useNavigate } from 'react-router-dom';
import AdminSettingsController from '../controllers/Controller';

function AdminSettings({ setIsAuthenticated }) {  // Füge Prop für setIsAuthenticated hinzu
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const controller = new AdminSettingsController();  // Hier mit 'new' instanziieren

    const handleLogin = () => {
        if (controller.validateLogin(username, password)) {
            setIsAuthenticated(true);  // Setze Authentifizierung auf true
            navigate('/admin/settings');
        } else {
            alert("Ungültiger Benutzername oder Passwort.");
            setIsAuthenticated(false);  // Setze Authentifizierung auf false
        }
    };

    const handleBack = () => {
        setIsAuthenticated(false);  // Benutzer abmelden
        navigate('/home/');
    };

    return (
        <div className='hero-container'>
            <img id="bg" src={process.env.PUBLIC_URL + '/images/home-bg.png'} alt="Background" />
            <div className="login-container">
                <h2>Admin Einstellungen</h2>
                <form onSubmit={(e) => e.preventDefault()}>
                    <label htmlFor="username">Name</label>
                    <input 
                        type="text" 
                        id="username" 
                        name="username" 
                        value={username} 
                        onChange={(e) => setUsername(e.target.value)} 
                        placeholder="Name"
                        required 
                    />

                    <label htmlFor="password">Passwort</label>
                    <input 
                        type="password" 
                        id="password" 
                        name="password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        required 
                    />

                    <button type="button" id="login-button" onClick={handleLogin}>
                        Anmelden
                    </button>
                </form>
                <button id="back-link" onClick={handleBack}>
                    zurück
                </button>
            </div>
        </div>
    );
}

export default AdminSettings;
