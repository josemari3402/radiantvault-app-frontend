import React, { useState, useEffect } from 'react';
import './nightmarket.css';
import nmBg from '../assets/nightmarket_bg.png';

const Nightmarket = ({ allSkins, onBack, bgmVolume, sfxVolume, onBgmChange, onSfxChange, onHover }) => {
  const [marketSkins, setMarketSkins] = useState([]);

  useEffect(() => {
    // Official UUIDs for reference
    const SELECT = "12683d76-48d7-84a3-4e09-69857a424b33";
    const DELUXE = "3b62c16e-440d-327c-264d-910408542c16";
    const PREMIUM = "d1548d44-4b3a-cc5b-86d7-73d84a7e9373";
    const EXCLUSIVE = "e0468541-403c-e400-3051-444772186842";
    const ULTRA = "0cebb8be-46d7-c12a-d306-e9907ad5a0a1";

    const filtered = allSkins.filter(skin => {
      if (!skin.tierUuid || !skin.assetPath) return false;

      const name = skin.name?.toLowerCase() || "";
      const path = skin.assetPath?.toLowerCase() || "";
      const isMelee = skin.category === "Melee";

      // 1. STRICTOR BATTLEPASS CHECK: Catches Beta to 2026 BP skins[cite: 4]
      if (path.includes("battlepass") || path.includes("season")) return false;

      // 2. EXCLUDE LIMITED/ULTRA/EXCLUSIVE GUNS[cite: 4]
      if (name.includes("champions") || name.includes("arcane") || name.includes("vct") || name.includes("ignite")) return false;
      if (skin.tierUuid === ULTRA) return false;
      if (skin.tierUuid === EXCLUSIVE && !isMelee) return false;

      // 3. ALLOWED POOL[cite: 4]
      return [SELECT, DELUXE, PREMIUM, EXCLUSIVE].includes(skin.tierUuid);
    });

    // Pick 6 and log to console if 0 are found (for debugging)
    const finalSelection = filtered.sort(() => 0.5 - Math.random()).slice(0, 6);
    console.log("Night Market Pool Size:", filtered.length); 
    setMarketSkins(finalSelection);
  }, [allSkins]);

  return (
    <div className="nm-container" style={{ backgroundImage: `url(${nmBg})` }}>
      <div className="nm-overlay">
        <div className="nm-top-bar">
          <button className="tactical-btn" onClick={onBack} onMouseEnter={onHover}>◄ BACK</button>
          <div className="nm-vol-row">
            <div className="vol-item"><span className="vol-label">SFX</span>
              <input type="range" min="0" max="1" step="0.01" value={sfxVolume} onChange={(e) => onSfxChange(e.target.value)} className="tactical-slider" />
            </div>
            <div className="vol-item"><span className="vol-label">AUDIO</span>
              <input type="range" min="0" max="1" step="0.01" value={bgmVolume} onChange={(e) => onBgmChange(e.target.value)} className="tactical-slider" />
            </div>
          </div>
        </div>

        <h1 className="nm-title">NIGHT.MARKET</h1>
        <div className="nm-grid">
          {marketSkins.length > 0 ? (
            marketSkins.map((skin, i) => <NMCard key={i} skin={skin} />)
          ) : (
            <p className="nm-status">CALIBRATING OFFERS...</p>
          )}
        </div>
      </div>
    </div>
  );
};

const NMCard = ({ skin }) => {
  const [flipped, setFlipped] = useState(false);
  const [discount] = useState(Math.floor(Math.random() * 41) + 10);
  
  const getTierCode = () => {
    if (skin.category === "Melee") return "exclusive"; // Gold[cite: 8]
    switch(skin.tierUuid) {
      case "12683d76-48d7-84a3-4e09-69857a424b33": return "select";  // Blue[cite: 8]
      case "3b62c16e-440d-327c-264d-910408542c16": return "deluxe";  // Green[cite: 8]
      default: return "premium"; // Magenta[cite: 8]
    }
  };

  return (
    <div className={`nm-card ${flipped ? 'flipped' : ''}`} onClick={() => setFlipped(true)}>
      <div className="nm-card-inner">
        <div className={`nm-front tier-border-${getTierCode()}`}><div className="nm-diamond"></div></div>
        <div className={`nm-back tier-bg-${getTierCode()}`}>
          <div className="nm-discount">-{discount}%</div>
          <div className="nm-price">{Math.floor(1775 * (1 - discount/100))} VP</div>
          <div className="nm-img-box"><img src={skin.image} className="nm-gun" alt="" /></div>
          <div className="nm-info"><h4>{skin.name}</h4></div>
        </div>
      </div>
    </div>
  );
};

export default Nightmarket;