import React, { useState, useEffect, FormEvent } from 'react';
import { Container, Grid } from '@mui/material';
import axiosInstance from '../axiosInstance';
import axios from 'axios';
import '../styles/mocktestset.scss';
import {
  TextField,
  Checkbox,
  Button,
  Typography,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  SelectChangeEvent,
} from '@mui/material';

interface LearningObjective {
  text: string;
  id: string;
}

interface QuestionObjective {
  id?: number;
  learning_objective: string;
  number_of_questions: number;
  number_ai_questions: number;
  difficulty: number;
}

interface Choice {
  id: string;
  text: string;
  is_correct: boolean;
}

interface Question {
  id: string;
  text: string;
  choices: Choice[];
  correct_option: string;
}

interface MocktestQuestionData {
  id: number;
  mocktest_set_question_id: number;
  question: number;
}

const difficulties = [
  { value: 1, label: 'Easy' },
  { value: 2, label: 'Medium' },
  { value: 3, label: 'Hard' },
];

const shuffleArray = <T,>(array: T[]): T[] => {
  return array.sort(() => Math.random() - 0.5);
};

const MocktestSet: React.FC = () => {
  const [questions, setQuestions] = useState<any[]>([]);
  const [questionsMock, setQuestionsMock] = useState<Question[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<any | null>(null);
  const [isFormVisible, setFormVisible] = useState<boolean>(false);
  const [learningObjectives, setLearningObjectives] = useState<
    LearningObjective[]
  >([]);
  const [showQuestions, setShowQuestions] = useState(false);
  const [selectedLearningObjectiveId, setSelectedLearningObjectiveId] =
    useState('');
  const [selectedLearningObjectiveText, setSelectedLearningObjectiveText] =
    useState('');
  const [questionObjective, setQuestionObjective] = useState<
    QuestionObjective[]
  >([
    {
      learning_objective: '',
      number_ai_questions: 0,
      number_of_questions: 0,
      difficulty: 0,
    },
  ]);
  const [mocktestQuestionsData, setMocktestQuestionsData] = useState<MocktestQuestionData[]>([]);
  const [totalQuestions, setTotalQuestions] = useState<number>(0);
  const [newTotalQuestions, setNewTotalQuestions] = useState<number>(0);
  const [difficulty, setDifficulty] = useState<number | ''>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchLearningObjectives = async () => {
      try {
        const response = await axiosInstance.get('/objectives/');
        if (isMounted) {
          const filteredData = response.data.filter(
            (item: { id?: number }) => item.id !== undefined && item.id <= 34
          );
          setLearningObjectives(filteredData);
          // setLearningObjectives(response.data);
        }
      } catch (error) {
        if (isMounted) {
          console.error('Error fetching learningObjectives:', error);
        }
      }
    };

    const fetchMocktestSetQuestions = async () => {
      try {
        const response = await axiosInstance.get<QuestionObjective[]>(
          '/mocktest-set-questions/'
        );
        if (isMounted) {
          const sortedData = response.data.sort((a, b) => a.id! - b.id!);
          setQuestionObjective(response.data);
          const totalQuestions = response.data.reduce(
            (sum: number, obj: QuestionObjective) =>
              sum + (obj.number_of_questions || 0),
            0
          );
          const totalAIQuestions = response.data.reduce(
            (sum: number, obj: QuestionObjective) =>
              sum + (obj.number_ai_questions || 0),
            0
          );
          setTotalQuestions(totalQuestions + totalAIQuestions);
          setNewTotalQuestions(totalQuestions + totalAIQuestions);
        }
      } catch (error) {
        if (isMounted) {
          console.error('Error fetching learningObjectives:', error);
        }
      }
    };

    const fetchMocktestQuestions = async () => {
      try {
        const response = await axiosInstance.get<MocktestQuestionData[]>(
          '/mocktest-questions/'
        );
        if (isMounted) {
          setMocktestQuestionsData(response.data);
        }
      } catch (error) {
        if (isMounted) {
          console.error('Error fetching learningObjectives:', error);
        }
      }
    };
    fetchMocktestSetQuestions();
    fetchLearningObjectives();
    fetchMocktestQuestions();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleLearningObjectiveSelect = (
    event: SelectChangeEvent<string>,
    index: number
  ) => {
    const updatedQuestions = [...questionObjective];
    updatedQuestions[index].learning_objective = event.target.value;
    setQuestionObjective(updatedQuestions);
  };

  const handleDifficultySelect = (
    event: SelectChangeEvent<number>,
    index: number,
    field: keyof QuestionObjective
  ) => {
    const updatedQuestions = [...questionObjective];
    updatedQuestions[index].difficulty = Number(event.target.value);
    setQuestionObjective(updatedQuestions);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isSubmitting) return;

    setIsSubmitting(true);

    const totalNotAiQuestions = questionObjective.reduce(
      (sum: number, obj: QuestionObjective) => sum + obj.number_of_questions,
      0
    );
    const totalAIQuestions = questionObjective.reduce(
      (sum: number, obj: QuestionObjective) => sum + obj.number_ai_questions,
      0
    );

    try {
      if (totalNotAiQuestions + totalAIQuestions !== newTotalQuestions) {
        console.log(
          'Total Questions: ',
          totalNotAiQuestions + totalAIQuestions
        );
        console.log('New Total Questions: ', newTotalQuestions);
        throw new Error('Total questions do not match');
      }

      const existingObjectives = questionObjective.filter((obj) => obj.id); // ones with IDs
      const newObjectives = questionObjective.filter((obj) => !obj.id); // ones without IDs

      // Handle updates (if any)
      if (existingObjectives.length > 0) {
        const updatePromises = existingObjectives.map((obj) =>
          axiosInstance.put(`/mocktest-set-questions/${obj.id}/`, {
            learning_objective: obj.learning_objective,
            number_of_questions: obj.number_of_questions,
            number_ai_questions: obj.number_ai_questions,
            difficulty: obj.difficulty,
          })
        );
        await Promise.all(updatePromises);
      }

      // Handle new creations (if any)
      if (newObjectives.length > 0) {
        let response = await axiosInstance.post(
          '/mocktest-set-questions/bulk/',
          newObjectives
        );
        console.log(
          'NEWWWW Question Objective created successfully:',
          response.data
        );
      }
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

  const addQuestionObjective = () => {
    setQuestionObjective([
      ...questionObjective,
      {
        learning_objective: '',
        number_ai_questions: 0,
        number_of_questions: 0,
        difficulty: 0,
      },
    ]);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    index: number,
    field: keyof QuestionObjective
  ) => {
    const updatedQuestions = [...questionObjective];

    if (field === 'number_of_questions' || field === 'number_ai_questions') {
      updatedQuestions[index][field] = parseInt(e.target.value, 10) || 0;
    } else {
      (updatedQuestions[index][field] as string) = e.target.value;
    }
    setQuestionObjective(updatedQuestions);
  };

  const handleTotalQuestions = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = parseInt(event.target.value, 10) || 0;
    setNewTotalQuestions(value);
  };

  const handleRemoveQuestionObjective = async (
    index: number,
    id: number | undefined,
    numberOfQuestions: number
  ) => {
    // console.log('Removing question objective:', id);
    // const updatedQuestions = [...questionObjective];
    // updatedQuestions.splice(index, 1);
    // setQuestionObjective(updatedQuestions);
    setNewTotalQuestions((prevTotal) => prevTotal - numberOfQuestions);
    try {
      await axiosInstance.delete(`/mocktest-set-questions/${id}`);
      console.log('Deleted question objective with ID:', id);

      // Remove the question objective from the state
      const updatedQuestions = [...questionObjective];
      updatedQuestions.splice(index, 1);
      setQuestionObjective(updatedQuestions);
      // setTotalQuestions((prevTotal) => prevTotal - numberOfQuestions);
    } catch (error) {
      console.error('Error deleting question objective:', error);
    }
  };

  const closeShowExamAttempts = () => {
    setShowQuestions(false);
  };

  const viewQuestions = async () => {
    try {
      setIsLoading(true);
      console.log('View Questions');
      setShowQuestions(true);
      const mocktestResponse = await axiosInstance.get(
        `/mocktest-questions/get_mocktest_questions/`
      );
      let mocktestData = mocktestResponse.data;

      console.log('Mocktest data fetched:', mocktestData);

      setQuestionsMock(mocktestData);
    } catch (error) {
      console.error('Error fetching mocktest data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const removeQuestion = async (id: string, index: number) => {
    console.log('Removing question:', id);
    const questionToDelete = mocktestQuestionsData.find(
      (question) => question.question === parseInt(id)
    );

    if (!questionToDelete) {
      console.error('Question not found in mocktestQuestionsData');
      return;
    }

    try {
      await axiosInstance.delete(`/mocktest-questions/${questionToDelete.id}`);
      console.log('Deleted question objective with ID:', questionToDelete.id);

      const updatedQuestionsMock = [...questionsMock];
      updatedQuestionsMock.splice(index, 1);
      setQuestionsMock(updatedQuestionsMock);
    } catch (error) {
      console.error('Error deleting question objective:', error);
    }
  }

  return (
    <Container className="question-bank-container">
      <h1>Mocktest Set Questions</h1>
      <div className="mocktest-form-container">
        <form onSubmit={handleSubmit}>
          {/* <Typography variant="h6">Total Question: {totalQuestions}</Typography> */}
          <TextField
            label={`Total Questions`}
            margin="none"
            value={newTotalQuestions}
            onChange={(e) => handleTotalQuestions(e)}
            size="small"
            sx={{ width: '110px' }}
          />
          <div className="form-one-container">
            {questionObjective.map((questionObjective, index) => (
              <div className="form-two-container">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    handleRemoveQuestionObjective(
                      index,
                      questionObjective.id,
                      questionObjective.number_ai_questions +
                        questionObjective.number_of_questions
                    );
                  }}
                  className="mocktest-set-close"
                >
                  X
                </button>
                <div className="form-row">
                  <FormControl
                    className="form-control"
                    margin="normal"
                    fullWidth
                  >
                    <InputLabel id="lesson-select-label">
                      Select Learning Objective
                    </InputLabel>
                    <Select
                      labelId="lesson-select-label"
                      value={questionObjective.learning_objective}
                      onChange={(e) => handleLearningObjectiveSelect(e, index)}
                      label="Select Learning Objective"
                    >
                      <MenuItem value="">
                        <em>None</em>
                      </MenuItem>
                      {learningObjectives.map((learningObjective) => (
                        <MenuItem
                          key={learningObjective.id}
                          value={learningObjective.id}
                        >
                          {learningObjective.text}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </div>
                <div className="form-row">
                  <TextField
                    label={`Number of questions`}
                    margin="normal"
                    value={questionObjective.number_of_questions}
                    onChange={(e) =>
                      handleInputChange(e, index, 'number_of_questions')
                    }
                    fullWidth
                  />

                  <FormControl
                    className="form-control"
                    margin="normal"
                    fullWidth
                  >
                    <InputLabel id="difficulty-select-label">
                      Select Difficulty
                    </InputLabel>
                    <Select
                      labelId="difficulty-select-label"
                      value={questionObjective.difficulty}
                      onChange={(e) =>
                        handleDifficultySelect(e, index, 'difficulty')
                      }
                      label="Select Difficulty"
                    >
                      {difficulties.map((diff) => (
                        <MenuItem key={diff.value} value={diff.value}>
                          {diff.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <TextField
                    label={`Number of AI questions`}
                    margin="normal"
                    value={questionObjective.number_ai_questions}
                    onChange={(e) =>
                      handleInputChange(e, index, 'number_ai_questions')
                    }
                    fullWidth
                  />
                </div>
              </div>
            ))}
          </div>
          <Button
            className="plus-question-btn"
            onClick={addQuestionObjective}
            variant="outlined"
          >
            +
          </Button>
          <Button
            className="save-question-btn"
            type="submit"
            variant="contained"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Save'}
          </Button>
          <Button
            className="save-question-btn"
            onClick={viewQuestions}
            variant="outlined"
          >
            View Questions
          </Button>
        </form>
        {showQuestions && (
          <div className="modal-mastery-overlay-exam">
            <div className="modal-mastery-exam">
              {isLoading ? (
                <div className="loading-state-mocktestset">Loading...</div>
              ) : (
                <>
                  <button
                    className="mocktest-set-close"
                    onClick={closeShowExamAttempts}
                  >
                    X
                  </button>
                  <div className="questions-review-mocktest">
                    {questionsMock.map((question, index) => {
                      return (
                        <div
                          key={question.id}
                          className="question-body-exam-mocktest"
                        >
                          <h3>
                            {' '}
                            <span
                              style={{ cursor: 'pointer', color: 'red', marginRight: '10px' }}
                              onClick={() => removeQuestion(question.id, index)}
                            >
                              -
                            </span>
                            Question {index + 1}
                          </h3>
                          <p className="question-exam-p">{question.text}</p>
                          {/* <ul> */}
                          {question.choices.map((choice, choiceIndex) => {
                            const choiceLetter = String.fromCharCode(
                              97 + choiceIndex
                            );
                            return (
                              <div
                                key={choice.id}
                                className="question-exam-li"
                                style={{
                                  color: choice.is_correct
                                    ? 'green'
                                    : 'inherit',
                                }}
                              >
                                {choiceLetter}. {choice.text}
                              </div>
                            );
                          })}
                          {/* </ul> */}
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </Container>
  );
};

export default MocktestSet;
