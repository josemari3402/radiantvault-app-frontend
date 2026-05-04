import React, { useState, useEffect, useCallback } from 'react';
import './nightmarket.css';
import nmBg from '../assets/nightmarket_bg.png';

// THE "X" KILLER: Prioritizes chromas for high-tier skins
const getSkinImage = (skin) => {
  if (!skin) return "";
  
  // Check chromas first; they are the most reliable source for skins like Sovereign[cite: 2]
  if (skin.chromas && skin.chromas.length > 0) {
    return skin.chromas[0].fullRender || skin.chromas[0].displayIcon;
  }
  
  // Fallback for lower tier skins that don't have chromas[cite: 2]
  if (skin.displayIcon && skin.displayIcon.length > 10) return skin.displayIcon;
  
  return skin.fullRender || "";
};

const Nightmarket = ({ allSkins, onBack, bgmVolume, sfxVolume, onBgmChange, onSfxChange, onHover, onChoose }) => {
  const [marketSkins, setMarketSkins] = useState([]);
  const [shuffleKey, setShuffleKey] = useState(0);

  const ALLOWED_COLLECTIONS = {
    SELECT: ["Convex", "Daydreams", "Endeavour", "Fortune's Hand", "Galleria", "Infantry", "Intergrade", "Luxe", "Prism II", "Reverie", "Rupture", "Rush", "Sensation", "Smite", "Storm Maw", "Switchback", "Wonderstallion"],
    DELUXE: ["Abyssal", "Altitude", "Aperture", "Aristocrat", "Avalanche", "Chromedek", "Combat Crafts", "Emberclad", "Holomoku", "Horizon", "Jellybeam", "Kohaku & Matsuba", "Luna", "Minima", "MK.VII Liberty", "Nanomight", "NO LIMITS", "Nunca Olvidados", "Orion", "Prism", "Sakura", "Sarmad", "SilkLeaf", "Silvanus", "Snowfall", "Team Ace", "Tigris", "Titanmail", "VALORANT GO! Vol. 3", "Wasteland", "Winterwunderland"],
    PREMIUM: ["Aemondir", "Black.Market", "Bolt", "Celestial", "Crimsonbeast", "Cryostasis", "Doodle Buds", "Ego", "Forsaken", "Gaia's Vengeance", "Gravitational Uranium Neuroblaster", "Helix", "Ion", "Magepunk", "Nebula", "Neptune", "Oni", "Origin", "Prime", "Prime//2.0", "Radiant Crisis 001", "Reaver", "Recon", "Solarstride", "Soulstrife", "Sovereign", "Spline", "Tethered Realms", "Undercity", "Valiant Hero", "VALORANT GO! Vol. 1", "VALORANT GO! Vol. 2", "Xenohunter", "XERØFANG"]
  };

  const TIER_PRICES = {
    SELECT: { gun: 875, melee: 1750 },
    DELUXE: { gun: 1275, melee: 2550 },
    PREMIUM: { gun: 1775, melee: 3550 }
  };

  const generateOffers = useCallback(() => {
    if (!allSkins || allSkins.length === 0) return;
    const eligible = allSkins.filter(skin => {
      const name = skin.displayName || "";
      return ALLOWED_COLLECTIONS.SELECT.some(c => name.includes(c)) ||
             ALLOWED_COLLECTIONS.DELUXE.some(c => name.includes(c)) ||
             ALLOWED_COLLECTIONS.PREMIUM.some(c => name.includes(c));
    });
    
    if (eligible.length === 0) return;

    const selection = eligible.sort(() => 0.5 - Math.random()).slice(0, 6).map(skin => {
      const name = skin.displayName || "";
      const isMelee = name.includes("Melee") || name.includes("Knife") || name.includes("Axe") || 
                      name.includes("Blade") || name.includes("Dagger") || name.includes("Karambit") ||
                      name.includes("Gauntlet") || name.includes("Sugarslice") || name.includes("Flamethrower") ||
                      name.includes("Hammer") || name.includes("Mace") || name.includes("Fan") ||
                      (skin.assetPath && skin.assetPath.includes("Melee"));

      let tier = "PREMIUM";
      if (ALLOWED_COLLECTIONS.SELECT.some(n => name.includes(n))) tier = "SELECT";
      else if (ALLOWED_COLLECTIONS.DELUXE.some(n => name.includes(n))) tier = "DELUXE";

      const discount = Math.floor(Math.random() * 31) + 10;
      const base = isMelee ? TIER_PRICES[tier].melee : TIER_PRICES[tier].gun;

      return {
        ...skin,
        tierKey: tier,
        isMelee,
        marketDiscount: discount,
        finalPrice: Math.floor(base * (1 - discount / 100))
      };
    });
    setMarketSkins(selection);
  }, [allSkins]);

  useEffect(() => { generateOffers(); }, [generateOffers, allSkins]);

  const handleShuffle = (e) => {
    e.stopPropagation();
    if (onChoose) onChoose();
    setShuffleKey(prev => prev + 1);
    generateOffers();
  };

  return (
    <div className="nm-container" style={{ backgroundImage: `url(${nmBg})` }}>
      <div className="nm-overlay">
        
        {/* TOP BAR: Uses absolute positioning to keep groups separate */}
        <div className="nm-top-bar">
          <div className="nm-btn-group">
            <button className="tactical-btn" onClick={onBack} onMouseEnter={onHover}>◄ BACK</button>
            <button className="tactical-btn shuffle-btn" onClick={handleShuffle} onMouseEnter={onHover}>SHUFFLE</button>
          </div>
          
          <div className="nm-vol-box">
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

        <h1 className="nm-title">NIGHT.MARKET</h1>
        
        <div className="nm-horizontal-row" key={shuffleKey}>
          {marketSkins.length > 0 ? (
            marketSkins.map((skin, i) => (
              <NMCard key={`${shuffleKey}-${i}`} skin={skin} onHover={onHover} onChoose={onChoose} />
            ))
          ) : (
            <p className="nm-status">CALIBRATING OFFERS...</p>
          )}
        </div>
      </div>
    </div>
  );
};

