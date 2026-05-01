import React from 'react';
import './SkinCard.css';

const SkinCard = ({ skin, onEquip }) => {
  // We use the 'displayIcon' from the API for the image
  return (
    <div className="skin-card" onClick={() => onEquip(skin)}>
      <div className="rarity-bar" style={{ backgroundColor: `#${skin.contentTierUuid?.slice(-6) || 'ffffff'}` }}></div>
      <img src={skin.displayIcon} alt={skin.displayName} className="skin-img" />
      <div className="skin-info">
        <h4>{skin.displayName}</h4>
        <button className="equip-btn">VIEW DETAILS</button>
      </div>
    </div>
  );
};

export default SkinCard;