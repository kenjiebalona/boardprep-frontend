import React, { useState } from 'react';
import axiosInstance from '../axiosInstance';

interface CreateBlockModalProps {
  closeModal: () => void;
  lessonId: string;
  onBlockCreated: () => void;
}

const CreateBlockModal: React.FC<CreateBlockModalProps> = ({ closeModal, lessonId, onBlockCreated }) => {
  const [blockType, setBlockType] = useState<string>('objective');
  const [difficulty, setDifficulty] = useState<string>('beginner');

  const handleBlockTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setBlockType(event.target.value);
  };

  const handleDifficultyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDifficulty(event.target.value);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await axiosInstance.post('/content-blocks/', {
        block_type: blockType,
        difficulty: difficulty,
        lesson: lessonId, 
      });
      onBlockCreated(); 
      closeModal(); 
    } catch (error) {
      console.error("Error creating content block:", error);
    }
  };

  return (
    <div className="modal">
      <h2>Create a New Content Block</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <h4>Block Type</h4>
          {['objective', 'lesson', 'example'].map((type) => (
            <div key={type}>
              <input
                type="radio"
                id={type}
                name="blockType"
                value={type}
                checked={blockType === type}
                onChange={handleBlockTypeChange}
              />
              <label htmlFor={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</label>
            </div>
          ))}
        </div>
        <div>
          <h4>Difficulty</h4>
          {['beginner', 'intermediate', 'advanced'].map((level) => (
            <div key={level}>
              <input
                type="radio"
                id={level}
                name="difficulty"
                value={level}
                checked={difficulty === level}
                onChange={handleDifficultyChange}
              />
              <label htmlFor={level}>{level.charAt(0).toUpperCase() + level.slice(1)}</label>
            </div>
          ))}
        </div>
        <button type="submit">Confirm</button>
        <button type="button" onClick={closeModal}>Cancel</button>
      </form>
    </div>
  );
};

export default CreateBlockModal;
