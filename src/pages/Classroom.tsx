// Classroom.tsx

import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import profileImage from "../assets/16.png";
import "../styles/classroom.scss";
import PostsTab from "../components/PostsTab";
import StudentsTab from "../components/StudentsTab";
import Materials from "../components/Materials";
import ActivitiesTab from "../components/ActivitiesTab";
import { useAppSelector } from "../redux/hooks";
import { selectUser } from "../redux/slices/authSlice";
import DropDownProfile from "../components/DropDownProfile";
import axiosInstance from "../axiosInstance";

interface Class {
  classId: number;
  className: string;
  classDescription: string;
  course: string;
  students: string[];
  classCode: string;
  teacher: string;
}

interface JoinRequest {
  id: number;
  is_accepted: boolean;
  class_instance: number;
  student: string;
}

function Classroom() {
  const user = useAppSelector(selectUser);
  const { id } = useParams(); // This retrieves the classId as a string
  const classId = Number(id); // Convert classId to a number
  const [classItem, setClass] = useState<Class>();
  const [activeLink, setActiveLink] = useState("Posts");
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([]);
  const [openProfile, setOpenProfile] = useState(false);
  const navigate = useNavigate();

  const fetchClass = async () => {
    try {
      let response = await axiosInstance.get(`/classes/${classId}/`);
      setClass(response.data);
      response = await axiosInstance.get(`/join-requests/?class_id=${classId}`);
      setJoinRequests(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const fetchClass = async () => {
      try {
        let response = await axiosInstance.get(
          `/join-requests/?class_id=${classId}`
        );
        setJoinRequests(response.data);
        response = await axiosInstance.get(`/classes/${classId}/`);
        setClass(response.data);
        if (user.token.type === "T") {
          if (user.token.id !== response.data.teacher) {
            navigate(`/classes`);
          }
        } else {
          let studentInClass = false;
          response.data.students.forEach((student: string) => {
            if (student === user.token.id) {
              studentInClass = true;
            }
          });
          if (!studentInClass) {
            navigate(`/classes`);
          }
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchClass();
  }, [classId]);

  const renderTab = () => {
    if (!classItem) return null;
    switch (activeLink) {
      case "Posts":
        return <PostsTab classId={classItem.classId} />;
      case "Students":
        return (
          <StudentsTab
            classId={classItem.classId}
            joinRequests={joinRequests}
            students={classItem.students}
            teacher={classItem.teacher}
            fetchClass={fetchClass}
            classItem={classItem}
          />
        );
      case "Materials":
        return <Materials courseId={classItem.course} studentId={user.token.id} classId={classId} />;
      case "Activities":
        return <ActivitiesTab classId={classItem.classId} />;
      default:
        return <PostsTab classId={classItem.classId} />;
    }
  };

  return (
    <div className="class-background">
      <div className="header-classroom">
        <div className="left-header">
          <div className="left-header--title">
            <h1>Classroom</h1>
            <h3>{classItem && classItem.className}</h3>
          </div>
          <nav className="class-nav">
            <ul className="room-ul">
              <li
                className={activeLink === "Posts" ? "active" : ""}
                onClick={() => setActiveLink("Posts")}
              >
                Posts
              </li>
              <li
                className={activeLink === "Materials" ? "active" : ""}
                onClick={() => setActiveLink("Materials")}
              >
                Materials
              </li>
              <li
                className={activeLink === "Activities" ? "active" : ""}
                onClick={() => setActiveLink("Activities")}
              >
                Activities
              </li>
              <li
                className={activeLink === "Students" ? "active" : ""}
                onClick={() => setActiveLink("Students")}
              >
                Students
              </li>
            </ul>
          </nav>
        </div>
      </div>
      <div className="class-content">{renderTab()}</div>
    </div>
  );
}

export default Classroom;
