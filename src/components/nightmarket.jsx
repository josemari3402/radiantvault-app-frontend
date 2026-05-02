import React, { useState, useEffect } from 'react';
import './nightmarket.css';
import nmBg from '../assets/nightmarket_bg.png'; // Verified filename[cite: 4]

const Nightmarket = ({ allSkins, onBack, bgmVolume, sfxVolume, onBgmChange, onSfxChange, onHover }) => {
  const [marketSkins, setMarketSkins] = useState([]);

  useEffect(() => {
    const SELECT_TIER = "12683d76-48d7-84a3-4e09-69857a424b33";
    const DELUXE_TIER = "3b62c16e-440d-327c-264d-910408542c16";
    const PREMIUM_TIER = "d1548d44-4b3a-cc5b-86d7-73d84a7e9373";
    const EXCLUSIVE_TIER = "e0468541-403c-e400-3051-444772186842";
    const ULTRA_TIER = "0cebb8be-46d7-c12a-d306-e9907ad5a0a1";

    // Filter Logic with Safety Guards[cite: 4, 7]
    const filtered = allSkins.filter(skin => {
      const name = skin.name?.toLowerCase() || "";
      const isMelee = skin.category === "Melee";
      const path = skin.assetPath?.toLowerCase() || "";
      
      // 1. Exclude Battle Pass (Metadata check)
      if (path.includes("battlepass")) return false;

      // 2. Exclude Limited Collections
      if (name.includes("champions") || name.includes("arcane") || name.includes("vct") || name.includes("ignite")) return false;

      // 3. Tier Rules
      if (skin.tierUuid === ULTRA_TIER) return false;
      if (skin.tierUuid === EXCLUSIVE_TIER && !isMelee) return false;

      const allowedTiers = [SELECT_TIER, DELUXE_TIER, PREMIUM_TIER, EXCLUSIVE_TIER];
      return allowedTiers.includes(skin.tierUuid);
    });

    setMarketSkins(filtered.sort(() => 0.5 - Math.random()).slice(0, 6));
  }, [allSkins]);

  return (
    <div className="nm-container" style={{ backgroundImage: `url(${nmBg})` }}>
      <div className="nm-overlay">
        <div className="nm-top-bar">
          <button className="tactical-btn" onClick={onBack} onMouseEnter={onHover}>◄ BACK</button>
          <div className="lab-volume-box">
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
            <p style={{color: 'white'}}>CALIBRATING OFFERS...</p>
          )}
        </div>
      </div>
    </div>
  );
};

const NMCard = ({ skin }) => {
  const [flipped, setFlipped] = useState(false);
  const [discount] = useState(Math.floor(Math.random() * 40) + 10);
  
  const tier = (skin.category === "Melee") ? "exclusive" : 
    (skin.tierUuid === "12683d76-48d7-84a3-4e09-69857a424b33") ? "select" :
    (skin.tierUuid === "3b62c16e-440d-327c-264d-910408542c16") ? "deluxe" : "premium";

  return (
    <div className={`nm-card ${flipped ? 'flipped' : ''}`} onClick={() => setFlipped(true)}>
      <div className="nm-card-inner">
        <div className={`nm-front tier-border-${tier}`}><div className="nm-diamond"></div></div>
        <div className={`nm-back tier-bg-${tier}`}>
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