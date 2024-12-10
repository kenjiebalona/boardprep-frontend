import React, { useState } from "react";
import axiosInstance from "../axiosInstance";
import "../styles/addtopicsubtopic.scss";
import { Subtopic } from "./typesTopicSubtopic"; 

interface AddSubtopicModalProps {
  topics: { topic_id: string; topic_title: string }[];
  selectedTopicId: string | null;
  onClose: () => void;
  onSubtopicAdded: (newSubtopic: Subtopic, topicId: string) => void;
}

const AddSubtopicModal: React.FC<AddSubtopicModalProps> = ({
  topics,
  selectedTopicId,
  onClose,
  onSubtopicAdded,
}) => {
  const [subtopicTitle, setSubtopicTitle] = useState("");
  const [order, setOrder] = useState<string>("");
  const [selectedTopic, setSelectedTopic] = useState<string>(
    selectedTopicId || ""
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleTopicChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedTopic(e.target.value);
  };

  const handleSubtopicTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSubtopicTitle(e.target.value);
  };

  const handleOrderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOrder(e.target.value); 
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await axiosInstance.post("/subtopics/", {
        topic: selectedTopic,
        subtopic_title: subtopicTitle,
        order,
      });
      const newSubtopic = response.data as Subtopic;
      onSubtopicAdded(newSubtopic, selectedTopic);
      onClose();
    } catch (error) {
      console.error("Error creating subtopic:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-background">
      <div className="modal-content-topssubs">
        <div className="modal-header">
            <h2>Add Subtopic</h2>
            <span className="close" onClick={onClose}>&times;</span>
        </div>
        <form onSubmit={handleSubmit}>
          <select
            id="topic"
            value={selectedTopic}
            onChange={handleTopicChange}
            required
          >
            <option value="">Select a Topic</option>
            {topics.map((topic) => (
              <option key={topic.topic_id} value={topic.topic_id}>
                {topic.topic_title}
              </option>
            ))}
          </select>
          <input
            type="text"
            id="subtopicTitle"
            placeholder="Subtopic Title"
            value={subtopicTitle}
            onChange={handleSubtopicTitleChange}
          />
          <input
            type="number"
            id="order"
            value={order}
            placeholder="Order"
            onChange={handleOrderChange}
            min="1"
          />
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Adding..." : "Add Subtopic"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddSubtopicModal;
