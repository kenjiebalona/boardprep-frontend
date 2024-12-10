import React from "react";
import "../styles/course-list-popup.scss";

// Define a Course interface for the CourseCardProps
interface Course {
  course_id: string;
  course_title: string;
  short_description: string;
  long_description: string;
  image: string;
  is_published: boolean; // Add this field
}

interface CourseListPopupProps {
  show: boolean;
  onSelectCourse: (course: Course) => void;
  courses: Course[];
}

const CourseListPopup = ({
  show,
  onSelectCourse,
  courses,
}: CourseListPopupProps) => {
  if (!show) {
    return null;
  }

  return (
    <div className="course-list-popup">
      {courses
        .filter((course) => course.is_published)
        .map((course) => (
          <div key={course.course_id} onClick={() => onSelectCourse(course)}>
            <h3>{course.course_title}</h3>
            <p>{course.short_description}</p>
            {/* Add more course details as needed */}
          </div>
        ))}
    </div>
  );
};

export default CourseListPopup;
