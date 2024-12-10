import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/card-challenge.scss";
import challenge from '../assets/challenge.png';

const CardChallenge: React.FC = () => {
  const navigate = useNavigate();

  const handleButtonClick = () => {
    navigate("/daily-challenge"); 
  };

  return (
    <div className="space">
      <h3 className="container-title">DAILY CHALLENGE</h3>
      <div className="picture-button-container">
        <img
          src={challenge} 
          alt="Sample"
          className="container-image"
        />
        <button className="container-button" onClick={handleButtonClick}>
          CHECK FOR NEW CHALLENGE
        </button>
      </div>
    </div>
  );
};

export default CardChallenge;
