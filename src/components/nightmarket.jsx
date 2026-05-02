import React, { useState, useEffect, useCallback } from 'react';
import './nightmarket.css';
import nmBg from '../assets/nightmarket_bg.png';

const Nightmarket = ({ allSkins, onBack, bgmVolume, sfxVolume, onBgmChange, onSfxChange, onHover, onChoose }) => {
  const [marketSkins, setMarketSkins] = useState([]);
  const [shuffleKey, setShuffleKey] = useState(0);

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

      // 1. HARD BATTLEPASS EXCLUSION (Beta to 2026)
      if (path.includes("battlepass") || path.includes("season") || path.includes("episode") || path.includes("act")) return false;

      // 2. LIMITED/ULTRA EXCLUSION
      if (name.includes("champions") || name.includes("arcane") || name.includes("vct") || name.includes("ignite")) return false;
      if (skin.contentTierUuid === ULTRA) return false;

      // 3. EXCLUSIVE GUNS EXCLUSION (But Melee is allowed)
      if (skin.contentTierUuid === EXCLUSIVE && !isMelee) return false;

      // 4. ELIGIBILITY
      return [SELECT, DELUXE, PREMIUM, EXCLUSIVE].includes(skin.contentTierUuid);
    });

    // Pick 6 and set
    const selection = filtered.sort(() => 0.5 - Math.random()).slice(0, 6);
    setMarketSkins(selection);
  }, [allSkins]);

  useEffect(() => {
    generateOffers();
  }, [generateOffers]);

  const handleShuffle = (e) => {
    e.stopPropagation(); // Prevent click-through
    if (onChoose) onChoose(); 
    setShuffleKey(prev => prev + 1);
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
        
        <div className="nm-grid-horizontal" key={shuffleKey}>
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
    if (path.includes("melee") || skin.category === "Melee") return "exclusive";
    switch(skin.contentTierUuid) {
      case "12683d76-48d7-84a3-4e09-69857a424b33": return "select";  
      case "3b62c16e-440d-327c-264d-910408542c16": return "deluxe"; 
      default: return "premium"; 
    }
  };

  return (
    <div className={`nm-card-small ${flipped ? 'flipped' : ''}`} onClick={() => setFlipped(true)} onMouseEnter={() => !flipped && onHover()}>
      <div className="nm-card-inner">
        <div className={`nm-front tier-border-${getTier()}`}><div className="nm-diamond"></div></div>
        <div className={`nm-back tier-bg-${getTier()}`}>
          <div className="nm-discount-small">-{discount}%</div>
          <div className="nm-price-small">{Math.floor(1775 * (1 - discount/100))} VP</div>
          <div className="nm-img-box-small"><img src={skin.displayIcon} className="nm-gun-small" alt="" /></div>
          <div className="nm-info-small"><h4>{skin.displayName}</h4></div>
        </div>
      </div>
    </div>
  );
};

export default Nightmarket;