import React, { useState } from "react";

// Import images statically if possible
import image1 from "../assets/16.png";
import image2 from "../assets/17.png";
import image3 from "../assets/17.png";

const Carousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [images] = useState([image1, image2, image3]);

  const handlePrev = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex > 0 ? prevIndex - 1 : images.length - 1
    );
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex < images.length - 1 ? prevIndex + 1 : 0
    );
  };

  return (
    <div className="carousel">
      <div className="carousel-items">
        {images.map((image, index) => (
          <div
            key={index}
            className={`carousel-item ${
              currentIndex === index ? "active" : ""
            }`}
          >
            <img src={image} alt={`Image ${index + 1}`} />
          </div>
        ))}
      </div>
      <button onClick={handlePrev}>Previous</button>
      <button onClick={handleNext}>Next</button>
    </div>
  );
};

export default Carousel;