const NMCard = ({ skin, onHover, onChoose }) => {
  const [flipped, setFlipped] = useState(false);
  const handleFlip = () => {
    if (!flipped) {
      if (typeof onChoose === 'function') onChoose();
      setFlipped(true);
    }
  };

  const TIER_COLORS = {
    SELECT: "#5a9fe2",
    DELUXE: "#00adaa",
    PREMIUM: "#d1548d",
    GOLD: "#f1c964"
  };

  const currentGlow = skin.isMelee ? TIER_COLORS.GOLD : TIER_COLORS[skin.tierKey];

  return (
    <div className={`nm-card ${flipped ? 'flipped' : ''}`} onClick={handleFlip} onMouseEnter={() => !flipped && onHover()}>
      <div className="nm-card-inner">
        <div className="nm-front" style={{ borderColor: currentGlow, boxShadow: `0 0 20px ${currentGlow}` }}>
          <div className="nm-diamond" style={{ background: currentGlow }}></div>
        </div>
        
        <div className={`nm-back tier-bg-${skin.isMelee ? 'gold' : skin.tierKey.toLowerCase()}`} style={{ borderColor: currentGlow, boxShadow: `0 0 20px ${currentGlow}` }}>
          <div className="nm-discount">-{skin.marketDiscount}%</div>
          <div className="nm-img-box">
            {/* Uses helper to kill Sovereign "X"[cite: 2] */}
            <img src={getSkinImage(skin)} className="nm-weapon-asset" alt="" />
          </div>
          <div className="nm-footer">
            <div className="nm-info"><h4>{skin.displayName}</h4></div>
            <div className="nm-price">{skin.finalPrice} VP</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Nightmarket;