import React, { useState, useEffect } from 'react';
import './Nightmarket.css';
// Import your new background image
import nmBg from '../assets/nightmarket_bg.png';

const Nightmarket = ({ allSkins }) => {
  const [marketSkins, setMarketSkins] = useState([]);

  useEffect(() => {
    // Filter: No Ultra, No Exclusive unless Melee
    const validSkins = allSkins.filter(skin => {
      const isUltra = skin.tier === "Ultra Edition";
      const isExclusive = skin.tier === "Exclusive Edition";
      const isMelee = skin.category === "Melee";

      if (isUltra) return false;
      if (isExclusive && !isMelee) return false;
      return true;
    });

    const shuffled = validSkins.sort(() => 0.5 - Math.random()).slice(0, 6);
    setMarketSkins(shuffled);
  }, [allSkins]);

  return (
    <div className="night-market-container" style={{ backgroundImage: `url(${nmBg})` }}>
      <div className="market-content-overlay">
        <h1 className="market-title">NIGHT.MARKET</h1>
        <div className="market-grid">
          {marketSkins.map((skin, index) => (
            <NightmarketCard key={index} skin={skin} />
          ))}
        </div>
      </div>
    </div>
  );
};

const NightmarketCard = ({ skin }) => {
  const [isRevealed, setIsRevealed] = useState(false);
  const [discount] = useState(Math.floor(Math.random() * 40) + 10);
  const discountedPrice = Math.floor(skin.price * (1 - discount / 100));
  const tierClass = skin.tier.split(' ')[0].toLowerCase();

  return (
    <div className={`market-card ${isRevealed ? 'flipped' : ''}`} onClick={() => setIsRevealed(true)}>
      <div className="card-inner">
        {/* FRONT: Hidden State */}
        <div className={`card-front tier-border-${tierClass}`}>
          <div className="diamond-icon"></div>
        </div>

        {/* BACK: Revealed State */}
        <div className={`card-back tier-bg-${tierClass}`}>
          <div className="discount-badge">-{discount}%</div>
          <div className="price-container">
            <span className="old-price">{skin.price}</span>
            <span className="new-price">{discountedPrice} VP</span>
          </div>
          <div className="gun-image-container">
            <img src={skin.image} className="rotated-gun" alt={skin.name} />
          </div>
          <div className="skin-details">
            <h4 className="skin-name">{skin.name}</h4>
            <p className="weapon-type">{skin.category}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Nightmarket;