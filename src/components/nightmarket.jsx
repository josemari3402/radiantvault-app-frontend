import React, { useState, useEffect, useCallback } from 'react';
import './nightmarket.css';
import nmBg from '../assets/nightmarket_bg.png';

const Nightmarket = ({ allSkins, onBack, bgmVolume, sfxVolume, onBgmChange, onSfxChange, onHover, onChoose }) => {
  const [marketSkins, setMarketSkins] = useState([]);
  const [shuffleKey, setShuffleKey] = useState(0); // Used to force-reset card flip states

  const generateOffers = useCallback(() => {
    const SELECT = "12683d76-48d7-84a3-4e09-69857a424b33";
    const DELUXE = "3b62c16e-440d-327c-264d-910408542c16";
    const PREMIUM = "d1548d44-4b3a-cc5b-86d7-73d84a7e9373";
    const EXCLUSIVE = "e0468541-403c-e400-3051-444772186842";
    const ULTRA = "0cebb8be-46d7-c12a-d306-e9907ad5a0a1";

    if (!allSkins || allSkins.length === 0) return;

    const filtered = allSkins.filter(skin => {
      const path = skin.assetPath?.toLowerCase() || "";
      const name = skin.displayName?.toLowerCase() || "";
      const isMelee = path.includes("melee") || skin.category === "Melee";

      // Strict Exclusions (Battle Pass Beta-2026, Limited, Ultra)
      if (path.includes("battlepass") || path.includes("season") || path.includes("episode")) return false;
      if (name.includes("champions") || name.includes("arcane") || name.includes("vct") || name.includes("ignite")) return false;
      if (skin.contentTierUuid === ULTRA) return false;
      if (skin.contentTierUuid === EXCLUSIVE && !isMelee) return false;

      return [SELECT, DELUXE, PREMIUM, EXCLUSIVE].includes(skin.contentTierUuid);
    });

    // Fallback if filter is too strict
    const pool = filtered.length > 0 ? filtered : allSkins.filter(s => s.displayIcon && s.contentTierUuid);
    const selection = pool.sort(() => 0.5 - Math.random()).slice(0, 6);
    setMarketSkins(selection);
  }, [allSkins]);

  // Initial load
  useEffect(() => {
    generateOffers();
  }, [generateOffers]);

  const handleShuffle = () => {
    onChoose(); // Play the "Choose" SFX for the shuffle action
    setShuffleKey(prev => prev + 1); // Incrementing the key forces all NMCard components to unmount and remount (resetting their internal 'flipped' state)
    generateOffers();
  };

  return (
    <div className="nm-container" style={{ backgroundImage: `url(${nmBg})` }}>
      <div className="nm-overlay">
        <div className="nm-top-bar">
          <div className="nm-left-btns">
            <button className="tactical-btn" onClick={onBack} onMouseEnter={onHover}>◄ BACK</button>
            <button className="tactical-btn shuffle-btn" onClick={handleShuffle} onMouseEnter={onHover}>SHUFFLE</button>
          </div>
          <div className="nm-vol-box">
             <div className="vol-item"><span className="vol-label">SFX</span>
               <input type="range" min="0" max="1" step="0.01" value={sfxVolume} onChange={(e) => onSfxChange(e.target.value)} className="tactical-slider" />
             </div>
             <div className="vol-item"><span className="vol-label">AUDIO</span>
               <input type="range" min="0" max="1" step="0.01" value={bgmVolume} onChange={(e) => onBgmChange(e.target.value)} className="tactical-slider" />
             </div>
          </div>
        </div>

        <h1 className="nm-title">NIGHT.MARKET</h1>
        
        {/* The key={shuffleKey} ensures the entire grid resets when shuffling */}
        <div className="nm-grid" key={shuffleKey}>
          {marketSkins.length > 0 ? (
            marketSkins.map((skin, i) => <NMCard key={i} skin={skin} onHover={onHover} />)
          ) : (
            <p className="nm-status">CALIBRATING OFFERS...</p>
          )}
        </div>
      </div>
    </div>
  );
};

const NMCard = ({ skin, onHover }) => {
  const [flipped, setFlipped] = useState(false);
  const [discount] = useState(Math.floor(Math.random() * 41) + 10);
  
  const getTier = () => {
    const path = skin.assetPath?.toLowerCase() || "";
    if (path.includes("melee") || skin.category === "Melee") return "exclusive"; // Gold
    switch(skin.contentTierUuid) {
      case "12683d76-48d7-84a3-4e09-69857a424b33": return "select";  // Blue
      case "3b62c16e-440d-327c-264d-910408542c16": return "deluxe"; // Green
      default: return "premium"; // Magenta
    }
  };

  const tier = getTier();

  return (
    <div 
      className={`nm-card ${flipped ? 'flipped' : ''}`} 
      onClick={() => setFlipped(true)}
      onMouseEnter={() => !flipped && onHover()}
    >
      <div className="nm-card-inner">
        <div className={`nm-front tier-border-${tier}`}><div className="nm-diamond"></div></div>
        <div className={`nm-back tier-bg-${tier}`}>
          <div className="nm-discount">-{discount}%</div>
          <div className="nm-price">{Math.floor(1775 * (1 - discount/100))} VP</div>
          <div className="nm-img-box"><img src={skin.displayIcon} className="nm-gun" alt="" /></div>
          <div className="nm-info"><h4>{skin.displayName}</h4></div>
        </div>
      </div>
    </div>
  );
};

export default Nightmarket;