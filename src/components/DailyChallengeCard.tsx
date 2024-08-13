import React from "react";
import { motion } from "framer-motion";
import books from '../assets/books.png'; 
import "../styles/daily-challenge-card.scss";

interface DailyChallengeCardProps {
  title: string;
  description: string;
  descriptionPart2?: string;
  buttonText: string;
  image?: string;
  color: {
    backGround: string;
    boxShadow: string;
  };
  className?: string;
  imageClassName?: string;
  onButtonClick?: () => void; 
}

const DailyChallengeCard: React.FC<DailyChallengeCardProps> = ({ title, description, descriptionPart2, buttonText, image = books, color, className, imageClassName, onButtonClick }) => {
  return (
    <motion.div
      className={`DailyChallengeCard ${className}`}
      style={{
        background: color.backGround,
        boxShadow: color.boxShadow,
      }}
    >
      <div className="DailyChallengeCardContent">
        <div className={`DailyChallengeCardImage ${imageClassName}`}>
          <img src={image} alt={title} className="container-image-two" />
        </div>
        <div className="DailyChallengeCardText">
          <h3>{title}</h3>
          <p>
            {description}
            {descriptionPart2 && (
              <>
                <br />
                <span>{descriptionPart2}</span>
              </>
            )}
          </p>
          {buttonText && <button onClick={onButtonClick}>{buttonText}</button>}
        </div>
      </div>
    </motion.div>
  );
};

export default DailyChallengeCard;