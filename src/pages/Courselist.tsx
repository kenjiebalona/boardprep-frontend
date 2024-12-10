import React, { useEffect, useState } from "react";
import CourseCard from "../components/Coursecard";
import Searchbar from "../components/SearchBar";
import "../styles/courselist.scss";
import axiosInstance from "../axiosInstance";

interface Course {
  course_id: string;
  course_title: string;
  short_description: string;
  image: string;
  is_published: boolean;
}

interface CourseListProps {
  onSelectCourse: (courseId: string, courseTitle: string) => void;
}

function CourseList({ onSelectCourse }: CourseListProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);

  const fetchCourses = async () => {
    try {
      const response = await axiosInstance.get("/courses/");
      const publishedCourses = response.data.filter(
        (course: Course) => course.is_published
      );
      setCourses(publishedCourses);
      setFilteredCourses(publishedCourses);
    } catch (error) {
      console.error("Error fetching courses:", error);
      // Handle error (show message or UI element)
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleSearch = (query: string) => {
    if (!query) {
      setFilteredCourses(courses);
      return;
    }
    const lowerCaseQuery = query.toLowerCase();
    const filtered = courses.filter(
      (course) =>
        course.course_title.toLowerCase().includes(lowerCaseQuery) ||
        course.course_id.toLowerCase().includes(lowerCaseQuery)
    );
    setFilteredCourses(filtered);
  };

  return (
    <div className="coursepage-container">
      <Searchbar onSearch={handleSearch} /> {/* Implement the Searchbar here */}
      <div className="coursecards-container">
        {filteredCourses.map((course) => (
          <CourseCard
            key={course.course_id}
            id={course.course_id}
            course_title={course.course_title}
            image={course.image}
            short_description={course.short_description}
            onSelectCourse={() =>
              onSelectCourse(course.course_id, course.course_title)
            }
          />
        ))}
      </div>
    </div>
  );
}

export default CourseList;
