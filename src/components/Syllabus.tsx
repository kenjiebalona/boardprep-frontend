import React, { useState, useEffect } from "react";
import "../styles/syllabus.scss";
import { FaLock, FaBookOpen } from "react-icons/fa";
import { BsShieldCheck, BsCheckCircleFill } from "react-icons/bs";
import { useAppSelector } from '../redux/hooks';
import { selectUser } from '../redux/slices/authSlice';
import { TbTargetArrow } from "react-icons/tb";
import axiosInstance from "../axiosInstance"; 

interface Lesson {
  lesson_id: string;
  lesson_title: string;
  completed: boolean;
  quiz_id: string;
}

interface SyllabusProps {
  lessons: Lesson[];
  onLessonClick: (lessonId: string, isQuiz: boolean) => void;
  currentLessonIndex: number;
  classId: string; 
}

function Syllabus({ lessons, onLessonClick, currentLessonIndex, classId }: SyllabusProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [className, setClassName] = useState("");
  const user = useAppSelector(selectUser);
  const userType = user.token.type;

  useEffect(() => {
    const fetchClass = async () => {
      try {
        console.log("Fetching class with ID:", classId);
        const response = await axiosInstance.get(`/classes/${classId}/`);
        setClassName(response.data.className);
      } catch (err) {
        console.error(err);
      }
    };
    fetchClass();
  }, [classId]);
  

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const getButtonLabel = () => {
    if (userType === 'C') return 'Edit';
    if (userType === 'T') return 'View';
    return 'Learn';
  };

  const allCompleted = lessons.every(lesson => lesson.completed);

  return (
    <div className="syllabus-container">
      <div className="title-container" onClick={toggleDropdown}>
        <h2>
          ⦿ LESSONS {isDropdownOpen ? "▾" : "▸"}
        </h2>
      </div>

      {isDropdownOpen && (
        <div className="lesson-list">
          {lessons.map((lesson, index) => (
            <div key={lesson.lesson_id} className="lesson-container">
              <div className="lesson-item-cont">
                <div className="lesson-item-wrapper">
                  <div
                    className={`lesson-item ${
                      userType === 'S' && index > currentLessonIndex ? 'disabled' : ''
                    }`}
                    role="button"
                    tabIndex={0}
                  >
                    <FaBookOpen className="lesson-icon" /> 
                    <h3 className="lesson-title">{lesson.lesson_title}</h3>
                    {lesson.completed && <BsCheckCircleFill className="completed-icon" />} 
                    {userType === 'S' && index > currentLessonIndex && (
                      <FaLock className="lock-icon" />
                    )} 
                  </div>

                  {(userType !== 'S' || index <= currentLessonIndex) && (
                    <button
                      className="learn-button"
                      onClick={() => onLessonClick(lesson.lesson_id, false)}
                    >
                      {getButtonLabel()}
                    </button>
                  )}
                </div>
              </div>

              {userType === 'S' && (
                <div className="quiz-container">
                  <div
                    className={`quiz-item ${
                      index > currentLessonIndex || !lesson.completed ? 'disabled' : ''
                    }`}
                    onClick={() =>
                      index <= currentLessonIndex && lesson.completed && onLessonClick(lesson.quiz_id, true)
                    }
                    role="button"
                    tabIndex={0}
                  >
                    <BsShieldCheck className="quiz-icon" /> 
                  <span className="quiz-label">{lesson.lesson_title} Quiz</span>
                  {index > currentLessonIndex && <FaLock className="quiz-lock-icon" />}
                  </div>
                </div>
              )}
            </div>
          ))}

          {userType === 'S' && (
          <div className="exam-container">
            <div
              className={`exam-item ${!allCompleted ? 'disabled' : ''}`}
              onClick={() => allCompleted && onLessonClick('final_exam', true)}
              role="button"
              tabIndex={0}
            >
              <TbTargetArrow className="exam-icon" /> 
              <h3 className="exam-title">{classId} Exam</h3>
              {!allCompleted && <FaLock className="exam-lock-icon" />}
            </div>
          </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Syllabus;
