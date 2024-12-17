import React, { useState, useEffect } from 'react';
import { Container, Grid } from '@mui/material';
import axiosInstance from '../axiosInstance';
import QuestionList from '../components/QuestionList';
import QuestionForm from '../components/QuestionForm';
import '../styles/question-bank.scss';

const QuestionBank: React.FC = () => {
  const [questions, setQuestions] = useState<any[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<any | null>(null);
  const [isFormVisible, setFormVisible] = useState<boolean>(false);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await axiosInstance.get('/questions/');
        setQuestions(response.data);
      } catch (error) {
        console.error('Error fetching questions:', error);
      }
    };

    fetchQuestions();
  }, []);

  const handleAddQuestion = () => {
    setSelectedQuestion(null);
    setFormVisible(true);
  };

  const handleSaveQuestion = async (question: any) => {
    try {
      const response = await axiosInstance.get('/questions/');
      setQuestions(response.data);
    } catch (error) {
      console.error('Error saving question:', error);
    }

    setSelectedQuestion(null);
    setFormVisible(false);
  };

  const handleCancel = () => {
    setSelectedQuestion(null);
    setFormVisible(false);
  };

  const handleSelectQuestion = (question: any) => {
    setSelectedQuestion(question);
    setFormVisible(true);
  };

  return (
    <Container className='question-bank-container'>
      <h1>QUESTION BANK</h1>
      <Grid container spacing={2}>
        <Grid item xs={4}>
          <QuestionList
            questions={questions}
            onAddQuestion={handleAddQuestion}
            onSelectQuestion={handleSelectQuestion}
            selectedQuestion={selectedQuestion}
          />
        </Grid>
        <Grid item xs={8}>
          {isFormVisible && (
            <QuestionForm
              onSave={handleSaveQuestion}
              onCancel={handleCancel}
              existingQuestion={selectedQuestion}
              questions={questions}
            />
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

export default QuestionBank;
