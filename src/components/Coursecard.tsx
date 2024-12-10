import React from "react";
import { Link } from "react-router-dom";
import "../styles/coursecard.scss";

interface CourseCardProps {
  id: string;
  course_title: string;
  short_description: string;
  image: string;
  onSelectCourse: (courseId: string, courseTitle: string) => void;
}

function CourseCard({
  id,
  course_title,
  short_description,
  image,
  onSelectCourse,
}: CourseCardProps) {
  const handleSelectCourse = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault(); // Prevents the link navigation
    console.log("Selected Course ID:", id); // Debug: Log the course ID
    onSelectCourse(id, course_title);
  };

  return (
    <div className="coursecard">
      <div className="imagebox">
        <img src={image} alt={course_title} className="img" />
      </div>
      <div className="defbox">
        <h3>{course_title}</h3>
      </div>
      <button className="interactive-button" onClick={handleSelectCourse}>
        Add Course
      </button>
    </div>
  );
}

export default CourseCard;
