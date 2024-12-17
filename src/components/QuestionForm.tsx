import React, { useState, useEffect, FormEvent } from 'react';
import { TextField, Checkbox, Button, Typography, MenuItem, Select, FormControl, InputLabel, SelectChangeEvent } from '@mui/material';
import axiosInstance from '../axiosInstance';
import axios from 'axios';
import "../styles/question-form.scss";
import Loader from './Loader';
import { set } from 'lodash';

interface Choice {
  text: string;
  isCorrect: boolean;
}

interface LearningObjective {
  text: string;
  id: string;
}

interface QuestionFormProps {
  onSave: (question: any) => void;
  onCancel: () => void;
  existingQuestion?: any;
  questions: any[];
}

const difficulties = [
  { value: 1, label: 'Easy' },
  { value: 2, label: 'Medium' },
  { value: 3, label: 'Hard' },
];

const QuestionForm: React.FC<QuestionFormProps> = ({ onSave, onCancel, existingQuestion, questions }) => {
  const [questionText, setQuestionText] = useState('');
  const [choices, setChoices] = useState<Choice[]>([{ text: '', isCorrect: false }]);
  const [learningObjectives, setLearningObjectives] = useState<LearningObjective[]>([]);
  const [selectedLearningObjectiveId, setSelectedLearningObjectiveId] = useState('');
  const [selectedLearningObjectiveText, setSelectedLearningObjectiveText] = useState('');
  const [difficulty, setDifficulty] = useState<number | ''>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<any[]>([]);
  const [showQuestions, setShowQuestions] = useState(false);
  const [countAiQuestions, setCountAiQuestions] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const aiQuestionCount = questions.filter(question => question.isai).length;
    console.log("AI QUESTION COUNT: ", aiQuestionCount);
    setCountAiQuestions(aiQuestionCount);
    if (existingQuestion) {
      setQuestionText(existingQuestion.text || '');
      setChoices(
        existingQuestion.choices.map((choice: any) => ({
          text: choice.text,
          isCorrect: choice.is_correct,
        })) || [{ text: '', isCorrect: false }]
      );
      setSelectedLearningObjectiveId(existingQuestion.learningObjective || '');
      setDifficulty(existingQuestion.difficulty || '');
    } else {
      setQuestionText('');
      setChoices([{ text: '', isCorrect: false }]);
      setSelectedLearningObjectiveId('');
      setDifficulty('');
    }
  }, [existingQuestion, questions]);

  useEffect(() => {
    let isMounted = true;
    const fetchLearningObjectives = async () => {
      try {
        const response = await axiosInstance.get('/objectives/');
        if (isMounted) {
          setLearningObjectives(response.data);
        }
      } catch (error) {
        if (isMounted) {
          console.error('Error fetching learningObjectives:', error);
        }
      }
    };

    fetchLearningObjectives();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleChoiceChange = (index: number, field: string, value: any) => {
    const updatedChoices = [...choices];
    updatedChoices[index] = { ...updatedChoices[index], [field]: value };
    setChoices(updatedChoices);
  };

  const handleLearningObjectiveSelect = (event: SelectChangeEvent<string>) => {
    setSelectedLearningObjectiveId(event.target.value as string);

    const selectedObjective = learningObjectives.find((obj) => obj.id === event.target.value);
    setSelectedLearningObjectiveText(selectedObjective ? selectedObjective.text : '');
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

  const handleAddGeneratedQuestion = async (question: any, idx: number) => {
    try {
      const response = await axiosInstance.post('/questions/', question);
      console.log("Question created successfully:", response.data);
      setGeneratedQuestions((prevQuestions) =>
        prevQuestions.filter((_, index) => index !== idx)
      );
    } catch (error) {
      console.error("Error creating question:", error);
    }
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isSubmitting) return;

    setIsSubmitting(true);

    const filteredChoices = choices.filter(choice => choice.text.trim() !== '');

    const questionData = {
      learning_objective: selectedLearningObjectiveId || null,
      text: questionText,
      difficulty: difficulty || null,
      choices: filteredChoices.map(choice => ({
        text: choice.text,
        is_correct: choice.isCorrect,
      })),
      isai: false
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
      setSelectedLearningObjectiveId('');
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

  const handleToggleShowQuestions = async () => {
    setIsLoading(true);
    try {
      console.log("ARA DIAY KA AMAW: ", selectedLearningObjectiveText, difficulty, selectedLearningObjectiveId);
      const response = await axiosInstance.post(`/questions/generate_question/`, {
        topic: selectedLearningObjectiveText,
        learning_objective: selectedLearningObjectiveId,
        difficulty: difficulty,
      });
      console.log("Generated Questions: ", response.data);

      let fixedResponse = response.data;
      const json = JSON.parse(fixedResponse.question);
      console.log("JSON: ", json);

      function shuffleChoices(array: any[]): any[] {
        return array.sort(() => Math.random() - 0.5);
      }

      for(let js of json) {
        const choicesCopy = [...js.choices];
        shuffleChoices(choicesCopy);
        js.choices = choicesCopy;
      }

      setGeneratedQuestions(json);
      setIsLoading(false);
    } catch (error) {
      console.error('Error generating questions:', error);
    }
    setShowQuestions(!showQuestions);
  };

  const closeShowQuestions = () => {
    setShowQuestions(false);
  }

  return (
    <div className="question-form-container">

      {isLoading &&
      <div className='loader-container-question'>
        <Loader />
      </div>
      }
      {!isLoading && (
        <>
        <div className='question-form-header'>
        <Typography variant="h6">{existingQuestion ? 'Edit Question' : 'Create Question'}</Typography>
        <Button variant="outlined" onClick={handleToggleShowQuestions}>Helper Preppy</Button>

      </div>
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <FormControl className="form-control" margin="normal">
            <InputLabel id="lesson-select-label">Select Learning Objective</InputLabel>
            <Select
              labelId="lesson-select-label"
              value={selectedLearningObjectiveId}
              onChange={handleLearningObjectiveSelect}
              label="Select Learning Objective"
            >
              <MenuItem value=""><em>None</em></MenuItem>
              {learningObjectives.map((learningObjective) => (
                <MenuItem key={learningObjective.id} value={learningObjective.id}>
                  {learningObjective.text}
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
      {showQuestions && (
        <div className="modal-mastery-overlay-question">
          <div className="modal-mastery-question">
          <button className="close-btn" onClick={closeShowQuestions}>
              X
            </button>
          <Typography variant="h6" className='modal-typo'>Generated Questions</Typography>
            <ul className='generated-question-ul'>
              <li className='generated-question-li'>
                <span className="generated-question-attempt-header ">Add Question</span>
                <span className="generated-question-attempt-header">Question</span>
                <span className="generated-question-attempt-header"></span>
              </li>
              {generatedQuestions.map((question, idx) => (
                <li className='generated-question-li' key={idx}>
                  <Button
                    onClick={() => handleAddGeneratedQuestion(question, idx)}
                    sx={{
                      backgroundColor: 'green',
                      color: 'white',
                      '&:hover': {
                        backgroundColor: 'darkgreen',
                      },
                    }}
                  ><span>Add</span></Button>
                  <span>{question.text}</span>
                  <div className='generated-question-choices'>
                    <span style={{ color: question.choices[0].is_correct ? 'green' : 'white' }}>
                        a. {question.choices[0].text}
                    </span>
                    <span style={{ color: question.choices[1].is_correct ? 'green' : 'white' }}>
                        b. {question.choices[1].text}
                    </span>
                    <span style={{ color: question.choices[2].is_correct ? 'green' : 'white' }}>
                        c. {question.choices[2].text}
                    </span>
                    <span style={{ color: question.choices[3].is_correct ? 'green' : 'white' }}>
                        d. {question.choices[3].text}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
        </>
      )}
    </div>
  );
};

export default QuestionForm;
