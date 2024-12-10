import React from "react";
import "../styles/dashboard-cards.scss";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import diamond from '../assets/diamond.png';
import megaphone from '../assets/megaphone.png';
import books from '../assets/books.png';

interface CardProps {
  title: string;
  description: string;
  descriptionPart2?: string;
  buttonText: string;
  image: string;
  color: {
    backGround: string;
    boxShadow: string;
  };
  className?: string;
  imageClassName?: string;
  imageRight?: boolean;
  onButtonClick?: () => void; 
}

const Card: React.FC<CardProps> = ({ title, description, descriptionPart2, buttonText, image, color, className, imageClassName, imageRight, onButtonClick }) => {
  return (
    <motion.div
      className={`Card ${className}`}
      style={{
        background: color.backGround,
        boxShadow: color.boxShadow,
      }}
    >
      <div className={`CardContent ${imageRight ? "imageRight" : ""}`}>
        {!imageRight && (
          <div className={`CardImage ${imageClassName}`}>
            <img src={image} alt={title} className="container-image-two" />
          </div>
        )}
        <div className={`CardText ${className === "teacherCard" ? "teacherCardText" : className === "contentCreatorCard" ? "contentCreatorCardText" : ""}`}>
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
        {imageRight && (
          <div className={`CardImage ${imageClassName}`}>
            <img src={image} alt={title} className="container-image-two" />
          </div>
        )}
      </div>
    </motion.div>
  );
};

const DashboardCards: React.FC<{ userType: string, userDetails: any }> = ({ userType, userDetails }) => {
  const navigate = useNavigate();

  const studentCardsData = [
    {
      title: "Join a new class NOW!",
      description: "For Students",
      buttonText: "",
      image: megaphone,
      color: {
        backGround: "#29273C",
        boxShadow: "0px 5px 10px 0px #e0c6f5",
      },
      className: "smallCard",
      imageClassName: "megaphoneImage"
    },
    {
      title: "Go Premium",
      description: "Packed with the best features for engaging your classes.",
      buttonText: "EXPLORE NOW",
      image: diamond,
      color: {
        backGround: "#29273C",
        boxShadow: "0px 5px 10px 0px #e0c6f5",
      },
      className: "largeCard",
      imageClassName: "diamondImage",
      onButtonClick: () => navigate("/payment"),
    },
  ];

  const teacherContentCreatorCard = {
    teacher: {
      title: `Hello ${userDetails.first_name} ${userDetails.last_name}, Welcome back!`,
      description: "As an educator joining BoardPrep, elevate your teaching with insightful analytics and tools.",
      descriptionPart2: "Track student progress, customize lessons, and collaborate seamlessly.",
      buttonText: "Create Class",
      image: books, 
      color: {
        backGround: "#29273C",
        boxShadow: "0px 5px 10px 0px #e0c6f5",
      },
      className: "teacherCard",
      imageClassName: "teacherImage",
      imageRight: true,
      onButtonClick: () => navigate("/classes"), 
    },
    contentCreator: {
      title: `Hello ${userDetails.first_name} ${userDetails.last_name}, Welcome back!`,
      description: "As an creator joining BoardPrep, elevate your content with insightful analytics and tools.",
      descriptionPart2: "Track student progress, customize lessons, and collaborate seamlessly.",
      buttonText: "Create Course",
      image: books, 
      color: {
        backGround: "#29273C",
        boxShadow: "0px 5px 10px 0px #e0c6f5",
      },
      className: "contentCreatorCard",
      imageClassName: "contentCreatorImage",
      imageRight: true,
      onButtonClick: () => navigate("/content"), 
    }
  };

  return (
    <div className="Cards">
      {userType === "S" ? (
        studentCardsData.map((card, id) => (
          <div className="parentContainer" key={id}>
            <Card
              title={card.title}
              description={card.description}
              buttonText={card.buttonText}
              image={card.image}
              color={card.color}
              className={card.className}
              imageClassName={card.imageClassName}
              onButtonClick={card.onButtonClick} 
            />
          </div>
        ))
      ) : (
        <div className="parentContainer">
          <Card
            title={teacherContentCreatorCard[userType === "T" ? "teacher" : "contentCreator"].title}
            description={teacherContentCreatorCard[userType === "T" ? "teacher" : "contentCreator"].description}
            descriptionPart2={teacherContentCreatorCard[userType === "T" ? "teacher" : "contentCreator"].descriptionPart2}
            buttonText={teacherContentCreatorCard[userType === "T" ? "teacher" : "contentCreator"].buttonText}
            image={teacherContentCreatorCard[userType === "T" ? "teacher" : "contentCreator"].image}
            color={teacherContentCreatorCard[userType === "T" ? "teacher" : "contentCreator"].color}
            className={teacherContentCreatorCard[userType === "T" ? "teacher" : "contentCreator"].className}
            imageClassName={teacherContentCreatorCard[userType === "T" ? "teacher" : "contentCreator"].imageClassName}
            imageRight={teacherContentCreatorCard[userType === "T" ? "teacher" : "contentCreator"].imageRight}
            onButtonClick={teacherContentCreatorCard[userType === "T" ? "teacher" : "contentCreator"].onButtonClick} 
          />
        </div>
      )}
    </div>
  );
};

export default DashboardCards;
