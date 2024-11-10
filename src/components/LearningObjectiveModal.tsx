import React, { useState, useEffect } from "react";
import axiosInstance from "../axiosInstance";
import "../styles/addlearningobj.scss";
import axios, { AxiosError } from 'axios';

interface Subtopic {
  subtopic_id: string;
  subtopic_title: string;
}

interface LearningObjectiveModalProps {
  closeModal: () => void;
  onSave: () => void;
}

const LearningObjectiveModal: React.FC<LearningObjectiveModalProps> = ({
  closeModal,
  onSave,
}) => {
  const [subtopics, setSubtopics] = useState<Subtopic[]>([]);
  const [selectedSubtopic, setSelectedSubtopic] = useState<string>("");
  const [objectiveFields, setObjectiveFields] = useState<string[]>([""]);

  useEffect(() => {
    const fetchSubtopics = async () => {
      try {
        const response = await axiosInstance.get("/subtopics/");
        setSubtopics(response.data);
      } catch (error) {
        console.error("Error fetching subtopics:", error);
      }
    };

    fetchSubtopics();
  }, []);

  const handleAddObjectiveField = () => {
    setObjectiveFields([...objectiveFields, ""]);
  };

  const handleRemoveObjectiveField = (index: number) => {
    const updatedFields = objectiveFields.filter((_, i) => i !== index);
    setObjectiveFields(updatedFields);
  };

  const handleObjectiveChange = (index: number, text: string) => {
    const updatedFields = [...objectiveFields];
    updatedFields[index] = text;
    setObjectiveFields(updatedFields);
  };

  const handleSave = async () => {
    if (!selectedSubtopic || objectiveFields.some((field) => field.trim() === "")) {
      alert("Please select a subtopic and enter all objectives.");
      return;
    }
  
    try {
      for (const text of objectiveFields) {
        const objectiveData = {
          subtopic: selectedSubtopic,
          text,
        };
  
        await axiosInstance.post("/objectives/", objectiveData);
      }
      onSave(); 
      closeModal();
    } catch (error) {
      console.error("Error saving learning objectives:", error);
      if (axios.isAxiosError(error) && error.response) {
        console.error("Server response data:", error.response.data);
      }
    }
  };

  return (
    <div className="modal-background">
      <div className="modal-content-topssubs">
        <div className="modal-header">
            <h2>Add Learning Objectives</h2>
            <span className="close" onClick={closeModal}>&times;</span>
        </div>
        <form>
          <div className="form-group">
            <select
              id="subtopic"
              value={selectedSubtopic}
              onChange={(e) => setSelectedSubtopic(e.target.value)}
              className="form-control"
            >
              <option value="">Select a subtopic</option>
              {subtopics.map((subtopic) => (
                <option key={subtopic.subtopic_id} value={subtopic.subtopic_id}>
                  {subtopic.subtopic_title}
                </option>
              ))}
            </select>
          </div>

          {objectiveFields.map((objective, index) => (
            <div key={index} className="form-group">
              <input
                type="text"
                id={`objective-${index}`}
                value={objective}
                placeholder={`Objective ${index + 1}`}
                onChange={(e) => handleObjectiveChange(index, e.target.value)}
                className="form-control"
              />
              <button
                type="button"
                onClick={() => handleRemoveObjectiveField(index)}
                className="delete-field-btn"
              >
                Delete
              </button>
            </div>
          ))}

          <button type="button" onClick={handleAddObjectiveField} className="add-field-btn">
            Add Objective
          </button>

          <button type="button" onClick={handleSave} className="submit-btn">
            Save
          </button>
        </form>
      </div>
    </div>
  );
};

export default LearningObjectiveModal;
