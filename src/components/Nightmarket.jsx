import React, { useState, useEffect } from 'react';
import './Nightmarket.css';
import nmBg from '../assets/nightmarket.png';

const Nightmarket = ({ allSkins }) => {
  const [marketSkins, setMarketSkins] = useState([]);

  useEffect(() => {
    const ULTRA_TIER = "0cebb8be-46d7-c12a-d306-e9907ad5a0a1";
    const EXCLUSIVE_TIER = "e0468541-403c-e400-3051-444772186842";

    const validSkins = allSkins.filter(skin => {
      const name = skin.name.toLowerCase();
      const isMelee = skin.category === "Melee";
      const isLimited = name.includes("champions") || name.includes("arcane") || name.includes("vct") || name.includes("ignite");

      if (isLimited) return false;
      if (skin.tierUuid === ULTRA_TIER) return false;
      if (skin.tierUuid === EXCLUSIVE_TIER && !isMelee) return false;
      if (!skin.tierUuid) return false;

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

  const getTierClass = (uuid) => {
    switch(uuid) {
      case "12683d76-48d7-84a3-4e09-69857a424b33": return "select";
      case "3b62c16e-440d-327c-264d-910408542c16": return "deluxe";
      case "d1548d44-4b3a-cc5b-86d7-73d84a7e9373": return "premium";
      case "e0468541-403c-e400-3051-444772186842": return "exclusive";
      default: return "premium";
    }
  };

  const tierClass = getTierClass(skin.tierUuid);

  return (
    <div className={`market-card ${isRevealed ? 'flipped' : ''}`} onClick={() => setIsRevealed(true)}>
      <div className="card-inner">
        <div className={`card-front tier-border-${tierClass}`}>
          <div className="diamond-icon"></div>
        </div>
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