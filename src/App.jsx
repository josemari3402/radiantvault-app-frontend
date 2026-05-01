import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios'; // Critical for backend communication
import LoadoutLab from './components/LoadoutLab';
import './App.css';
import bgImage from './assets/background.png';
import loginBGM from './assets/login_bgm.mp3';
import labBGM from './assets/lab_bgm.mp3';
import hoverSFX from './assets/Hover.mp3';
import chooseSFX from './assets/Choose.mp3';
import gridHoverSFX from './assets/Gun grid hover.mp3';
import gridSelectSFX from './assets/Gun grid select.mp3';
import variantSelectSFX from './assets/Variant select.mp3';

// The connection point to your Flask Brain
const API_BASE_URL = 'http://127.0.0.1:5000/api';

function App() {
  const [inLab, setInLab] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [bgmVolume, setBgmVolume] = useState(0.5);
  const [sfxVolume, setSfxVolume] = useState(0.5);

  const audioLogin = useRef(new Audio(loginBGM));
  const audioLab = useRef(new Audio(labBGM));
  
  const sfxHover = useRef(new Audio(hoverSFX));
  const sfxChoose = useRef(new Audio(chooseSFX));
  const sfxGridHover = useRef(new Audio(gridHoverSFX));
  const sfxGridSelect = useRef(new Audio(gridSelectSFX));
  const sfxVariant = useRef(new Audio(variantSelectSFX));

  const playSFX = (ref) => {
    ref.current.currentTime = 0;
    ref.current.volume = sfxVolume;
    ref.current.play().catch(() => {});
  };

  useEffect(() => {
    audioLogin.current.loop = true;
    audioLab.current.loop = true;
    if (!inLab) {
      audioLab.current.pause();
      audioLogin.current.play().catch(() => {});
    } else {
      audioLogin.current.pause();
      audioLab.current.play().catch(() => {});
    }
  }, [inLab]);

  useEffect(() => {
    audioLogin.current.volume = bgmVolume;
    audioLab.current.volume = bgmVolume;
  }, [bgmVolume]);

  const isValid = username.length >= 3 && username.length <= 16 && 
                  password.length >= 3 && password.length <= 16;

  // UPDATED: handleAuth now sends data to Flask/MongoDB
  const handleAuth = async () => {
    const endpoint = isSigningUp ? '/signup' : '/login';
    try {
      const response = await axios.post(`${API_BASE_URL}${endpoint}`, {
        username,
        password
      });
      
      if (isSigningUp) {
        alert("PROTOCOL ESTABLISHED. LOGIN TO CONTINUE.");
        setIsSigningUp(false);
        setPassword('');
      } else {
        // Response data will contain { username, loadout } from MongoDB
        setCurrentUser(response.data); 
        setInLab(true);
      }
    } catch (err) {
      // Displays the specific error message from your Flask backend
      alert(err.response?.data?.message || "VAULT CONNECTION ERROR");
    }
  };

  // UPDATED: handleSaveLoadout now synchronizes with the MongoDB Vault
  const handleSaveLoadout = async (newLoadout) => {
    console.log("Attempting to save for:", currentUser.username);
    try {
      await axios.post(`${API_BASE_URL}/save-loadout`, {
        username: currentUser.username, // MongoDB uses 'username' field
        loadout: newLoadout
      });
      console.log("Loadout Synchronized.");
    } catch (err) {
      console.error("Sync Failure:", err);
    }
  };

  return (
    <div className="App">
      {!inLab ? (
        <div className="landing-page" style={{ backgroundImage: `url(${bgImage})` }}>
          <div className="login-overlay">
            <div className="login-box">
              <h1 className="auth-header">{isSigningUp ? "CREATE ACCOUNT" : "AUTHENTICATE"}</h1>
              <input type="text" className="username-input" placeholder="AGENT ID" value={username} maxLength={16} 
                onChange={(e) => setUsername(e.target.value)} onMouseEnter={() => playSFX(sfxHover)} />
              
              <input type="password" className="username-input pass-input" placeholder="ACCESS KEY" value={password} maxLength={16} 
                onChange={(e) => setPassword(e.target.value)} onMouseEnter={() => playSFX(sfxHover)} />
              
              <button className="initialize-btn" disabled={!isValid} 
                onClick={() => { playSFX(sfxChoose); handleAuth(); }} 
                onMouseEnter={() => playSFX(sfxHover)}>
                {isSigningUp ? "REGISTER AGENT" : "INITIALIZE PROTOCOL"}
              </button>

              <button className="signup-toggle" 
                onClick={() => { playSFX(sfxChoose); setIsSigningUp(!isSigningUp); setPassword(''); }}
                onMouseEnter={() => playSFX(sfxHover)}>
                {isSigningUp ? "ALREADY HAVE AN ACCOUNT? LOGIN" : "NEW AGENT? SIGN UP"}
              </button>

              <div className="dual-volume-container">
                <div className="vol-item"><span className="vol-label">SFX</span>
                  <input type="range" min="0" max="1" step="0.01" value={sfxVolume} onChange={(e) => setSfxVolume(e.target.value)} className="tactical-slider" />
                </div>
                <div className="vol-item"><span className="vol-label">AUDIO</span>
                  <input type="range" min="0" max="1" step="0.01" value={bgmVolume} onChange={(e) => setBgmVolume(e.target.value)} className="tactical-slider" />
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <LoadoutLab 
          agentName={currentUser.username} // Updated to match MongoDB field[cite: 3]
          initialLoadout={currentUser.loadout}
          bgmVolume={bgmVolume} sfxVolume={sfxVolume}
          onBgmChange={setBgmVolume} onSfxChange={setSfxVolume}
          onHover={() => playSFX(sfxHover)}
          onChoose={() => playSFX(sfxChoose)}
          onGridHover={() => playSFX(sfxGridHover)}
          onGridSelect={() => playSFX(sfxGridSelect)}
          onVariantSelect={() => playSFX(sfxVariant)}
          onSave={handleSaveLoadout} 
          onLogout={() => { playSFX(sfxChoose); setInLab(false); setPassword(''); }} 
        />
      )}
    </div>
  );
}

export default App;