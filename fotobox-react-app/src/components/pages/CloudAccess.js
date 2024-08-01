import React, { useState, useEffect } from 'react'
import '../../App.css'
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../Button.js'
import './CloudAccess.css'
import { lang_de } from '../langs/lang_de.js';
import { lang_en } from '../langs/lang_en.js';

function CloudAccess() {
  
    return (
      <div className='hero-container'>
        <img id="bg" src={process.env.PUBLIC_URL + '/images/home-bg.png'}/>        
      </div>
    )
  }
  
  export default CloudAccess