import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "../axiosInstance";
import "../styles/details.scss";

interface Course {
  course_id: string;
  course_title: string;
  short_description: string;
  long_description: string;
  image: string;
  is_published: boolean;
}

interface Subtopic {
  subtopic_id: string;
  subtopic_title: string;
}

interface Topic {
  topic_id: string;
  topic_title: string;
  subtopics: Subtopic[];
}

interface Lesson {
  lesson_id: string;
  lesson_title: string;
  order: number;
  syllabus: string;
  completed: boolean;
  quiz_id: string;
  topics: Topic[]; // Include topics in Lesson
}

function CourseDetails() {
  const { courseId } = useParams<{ courseId: string }>();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [courseData, setCourseData] = useState<Course | null>(null);

  useEffect(() => {
    if (courseId) {
      fetchCourseData();
    }
  }, [courseId]);

  const fetchCourseData = async () => {
    try {
      const response = await axiosInstance.get(`/courses/${courseId}/`);
      setCourseData(response.data);
      setLessons(response.data.syllabus.lessons); // Assuming lessons are nested in syllabus
    } catch (error) {
      console.error("Error fetching course data:", error);
    }
  };

  const renderSubtopics = (subtopics: Subtopic[]) => {
    return subtopics.map((subtopic) => (
      <div key={subtopic.subtopic_id} className="subtopic">
        <h4>{subtopic.subtopic_title}</h4>
        {/* Additional subtopic content can be displayed here */}
      </div>
    ));
  };

  const renderTopics = (topics: Topic[]) => {
    return topics.map((topic) => (
      <div key={topic.topic_id} className="topic">
        <h3>{topic.topic_title}</h3>
        {renderSubtopics(topic.subtopics)}
      </div>
    ));
  };

  const renderLessons = () => {
    return lessons.map((lesson) => (
      <div key={lesson.lesson_id} className="lesson">
        <h2>{lesson.lesson_title}</h2>
        {lesson.topics && renderTopics(lesson.topics)}
      </div>
    ));
  };

  return (
    <div className="course-details">
      <header>
        <h1>{courseData?.course_title}</h1>
      </header>
      <div className="lessons-container">{renderLessons()}</div>
      <button className="pre-assessment-btn">Take Pre Assessment</button>
    </div>
  );
}

export default CourseDetails;
