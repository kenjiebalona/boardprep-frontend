import "../styles/testing.scss";
import image from "../assets/materialscience.png";
import React from "react";

function MaterialScience() {
  return (
    <div className="coursecard">
      <img className="imagebox" src={image} alt="description of image" />
      <div className="defbox">
        <h3>Material Science</h3>
        <p>
          Material Science investigates the properties, structures, and
          applications of engineering materials.{" "}
        </p>
      </div>
    </div>
  );
}

export default MaterialScience;
