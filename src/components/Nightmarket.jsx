import React, { useState, useEffect } from 'react';
import './nightmarket.css';
// CHECK THIS NAME: must exactly match the file in your assets folder
import nmBg from '../assets/nightmarket.png';

const nightmarket = ({ allSkins }) => {
  const [marketSkins, setMarketSkins] = useState([]);

  useEffect(() => {
    const ULTRA_TIER = "0cebb8be-46d7-c12a-d306-e9907ad5a0a1";
    const EXCLUSIVE_TIER = "e0468541-403c-e400-3051-444772186842";

    const filtered = allSkins.filter(skin => {
      const name = skin.name.toLowerCase();
      const isMelee = skin.category === "Melee";
      const isLimited = name.includes("champions") || name.includes("arcane") || name.includes("vct") || name.includes("ignite");

      if (isLimited) return false;
      if (skin.tierUuid === ULTRA_TIER) return false;
      if (skin.tierUuid === EXCLUSIVE_TIER && !isMelee) return false;
      return !!skin.tierUuid;
    });

    setMarketSkins(filtered.sort(() => 0.5 - Math.random()).slice(0, 6));
  }, [allSkins]);

  return (
    <div className="nm-container" style={{ backgroundImage: `url(${nmBg})` }}>
      <div className="nm-overlay">
        <h1 className="nm-title">NIGHT.MARKET</h1>
        <div className="nm-grid">
          {marketSkins.map((skin, i) => <NMCard key={i} skin={skin} />)}
        </div>
      </div>
    </div>
  );
};

const NMCard = ({ skin }) => {
  const [flipped, setFlipped] = useState(false);
  const [discount] = useState(Math.floor(Math.random() * 40) + 10);
  
  const getTier = (uuid) => {
    if (uuid === "12683d76-48d7-84a3-4e09-69857a424b33") return "select";
    if (uuid === "3b62c16e-440d-327c-264d-910408542c16") return "deluxe";
    if (uuid === "d1548d44-4b3a-cc5b-86d7-73d84a7e9373") return "premium";
    return "exclusive";
  };

  const tier = getTier(skin.tierUuid);

  return (
    <div className={`nm-card ${flipped ? 'flipped' : ''}`} onClick={() => setFlipped(true)}>
      <div className="nm-card-inner">
        <div className={`nm-front tier-border-${tier}`}><div className="nm-diamond"></div></div>
        <div className={`nm-back tier-bg-${tier}`}>
          <div className="nm-discount">-{discount}%</div>
          <div className="nm-price">{Math.floor(skin.price * (1 - discount/100))} VP</div>
          <div className="nm-img-box"><img src={skin.image} className="nm-gun" alt="" /></div>
          <div className="nm-info"><h4>{skin.name}</h4><p>{skin.category}</p></div>
        </div>
      </div>
    </div>
  );
};

export default nightmarket;