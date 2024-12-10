import React, { useState, useEffect, FormEvent } from 'react';
import { TextField, Checkbox, Button, Typography, MenuItem, Select, FormControl, InputLabel, SelectChangeEvent } from '@mui/material';
import axiosInstance from '../axiosInstance';
import axios from 'axios';
import "../styles/question-form.scss";

interface Choice {
  text: string;
  isCorrect: boolean;
}

interface Lesson {
  lesson_id: string;
  lesson_title: string;
}

interface QuestionFormProps {
  onSave: (question: any) => void;
  onCancel: () => void;
  existingQuestion?: any;
}

const difficulties = [
  { value: 1, label: 'Easy' },
  { value: 2, label: 'Medium' },
  { value: 3, label: 'Hard' },
];

const QuestionForm: React.FC<QuestionFormProps> = ({ onSave, onCancel, existingQuestion }) => {
  const [questionText, setQuestionText] = useState('');
  const [choices, setChoices] = useState<Choice[]>([{ text: '', isCorrect: false }]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedLessonId, setSelectedLessonId] = useState('');
  const [difficulty, setDifficulty] = useState<number | ''>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (existingQuestion) {
      setQuestionText(existingQuestion.text || '');
      setChoices(
        existingQuestion.choices.map((choice: any) => ({
          text: choice.text,
          isCorrect: choice.is_correct,
        })) || [{ text: '', isCorrect: false }]
      );
      setSelectedLessonId(existingQuestion.lesson || '');
      setDifficulty(existingQuestion.difficulty || '');
    } else {
      setQuestionText('');
      setChoices([{ text: '', isCorrect: false }]);
      setSelectedLessonId('');
      setDifficulty('');
    }
  }, [existingQuestion]);

  useEffect(() => {
    let isMounted = true;
    const fetchLessons = async () => {
      try {
        const response = await axiosInstance.get('/lessons/');
        if (isMounted) {
          setLessons(response.data);
        }
      } catch (error) {
        if (isMounted) {
          console.error('Error fetching lessons:', error);
        }
      }
    };

    fetchLessons();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleChoiceChange = (index: number, field: string, value: any) => {
    const updatedChoices = [...choices];
    updatedChoices[index] = { ...updatedChoices[index], [field]: value };
    setChoices(updatedChoices);
  };

  const handleLessonSelect = (event: SelectChangeEvent<string>) => {
    setSelectedLessonId(event.target.value as string);
  };

  const handleDifficultySelect = (event: SelectChangeEvent<number>) => {
    setDifficulty(event.target.value as number);
  };

  const addChoice = () => {
    setChoices([...choices, { text: '', isCorrect: false }]);
  };

  const removeChoice = (index: number) => {
    if (choices.length > 1) {
      setChoices(choices.filter((_, idx) => idx !== index));
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isSubmitting) return;

    setIsSubmitting(true);

    const filteredChoices = choices.filter(choice => choice.text.trim() !== '');

    const questionData = {
      lesson: selectedLessonId || null,
      text: questionText,
      difficulty: difficulty || null,
      choices: filteredChoices.map(choice => ({
        text: choice.text,
        is_correct: choice.isCorrect,
      })),
    };

    try {
      if (existingQuestion) {
        const response = await axiosInstance.put(`/questions/${existingQuestion.id}/`, questionData);
        console.log("Question updated successfully:", response.data);
        onSave(response.data);
      } else {
        const response = await axiosInstance.post('/questions/', questionData);
        console.log("Question created successfully:", response.data);
        onSave(response.data);
      }

      setQuestionText('');
      setChoices([{ text: '', isCorrect: false }]);
      setSelectedLessonId('');
      setDifficulty('');
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          console.error('Error saving question:', error.response.data);
        } else {
          console.error('Error saving question:', error.message);
        }
      } else {
        console.error('Error saving question:', error);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="question-form-container">
      <Typography variant="h6">{existingQuestion ? 'Edit Question' : 'Create Question'}</Typography>
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <FormControl className="form-control" margin="normal">
            <InputLabel id="lesson-select-label">Select Lesson</InputLabel>
            <Select
              labelId="lesson-select-label"
              value={selectedLessonId}
              onChange={handleLessonSelect}
              label="Select Lesson"
            >
              <MenuItem value=""><em>None</em></MenuItem>
              {lessons.map((lesson) => (
                <MenuItem key={lesson.lesson_id} value={lesson.lesson_id}>
                  {lesson.lesson_title}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl className="form-control" margin="normal">
            <InputLabel id="difficulty-select-label">Select Difficulty</InputLabel>
            <Select
              labelId="difficulty-select-label"
              value={difficulty}
              onChange={handleDifficultySelect}
              label="Select Difficulty"
            >
              {difficulties.map((diff) => (
                <MenuItem key={diff.value} value={diff.value}>
                  {diff.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>

        <TextField
          label="Question"
          fullWidth
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
          margin="normal"
          multiline 
          rows={3} 
        />

        <div className="choice-container">
          {choices.map((choice, index) => (
            <div key={index} className="choice-input">
              <Checkbox
                checked={choice.isCorrect}
                onChange={(e) => handleChoiceChange(index, 'isCorrect', e.target.checked)}
              />
              <TextField
                label={`Choice ${index + 1}`}
                value={choice.text}
                onChange={(e) => handleChoiceChange(index, 'text', e.target.value)}
                margin="normal"
                fullWidth
              />
              <Button className="minus-question-btn" onClick={() => removeChoice(index)} variant="outlined">-</Button>
            </div>
          ))}
        </div>
        <Button className="plus-question-btn" onClick={addChoice} variant="outlined">+</Button>
          <Button className="save-question-btn" type="submit" variant="contained" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Question'}
          </Button>
          <Button className="save-question-btn" variant="contained" onClick={onCancel}>
            Cancel
          </Button>
      </form>
    </div>
  );
};

export default QuestionForm;
