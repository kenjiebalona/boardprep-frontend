import { AxiosResponse } from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../axiosInstance";
import CourseCard from "../components/CoursecardC";
import CourseModal from "../components/CourseModal";
import Searchbar from "../components/SearchBar";
import "../styles/admin.scss";

interface Specialization {
  id: string;
  name: string;
}
interface Course {
  course_id: string;
  course_title: string;
  short_description: string;
  image: string;
  specializations: string[]; 
}

const AdminDashboard: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isCreateCourseModalOpen, setIsCreateCourseModalOpen] = useState(false);
  const navigate = useNavigate();
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [availableSpecializations, setAvailableSpecializations] = useState<Specialization[]>([]);

  useEffect(() => {
    fetchCourses();
    fetchSpecializations();
  }, []);

  const fetchCourses = async () => {
    try {
      const response: AxiosResponse = await axiosInstance.get("/courses/");
      setCourses(response.data);
      setFilteredCourses(response.data);
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };

  const fetchSpecializations = async () => {
    try {
      const response: AxiosResponse = await axiosInstance.get("/specializations/");
      setAvailableSpecializations(response.data);
      console.log(response.data)
    } catch (error) {
      console.error("Error fetching specializations:", error);
    }
  };
  

  const handleCreateCourse = () => {
    setIsCreateCourseModalOpen(true);
  };

  const handleSelectCourse = (courseId: string) => {
    navigate(`/courses/${courseId}/edit`);
  };

  const handleCloseCreateCourseModal = () => {
    setIsCreateCourseModalOpen(false);
    fetchCourses();
  };

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
    <div className="admin-dashboard-background">
      <header className="admin-header">
        <h1>Course Management</h1>
        <div className="search">
          <Searchbar onSearch={handleSearch} />
        </div>
        
      </header>
      <div className="course-list">
        {filteredCourses.map((course) => (
          <CourseCard
            key={course.course_id}
            id={course.course_id}
            course_title={course.course_title}
            short_description={course.short_description}
            image={course.image}
            onSelectCourse={handleSelectCourse}
            showButton={true}
            small={false}
          />
        ))}
        <div className="button-container-two">
          <button className="create-course-btn" onClick={handleCreateCourse}>
            Create Course +
          </button>
        </div>
      </div>

      {isCreateCourseModalOpen && (
        <CourseModal
          closeModal={handleCloseCreateCourseModal}
          course={null}
          onUpdateDashboard={fetchCourses}
          availableSpecializations={availableSpecializations} 
        />
      )}
    </div>
  );
};

export default AdminDashboard;
