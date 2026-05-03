import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './LoadoutLab.css';
import labBG from '../assets/background2.png';

const WEAPON_LAYOUT = [
  { col: 1, sections: [{ label: "SIDEARMS", guns: ["Classic", "Shorty", "Frenzy", "Ghost", "Bandit", "Sheriff"] }] },
  { col: 2, sections: [{ label: "SMGS", guns: ["Stinger", "Spectre"] }, { label: "SHOTGUNS", guns: ["Bucky", "Judge"] }] },
  { col: 3, sections: [{ label: "RIFLES", guns: ["Bulldog", "Guardian", "Phantom", "Vandal"] }, { label: "MELEE", guns: ["Melee"] }] },
  { col: 4, sections: [{ label: "SNIPER RIFLES", guns: ["Marshal", "Outlaw", "Operator"] }, { label: "MACHINE GUNS", guns: ["Ares", "Odin"] }] }
];

const LoadoutLab = ({ 
  agentName, onLogout, initialLoadout, onSave, bgmVolume, sfxVolume, 
  onBgmChange, onSfxChange, onHover, onChoose, onGridHover, onGridSelect, onVariantSelect 
}) => {
  const [weapons, setWeapons] = useState([]);
  const [cards, setCards] = useState([]);
  const [titles, setTitles] = useState([]);
  const [equippedSkins, setEquippedSkins] = useState(initialLoadout || {});
  const [view, setView] = useState('grid');
  const [activeWeapon, setActiveWeapon] = useState(null);
  const [previewSkin, setPreviewSkin] = useState(null);
  const [activeIcon, setActiveIcon] = useState('');
  const [selectedCard, setSelectedCard] = useState(initialLoadout?.equippedCard || null);
  const [selectedTitle, setSelectedTitle] = useState(initialLoadout?.equippedTitle || null);
  const [showPicker, setShowPicker] = useState(null);
  const [loading, setLoading] = useState(true);
  const [skinSearch, setSkinSearch] = useState('');
  const [cardSearch, setCardSearch] = useState('');
  const [titleSearch, setTitleSearch] = useState('');
  const [hoveredCardName, setHoveredCardName] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [w, c, t] = await Promise.all([
          axios.get('https://valorant-api.com/v1/weapons'),
          axios.get('https://valorant-api.com/v1/playercards'),
          axios.get('https://valorant-api.com/v1/playertitles')
        ]);
        setWeapons(w.data.data);
        setCards(c.data.data);
        setTitles(t.data.data.filter(title => title.displayName));
        if (!selectedCard) {
          const defaultCard = c.data.data.find(card => card.displayName.includes("Wide")) || c.data.data[0];
          setSelectedCard(defaultCard);
        }
        if (!selectedTitle) {
          const defaultTitle = t.data.data.find(title => title.displayName === "Bot") || t.data.data[0];
          setSelectedTitle(defaultTitle);
        }
        setLoading(false);
      } catch (err) { console.error("Sync Failure:", err); }
    };
    loadData();
  }, []);

  const findWeapon = (name) => weapons.find(w => w.displayName === name);

  const handleEquip = () => {
    onChoose();
    const newLoadout = { 
      ...equippedSkins, 
      [activeWeapon.uuid]: { ...previewSkin, displayIcon: activeIcon },
      equippedCard: selectedCard,
      equippedTitle: selectedTitle
    };
    setEquippedSkins(newLoadout);
    if (onSave) onSave(newLoadout); 
    setView('grid');
    setSkinSearch('');
  };

  const getFilteredSkins = () => {
    if (!activeWeapon) return [];
    return activeWeapon.skins
      .filter(s => (s.displayIcon || s.fullRender) && !s.displayName.includes('Standard') && !s.displayName.includes('Favorite'))
      .sort((a, b) => a.displayName.localeCompare(b.displayName));
  };

  const getFilteredCards = () => cards.filter(c => c.displayName.toLowerCase().includes(cardSearch.toLowerCase()));
  const getFilteredTitles = () => titles.filter(t => t.displayName.toLowerCase().includes(titleSearch.toLowerCase()));

  if (loading) return <div className="loading">CALIBRATING VAULT...</div>;

  return (
    <div className="lab-interface" style={{ backgroundImage: `url(${labBG})` }}>
      {/* 1. Logout removed from selection view */}
      {view === 'grid' && (
        <button className="tactical-btn logout-pos" onClick={onLogout} onMouseEnter={onHover}>LOGOUT ✕</button>
      )}

      <div className="top-nav-controls">
        <div className="lab-volume-box">
          <div className="vol-item">
            <span className="vol-label">SFX</span>
            <input type="range" min="0" max="1" step="0.01" value={sfxVolume} onChange={(e) => onSfxChange(e.target.value)} className="tactical-slider" />
          </div>
          <div className="vol-item">
            <span className="vol-label">AUDIO</span>
            <input type="range" min="0" max="1" step="0.01" value={bgmVolume} onChange={(e) => onBgmChange(e.target.value)} className="tactical-slider" />
          </div>
        </div>
      </div>

      {showPicker && (
        <div className="picker-overlay" onClick={() => { setShowPicker(null); setCardSearch(''); setTitleSearch(''); setHoveredCardName(''); }}>
          <div className="picker-content" onClick={e => e.stopPropagation()}>
            <div className="picker-header-row">
              <div className="picker-search-container">
                <input type="text" placeholder={showPicker === 'cards' ? "SEARCH CARDS..." : "SEARCH TITLES..."} className="picker-search-bar"
                  value={showPicker === 'cards' ? cardSearch : titleSearch}
                  onChange={(e) => showPicker === 'cards' ? setCardSearch(e.target.value) : setTitleSearch(e.target.value)}
                  onMouseEnter={onHover} onClick={onChoose} />
              </div>
              <div className="hover-name-display">{showPicker === 'cards' ? hoveredCardName : ''}</div>
              <h2 className="picker-header-text">SELECT {showPicker === 'cards' ? 'CARD' : 'TITLE'}</h2>
            </div>
            <div className={showPicker === 'cards' ? "fixed-card-grid" : "fixed-title-grid"}>
              {showPicker === 'cards' ? 
                getFilteredCards().map(c => (
                  <div key={c.uuid} className="card-selection-box" onMouseEnter={() => { onHover(); setHoveredCardName(c.displayName.toUpperCase()); }} onMouseLeave={() => setHoveredCardName('')}
                    onClick={() => { onChoose(); setSelectedCard(c); onSave({ ...equippedSkins, equippedCard: c, equippedTitle: selectedTitle }); setShowPicker(null); setCardSearch(''); setHoveredCardName(''); }}>
                    <img src={c.largeArt} className="card-selection-asset" alt="" />
                  </div>
                )) :
                getFilteredTitles().map(t => (
                  <div key={t.uuid} className="title-selection-box" onMouseEnter={onHover} 
                    onClick={() => { onChoose(); setSelectedTitle(t); onSave({ ...equippedSkins, equippedCard: selectedCard, equippedTitle: t }); setShowPicker(null); setTitleSearch(''); }}>
                    {t.displayName.replace(/ Title/g, '')}
                  </div>
                ))
              }
            </div>
          </div>
        </div>
      )}

      {view === 'grid' ? (
        <div className="main-lab-layout">
          <div className="arsenal-columns">
            {WEAPON_LAYOUT.map(column => (
              <div key={column.col} className="col-stack">
                {column.sections.map(section => (
                  <div key={section.label} className="cat-group">
                    <h3 className="white-cat-header" onClick={onChoose}>{section.label}</h3>
                    <div className="gun-container-stack">
                      {section.guns.map(gunName => {
                        const data = findWeapon(gunName);
                        if (!data) return null;
                        const eq = equippedSkins[data.uuid];
                        return (
                          <div key={gunName} className="gun-slot-card" onMouseEnter={onHover} onClick={() => { 
                            onChoose(); setActiveWeapon(data); const initialSkin = eq || data.skins[0];
                            setPreviewSkin(initialSkin); setActiveIcon(initialSkin.fullRender || initialSkin.displayIcon); setView('customize'); 
                          }}>
                            <div className="gun-frame-box">
                              <img src={eq?.displayIcon || data.displayIcon} className="gun-icon-stable" alt={gunName} />
                            </div>
                            <span className="gun-name-label">{gunName.toUpperCase()}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
          <aside className="sidebar-section">
            <div className="agent-card-frame" onMouseEnter={onHover} onClick={() => { onChoose(); setShowPicker('cards'); }}>
              <img src={selectedCard?.largeArt} className="full-fit-card" alt="" />
              <div className="gold-bar-anchor">
                <div className="gold-name-strip"><h2>{agentName}</h2></div>
                <p className="clean-title-display" onMouseEnter={onHover} onClick={(e) => { e.stopPropagation(); onChoose(); setShowPicker('titles'); }}>
                  {selectedTitle?.displayName.replace(/ Title/g, '') || 'BOT'}
                </p>
              </div>
            </div>
          </aside>
        </div>
      ) : (
        <div className="customize-interface">
          <div className="cust-header-bar">
            <button className="tactical-btn" onClick={() => { onChoose(); setView('grid'); }} onMouseEnter={onHover}>◄ BACK</button>
          </div>

          <h1 className="skin-display-title-absolute">{previewSkin?.displayName}</h1>

          <div className="cust-body-layout">
            <aside className="skin-list-sidebar">
              <input type="text" placeholder="SEARCH SKINS..." className="skin-search-bar" value={skinSearch} 
                onChange={(e) => setSkinSearch(e.target.value)} onMouseEnter={onHover} onClick={onChoose} />
              <div className="skin-grid-view">
                {getFilteredSkins().filter(s => s.displayName.toLowerCase().includes(skinSearch.toLowerCase())).map(s => (
                  <div key={s.uuid} className={`skin-slot-item ${previewSkin?.uuid === s.uuid ? 'active' : ''}`} 
                    onMouseEnter={onGridHover} onClick={() => { onGridSelect(); setPreviewSkin(s); setActiveIcon(s.fullRender || s.displayIcon); }}>
                    <img src={s.displayIcon || s.fullRender} className="sidebar-skin-img" alt="" />
                  </div>
                ))}
              </div>
            </aside>
            <main className="preview-stage">
              <div className="preview-limiter"><img src={activeIcon} className="preview-hero-img" alt="" /></div>
              
              {previewSkin?.chromas && previewSkin.chromas.length > 1 && (
                <div className="variant-strip">
                  {previewSkin.chromas.map((ch) => (
                    <div key={ch.uuid} className={`variant-icon-wrapper ${activeIcon === (ch.fullRender || ch.displayIcon) ? 'active' : ''}`}
                      onMouseEnter={onHover} onClick={() => { onVariantSelect(); setActiveIcon(ch.fullRender || ch.displayIcon || previewSkin.displayIcon); }}>
                      <img src={ch.swatch || ch.displayIcon} alt="" />
                    </div>
                  ))}
                </div>
              )}
              
              <button className="equip-btn-final" onClick={handleEquip} onMouseEnter={onHover}>EQUIP SKIN</button>
            </main>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoadoutLab;