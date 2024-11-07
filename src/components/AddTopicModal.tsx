import React, { useState } from "react";
import axiosInstance from "../axiosInstance";
import "../styles/addtopicsubtopic.scss";
import { Lesson, Topic } from "./typesTopicSubtopic";

interface AddTopicModalProps {
  lessons: Lesson[];
  selectedLessonId: string | null;
  onClose: () => void;
  onTopicAdded: (newTopic: Topic, lessonId: string) => void;
}

const AddTopicModal: React.FC<AddTopicModalProps> = ({
  lessons,
  selectedLessonId,
  onClose,
  onTopicAdded,
}) => {
  const [topicTitle, setTopicTitle] = useState("");
  const [order, setOrder] = useState<string>("");
  const [selectedLesson, setSelectedLesson] = useState<string>(
    selectedLessonId || ""
  );
  const [isSubmitting, setIsSubmitting] = useState(false); 

  const handleLessonChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedLesson(e.target.value);
  };

  const handleTopicTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTopicTitle(e.target.value);
  };

  const handleOrderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOrder(e.target.value); 
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await axiosInstance.post("/topics/", {
        lesson: selectedLesson,
        topic_title: topicTitle,
        order,
      });
      const newTopic = response.data as Topic;
      onTopicAdded(newTopic, selectedLesson); 
      onClose();
    } catch (error) {
      console.error("Error creating topic:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-background">
      <div className="modal-content-topssubs">
        <div className="modal-header">
            <h2>Add Topic</h2>
            <span className="close" onClick={onClose}>&times;</span>
        </div>
        <form onSubmit={handleSubmit}>
          <select
            id="lesson"
            value={selectedLesson}
            onChange={handleLessonChange}
            required
          >
             <option value="">Select a Lesson</option>
            {lessons.map((lesson) => (
              <option key={lesson.lesson_id} value={lesson.lesson_id}>
                {`${lesson.lesson_title}`}
              </option>
            ))}
          </select>
          <input
            type="text"
            id="topicTitle"
            placeholder="Topic Title"
            value={topicTitle}
            onChange={handleTopicTitleChange}
          />
          <input
            type="number"
            id="order"
            value={order}   
            placeholder="Order"
            onChange={handleOrderChange}
            min="1"
            required
          />
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Adding..." : "Add Topic"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddTopicModal;
