import React, { useState, useEffect } from 'react';
import './nightmarket.css';
import nmBg from '../assets/nightmarket_bg.png';

const Nightmarket = ({ allSkins, onBack, bgmVolume, sfxVolume, onBgmChange, onSfxChange, onHover }) => {
  const [marketSkins, setMarketSkins] = useState([]);

  useEffect(() => {
    const SELECT = "12683d76-48d7-84a3-4e09-69857a424b33";
    const DELUXE = "3b62c16e-440d-327c-264d-910408542c16";
    const PREMIUM = "d1548d44-4b3a-cc5b-86d7-73d84a7e9373";
    const EXCLUSIVE = "e0468541-403c-e400-3051-444772186842";
    const ULTRA = "0cebb8be-46d7-c12a-d306-e9907ad5a0a1";

    if (!allSkins || allSkins.length === 0) {
      console.log("NM WAIT: allSkins is empty, waiting for data...");
      return;
    }

    const filtered = allSkins.filter(skin => {
      if (!skin.assetPath || !skin.tierUuid) return false;
      const path = skin.assetPath.toLowerCase();
      const name = skin.displayName?.toLowerCase() || "";
      const isMelee = skin.category === "Melee";

      // RESEARCH-BASED EXCLUSIONS[cite: 4]
      if (path.includes("battlepass") || path.includes("season") || path.includes("episode")) return false;
      if (name.includes("champions") || name.includes("arcane") || name.includes("vct") || name.includes("ignite")) return false;
      if (skin.tierUuid === ULTRA) return false;
      if (skin.tierUuid === EXCLUSIVE && !isMelee) return false;

      return [SELECT, DELUXE, PREMIUM, EXCLUSIVE].includes(skin.tierUuid);
    });

    console.log(`NM READY: Found ${filtered.length} eligible skins.`);
    setMarketSkins(filtered.sort(() => 0.5 - Math.random()).slice(0, 6));
  }, [allSkins]);

  return (
    <div className="nm-container" style={{ backgroundImage: `url(${nmBg})` }}>
      <div className="nm-overlay">
        <div className="nm-top-bar">
          <button className="tactical-btn" onClick={onBack} onMouseEnter={onHover}>◄ BACK</button>
          <div className="nm-vol-box">
             <div className="vol-item"><span className="vol-label">SFX</span>
               <input type="range" min="0" max="1" step="0.01" value={sfxVolume} onChange={(e) => onSfxChange(e.target.value)} />
             </div>
             <div className="vol-item"><span className="vol-label">AUDIO</span>
               <input type="range" min="0" max="1" step="0.01" value={bgmVolume} onChange={(e) => onBgmChange(e.target.value)} />
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
          <div className="nm-img-box"><img src={skin.displayIcon} className="nm-gun" alt="" /></div>
          <div className="nm-info"><h4>{skin.displayName}</h4></div>
        </div>
      </div>
    </div>
  );
};

export default Nightmarket;