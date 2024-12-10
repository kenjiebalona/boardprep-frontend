import React from "react";
import "../styles/class.scss";
import { Link } from "react-router-dom";
import biomech from '../assets/biomech.png';

interface Class {
  classId: number;
  className: string;
  classDescription: string;
  teacher_name: string;
  course: string;
  image: string;
  students: string[];
  classCode: string;
}

interface ClassCardProps {
  class: Class;
  showButton?: boolean;
  small?: boolean;
}

function ClassCard({ class: classItem, showButton = true, small = false }: ClassCardProps) {
  return (
    <div className={`class-card ${small ? 'small' : ''}`}>
      <img
        src={biomech}
        className="logo"
        alt="RILL"
      />
      <div className="card-text">
        <div>
          <p className="card-title">{classItem.className}</p>
          <p className="card-duration">{classItem.teacher_name}</p>
          <p className="card-description">{classItem.classDescription}</p>
        </div>
        {showButton && (
          <Link to={`/classes/${classItem.classId}`} className="card-button">
            <button className="card-button">Classroom</button>
          </Link>
        )}
      </div>
    </div>
  );
}

export default ClassCard;
