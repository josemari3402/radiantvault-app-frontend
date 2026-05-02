import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios'; 
import LoadoutLab from './components/LoadoutLab';
import Nightmarket from './components/nightmarket'; // Lowercase path[cite: 4, 9]
import './App.css';

// Assets
import bgImage from './assets/background.png';
import loginBGM from './assets/login_bgm.mp3';
import labBGM from './assets/lab_bgm.mp3';
import hoverSFX from './assets/Hover.mp3';
import chooseSFX from './assets/Choose.mp3';

const API_BASE_URL = 'https://radiantvault-loadoutlab.azurewebsites.net/api';

function App() {
  const [inLab, setInLab] = useState(false);
  const [currentView, setCurrentView] = useState('lab'); 
  const [allSkins, setAllSkins] = useState([]); 
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [bgmVolume, setBgmVolume] = useState(0.5);
  const [sfxVolume, setSfxVolume] = useState(0.5);

  const sfxHover = useRef(new Audio(hoverSFX));
  const sfxChoose = useRef(new Audio(chooseSFX));
  const audioLogin = useRef(new Audio(loginBGM));
  const audioLab = useRef(new Audio(labBGM));

  const playSFX = (ref) => {
    ref.current.currentTime = 0;
    ref.current.volume = sfxVolume;
    ref.current.play().catch(() => {});
  };

  useEffect(() => {
    const fetchSkins = async () => {
      try {
        const res = await axios.get('https://valorant-api.com/v1/weapons/skins');
        // SAFETY: Only format skins that have a valid assetPath
        const formatted = res.data.data
          .filter(skin => skin.assetPath) 
          .map(skin => ({
            name: skin.displayName,
            image: skin.displayIcon,
            tierUuid: skin.contentTierUuid,
            category: skin.assetPath.split('/')[3] || "Unknown",
            assetPath: skin.assetPath,
            price: 1775 
          }));
        setAllSkins(formatted);
      } catch (err) { console.error("Vault Retrieval Error", err); }
    };
    fetchSkins();
  }, []);

  useEffect(() => {
    audioLogin.current.loop = true;
    audioLab.current.loop = true;
    audioLogin.current.volume = bgmVolume;
    audioLab.current.volume = bgmVolume;

    if (!inLab) {
      audioLab.current.pause();
      audioLogin.current.play().catch(() => {});
    } else {
      audioLogin.current.pause();
      audioLab.current.play().catch(() => {});
    }
  }, [inLab, bgmVolume]);

  const handleAuth = async () => {
    const endpoint = isSigningUp ? '/signup' : '/login';
    try {
      const res = await axios.post(`${API_BASE_URL}${endpoint}`, { username, password });
      if (isSigningUp) {
        alert("PROTOCOL ESTABLISHED. LOGIN TO CONTINUE.");
        setIsSigningUp(false);
      } else {
        setCurrentUser(res.data); 
        setInLab(true);
      }
    } catch (err) { alert(err.response?.data?.message || "VAULT CONNECTION ERROR"); }
  };

  const handleSaveLoadout = async (newLoadout) => {
    try {
      await axios.post(`${API_BASE_URL}/save-loadout`, {
        username: currentUser.username, 
        loadout: newLoadout
      });
    } catch (err) { console.error("Sync Failure", err); }
  };

  return (
    <div className="App">
      {!inLab ? (
        <div className="landing-page" style={{ backgroundImage: `url(${bgImage})` }}>
          <div className="login-overlay">
            <div className="login-box">
              <h1 className="auth-header">{isSigningUp ? "CREATE ACCOUNT" : "AUTHENTICATE"}</h1>
              <input type="text" className="username-input" placeholder="AGENT ID" value={username} onChange={(e) => setUsername(e.target.value)} onMouseEnter={() => playSFX(sfxHover)} />
              <input type="password" className="username-input pass-input" placeholder="ACCESS KEY" value={password} onChange={(e) => setPassword(e.target.value)} onMouseEnter={() => playSFX(sfxHover)} />
              <button className="initialize-btn" onClick={() => { playSFX(sfxChoose); handleAuth(); }} onMouseEnter={() => playSFX(sfxHover)}>
                {isSigningUp ? "REGISTER AGENT" : "INITIALIZE PROTOCOL"}
              </button>
              <button className="signup-toggle" onClick={() => { playSFX(sfxChoose); setIsSigningUp(!isSigningUp); }} onMouseEnter={() => playSFX(sfxHover)}>
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
        <>
          <nav className="main-nav">
            <button className={`nav-link ${currentView === 'lab' ? 'active' : ''}`} 
              onMouseEnter={() => playSFX(sfxHover)}
              onClick={() => { playSFX(sfxChoose); setCurrentView('lab'); }}>THE VAULT</button>
            <button className={`nav-link ${currentView === 'market' ? 'active' : ''}`} 
              onMouseEnter={() => playSFX(sfxHover)}
              onClick={() => { playSFX(sfxChoose); setCurrentView('market'); }}>NIGHT MARKET</button>
          </nav>
          <main className="content-view">
            {currentView === 'lab' ? (
              <LoadoutLab 
                agentName={currentUser.username} initialLoadout={currentUser.loadout}
                bgmVolume={bgmVolume} sfxVolume={sfxVolume}
                onBgmChange={setBgmVolume} onSfxChange={setSfxVolume}
                onHover={() => playSFX(sfxHover)} onChoose={() => playSFX(sfxChoose)}
                onSave={handleSaveLoadout}
                onLogout={() => { playSFX(sfxChoose); setInLab(false); }} 
              />
            ) : (
              <Nightmarket 
                allSkins={allSkins} 
                onBack={() => { playSFX(sfxChoose); setCurrentView('lab'); }}
                bgmVolume={bgmVolume} sfxVolume={sfxVolume}
                onBgmChange={setBgmVolume} onSfxChange={setSfxVolume}
                onHover={() => playSFX(sfxHover)}
              />
            )}
          </main>
        </>
      )}
    </div>
  );
}

export default App;