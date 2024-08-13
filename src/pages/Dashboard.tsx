import React, { useEffect, useState } from "react";
import "../styles/dashboard.scss";
import DashboardCards from "../components/DashboardCards";
import CardChallenge from "../components/CardChallenge";
import CardLeaderboard from "../components/CardLeaderboard";
import ClassCard from "../components/ClassCard";
import CourseCard from "../components/CoursecardC";
import axiosInstance from "../axiosInstance";
import { useAppSelector } from "../redux/hooks";
import { selectUser } from "../redux/slices/authSlice";

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

interface Course {
  course_id: string;
  course_title: string;
  short_description: string;
  image: string;
}

const Dashboard = () => {
  const user = useAppSelector(selectUser);
  const [classes, setClasses] = useState<Class[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [userDetails, setUserDetails] = useState<any>({});

  useEffect(() => {
    fetchClasses();
    fetchUserDetails();
    if (user.token.type === "C") {
      fetchCourses();
    }
  }, [user.token]);

  const fetchClasses = async () => {
    try {
      const response = await axiosInstance.get(
        `/classes/?${user.token.type === "T" ? "teacher_id" : "student_id"}=${
          user.token.id
        }`
      );
      setClasses(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await axiosInstance.get(`/courses/`);
      setCourses(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUserDetails = async () => {
    try {
      const res = await axiosInstance.get('/get/user/', {
        params: {
          username: user.token.id,
        },
      });
      setUserDetails(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const handleSelectCourse = (courseId: string) => {
    // Handle course selection
  };

  // Define the maximum number of cards to display based on user type
  const maxClassesToShow = user.token.type === "S" ? 3 : 4;
  const maxCoursesToShow = 4;

  return (
    <div className="MainDash">
      <div className="MainDash-two">
        {(user.token.type === "T" || user.token.type === "C") && (
          <h2 className="overview">OVERVIEW</h2>
        )}
        {user.token.type === "S" && (
          <div>
            <h3>Hello,</h3>
            <h2 className="profile-h2">
              {userDetails.first_name
                ? `${userDetails.first_name} ${userDetails.last_name}!👋`
                : "DASHBOARD"}
            </h2>
          </div>
        )}
        <DashboardCards userType={user.token.type} userDetails={userDetails} />
        <h3>{user.token.type === "C" ? "RECENT COURSES" : "MY CLASSES"}</h3>
        <div className="ClassesContainer">
          {user.token.type === "C" ? (
            courses.slice(0, maxCoursesToShow).map((course, index) => (
              <CourseCard
                key={index}
                id={course.course_id}
                course_title={course.course_title}
                short_description={course.short_description}
                image={course.image}
                onSelectCourse={handleSelectCourse}
                showButton={false}
                small={true}
              />
            ))
          ) : (
            classes.slice(0, maxClassesToShow).map((classItem, index) => (
              <ClassCard
                key={index}
                class={classItem}
                showButton={false}
                small={true}
              />
            ))
          )}
        </div>
      </div>
      {user.token.type === "S" && (
        <div className="right-side">
          <CardChallenge />
          <CardLeaderboard studentId={user.token.id} showTimeTaken={false} />
        </div>
      )}
    </div>
  );
};

export default Dashboard;
