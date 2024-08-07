import React from "react";
import "../styles/card-challenge.scss";
import challenge from '../assets/challenge.png';

const CardChallenge = () => {
  return (
    <div className="space">
      <h3 className="container-title">DAILY CHALLENGE</h3>
      <div className="picture-button-container">
        <img
          src={challenge} 
          alt="Sample"
          className="container-image"
        />
        <button className="container-button">NEW CHALLENGE AVAILABLE</button>
      </div>
    </div>
  );
};

export default CardChallenge;
