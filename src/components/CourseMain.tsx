import React from "react";
import "../styles/course.scss";

interface CourseMainProps {
  id: string;
  title: string;
  description: string;
}

function CourseMain({ id, title, description }: CourseMainProps) {
  return (
    <div className="course-main-container">
      <div className="course-float">
        <h1>{title}</h1>
        <div className="overview">
          <p>{description}</p>
        </div>
      </div>
      {/* Add more content as needed */}
    </div>
  );
}

export default CourseMain;
