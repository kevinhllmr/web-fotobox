import React, { useState, useEffect } from 'react';
import '../../App.css';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../Button.js';
import './MainPage.css';
import { lang_de } from '../langs/lang_de.js';
import { lang_en } from '../langs/lang_en.js';

function MainPage() {
    //variables for current location and react routing
    const location = useLocation();
    let navigate = useNavigate();

    //state for help modal
    const [showHelp, setShowHelp] = useState(false);
  
    //sets language
    useEffect(() => {
      if (location.pathname !== "/home/") {
        navigate(`/home/`);
      }
  
      let userLang = navigator.language || navigator.userLanguage;
  
      if (document.getElementById("imglng") !== null) {
        if (localStorage.getItem("lang") === "de") {
          lang_de();
          document.getElementById("imglng").src = process.env.PUBLIC_URL + '/images/gb.svg';
  
        } else if (localStorage.getItem("lang") === "en") {
          lang_en();
          document.getElementById("imglng").src = process.env.PUBLIC_URL + '/images/de.svg';
  
        } else if (userLang === "de") {
          lang_de();
          document.getElementById("imglng").src = process.env.PUBLIC_URL + '/images/gb.svg';
          localStorage.setItem("lang", "de");
  
        } else {
          lang_en();
          document.getElementById("imglng").src = process.env.PUBLIC_URL + '/images/de.svg';
          localStorage.setItem("lang", "en");
        }
      }

      //switch language
      document.getElementById("btn_lng").addEventListener("click", toggleLanguage);
      document.getElementById("btn_lng").addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
          toggleLanguage();
        }
      });

      document.getElementsByClassName('tablet')[0]
        .addEventListener('click', function (event) {
          navigate(`/photomode/`);
        });

      document.getElementsByClassName('phone')[0]
        .addEventListener('click', function (event) {
          navigate(`/connectphone/`);
        });

      document.getElementById('cloud').addEventListener('click', function (event) {
        navigate(`/gallery/`);
      });

      document.getElementById('settings').addEventListener('click', function (event) {
        navigate(`/admin/`);
      });
    }, []);

    async function toggleLanguage() {
      if (localStorage.getItem("lang") === "de") {
        lang_en();
        localStorage.setItem("lang", "en");
        document.getElementById("imglng").src = process.env.PUBLIC_URL + '/images/de.svg';
        document.getElementById("btn_lng").setAttribute("aria-label", "site now in english");
        await new Promise((resolve) => setTimeout(resolve, 5000));
        document.getElementById("btn_lng").setAttribute("aria-label", "switch language");
  
      } else {
        lang_de();
        localStorage.setItem("lang", "de");
        document.getElementById("imglng").src = process.env.PUBLIC_URL + '/images/gb.svg';
        document.getElementById("btn_lng").setAttribute("aria-label", "site now in german");
        await new Promise((resolve) => setTimeout(resolve, 5000));
        document.getElementById("btn_lng").setAttribute("aria-label", "switch language");
      }
    }

    return (
      <div className='hero-container'>
        <img id="bg" src={process.env.PUBLIC_URL + '/images/home-bg.png'}/>
        
        <div className="content">
          <div className="header">
            <img src={process.env.PUBLIC_URL + '/images/hsa-logo.png'} alt="HSA Logo" id="hsa-logo" />
            <img src={process.env.PUBLIC_URL + '/images/novotrend-logo.png'} alt="Novotrend Logo" id="novotrend-logo" />
          
            <span className="flags" id="btn_lng">
              <img id='imglng' alt="Language Button"></img>
            </span>
            <button className="help-button" onClick={() => setShowHelp(!showHelp)}>Help</button>
          </div>

          <div className="main-content">
            <div className="phone">
                <p id='nfc-text'>Tap Your<br></br>Phone Here</p>
                <img src={process.env.PUBLIC_URL + '/images/nfc-icon.svg'} alt="NFC" id="nfc-icon" />
              </div>
            <div className="tablet">
              <p id='tablet-text'>Use Tablet</p>
              <img src={process.env.PUBLIC_URL + '/images/tablet-icon.svg'} alt="Tablet" id="tablet-icon" />
            </div>
          </div>

          <p id='or'>or</p>

          <div className="footer">
            <p id='cloud'>Cloud Access</p>
            <p id='settings'>Admin Settings</p>
          </div> 
        </div>

        {showHelp && (
          <div className="help-modal">
            <h2>Help</h2>
            <p><strong>Fotobox benutzen</strong><br/>
              Drücken Sie auf das Tablet-Symbol, um die Fotobox zu starten.</p>
            <p><strong>Handy verbinden</strong><br/>
              Öffnen Sie die Website auf Ihrem Handy (siehe QR-Code): <em>[Website-Adresse einfügen]</em><br/>
              Drücken Sie auf das NFC-Symbol, um Ihr Handy mit dem Tablet zu verbinden (NFC-Funktion erforderlich).<br/>
              Folgen Sie den Anweisungen auf Ihrem Gerät.</p>
            <p><strong>Bilder auf das Handy übertragen</strong> (nur wenn das Handy mit dem Tablet verbunden ist):<br/>
              Öffnen Sie Cloud Access.<br/>
              Wählen Sie Ihr gewünschtes Bild aus.<br/>
              Drücken Sie auf „An Smartphone senden“.</p>
            <button onClick={() => setShowHelp(false)} className="close-help">Close</button>
          </div>
        )}
      </div>
    );
}

export default MainPage;
