import { useState } from "react";
import { BsCheckCircleFill } from "react-icons/bs";
import { FaBookOpen } from "react-icons/fa";
import { useAppSelector } from '../redux/hooks';
import { selectUser } from '../redux/slices/authSlice';
import "../styles/syllabus.scss";

interface Topic {
  topic_id: string;
  topic_title: string;
  order: number;
  subtopics: Subtopic[];
}

interface Lesson {
  lesson_id: string;
  lesson_title: string;
  order: number;
  syllabus: string;
  completed: boolean;
  quiz_id: string;
  topics: Topic[];
}

interface Subtopic {
  subtopic_id: string;
  subtopic_title: string;
  order: number;
}

interface SyllabusProps {
  lessons: Lesson[];
  onLessonClick: (lessonId: string) => Promise<void>;
  onTopicClick: (topicId: string) => void;
  onSubtopicClick: (subtopicId: string) => void;
  currentLesson: string | null;
  currentTopic: string | null;
  currentSubtopic: string | null;
}

function Syllabus({
  lessons,
  onLessonClick,
  onTopicClick,
  onSubtopicClick,
  currentLesson,
  currentTopic,
  currentSubtopic,
}: SyllabusProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const user = useAppSelector(selectUser);
  const userType = user.token.type; // Ensure this matches your user store structure

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const getButtonLabel = () => {
    if (userType === 'C') return 'Edit';
    if (userType === 'T') return 'View';
    return 'Learn';
  };

  const handleLessonClick = (lessonId: string) => {
    onLessonClick(lessonId);
  };

  const handleTopicClick = (topicId: string) => {
    onTopicClick(topicId);
  };

  const handleSubtopicClick = (subtopicId: string) => {
    onSubtopicClick(subtopicId);
  };

  return (
    <div className="syllabus-container">
      <div className="title-container" onClick={toggleDropdown}>
        <h2>
          ⦿ Course Lessons {isDropdownOpen ? "▾" : "▸"}
        </h2>
      </div>

      {isDropdownOpen && (
        <div className="lesson-list">
          {lessons.map((lesson) => (
            <div key={lesson.lesson_id} className="lesson-container">
              <div className="lesson-item-cont">
                <div className="lesson-item-wrapper">
                  <div
                    className={`lesson-item ${lesson.completed ? '' : 'disabled'}`}
                    role="button"
                    tabIndex={0}
                    onClick={() => handleLessonClick(lesson.lesson_id)} 
                  >
                    <FaBookOpen className="lesson-icon" />
                    <h3 className="lesson-title">{lesson.lesson_title}</h3>
                    {lesson.completed && <BsCheckCircleFill className="completed-icon" />}
                  </div>

                  <div className="topics-container">
                    {lesson.topics.map((topic) => (
                      <div key={topic.topic_id}>
                        <div
                          className={`topic-item ${currentTopic === topic.topic_id ? 'active' : ''}`}
                          onClick={() => handleTopicClick(topic.topic_id)}
                          role="button"
                          tabIndex={0}
                        >
                          <span>{topic.topic_title}</span>
                        </div>
                        <div className="subtopics-container">
                          {topic.subtopics.map((subtopic) => (
                            <div
                              key={subtopic.subtopic_id}
                              className={`subtopic-item ${currentSubtopic === subtopic.subtopic_id ? 'active' : ''}`}
                              onClick={() => handleSubtopicClick(subtopic.subtopic_id)}
                              role="button"
                              tabIndex={0}
                            >
                              <span>{subtopic.subtopic_title}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <button className="learn-button" onClick={() => handleLessonClick(lesson.lesson_id)}>
                    {getButtonLabel()}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Syllabus;
