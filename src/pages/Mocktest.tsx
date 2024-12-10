import React, { useEffect, useState, useRef, useCallback } from 'react';
import axios from 'axios';
import MockTestCard from '../components/Mocktestcard';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppSelector } from "../redux/hooks";
import { useDispatch } from 'react-redux';
import { selectUser } from "../redux/slices/authSlice";
import axiosInstance from '../axiosInstance';
import '../styles/mocktest.scss';


interface MocktestDetail {
  mocktestID: number;
  mocktestName: string;
  mocktestDescription: string;
}

interface Question {
  id: number;
  question: string;
  choiceA: string;
  choiceB: string;
  choiceC: string;
  choiceD: string;
  subject: string;
  difficulty: number;
}

const Mocktest: React.FC = () => {
  const user = useAppSelector(selectUser);
  const userType = user.token.type;
  const [questions, setQuestions] = useState<Question[]>([]);
  const [mocktestDetail, setMocktestDetails] = useState<MocktestDetail | null>(null);
  const [mocktest_id, setMocktestID] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(3600);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [answers, setAnswers] = useState({});
  const intervalId = useRef<NodeJS.Timeout | null>(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { courseId, classID } = useParams<{ courseId: string; classID: string }>();

  const clearTimer = useCallback(() => {
    console.log ("Clearing timer...");
    if (intervalId.current) clearInterval(intervalId.current);
    localStorage.removeItem('mocktestStartTime');
  }, []);

  useEffect(() => {
    if(courseId) {
        axiosInstance.get(`/mocktest/get_by_course/${courseId}/`)
        .then(response => {
          if(response.data) {
            const fetchedMocktest = response.data;
            setMocktestDetails(fetchedMocktest);
            setMocktestID(fetchedMocktest.mocktestID);
          } else {
            console.error('No mocktest found for this course.');
          }
        })
        .catch(error => {
          console.error('There was an error fetching the mock test details.', error);
        });
    }
  }, [courseId]);

  useEffect(() => {
    if(mocktest_id) {
        axiosInstance.get(`/questions/?mocktest_id=${mocktest_id}`)
        .then(response => {
          if(response.data.length > 0) {
            const fetchedMocktest = response.data[0];
            setQuestions(response.data);
          } else {
            console.error('No mocktest found for this course.');
          }
        })
        .catch(error => {
          console.error('There was an error fetching the mock test details.', error);
        });
    }
  }, [mocktest_id]);

  useEffect(() => {
     console.log('User authentication state changed:', user.isAuth);
     if (!user.isAuth) {
       clearTimer();
     }
  }, [user.isAuth, clearTimer]);

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const startTime = localStorage.getItem('mocktestStartTime');
      if (startTime) {
        const elapsedSeconds = Math.floor((Date.now() - parseInt(startTime)) / 1000);
        return Math.max(3600 - elapsedSeconds, 0);
      } else {
        const now = Date.now();
        localStorage.setItem('mocktestStartTime', now.toString());
        return 3600;
      }
    };

    setTimeRemaining(calculateTimeRemaining());

    intervalId.current = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining());
    }, 1000);

    return () => {
      if (intervalId.current) clearInterval(intervalId.current);
    };
  }, []);

  useEffect(() => {
    if (timeRemaining <= 0) {
      clearInterval(intervalId.current!);
      localStorage.removeItem('mocktestStartTime');
    }
  }, [timeRemaining]);

  const formatTime = () => {
    const hours = Math.floor(timeRemaining / 3600);
    const minutes = Math.floor((timeRemaining % 3600) / 60);
    const seconds = timeRemaining % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelected = (questionId: number, selectedAnswer: string) => {
      setAnswers((prevAnswers) => {
        const updatedAnswers = { ...prevAnswers, [questionId]: selectedAnswer };
        console.log("Updated Answers: ", updatedAnswers);
        return updatedAnswers;
      });
  };

  const handleSubmit = async () => {
      if (isSubmitting) return;
      setIsSubmitting(true);

      if (!mocktest_id || !mocktestDetail) {
        console.error('No mocktest ID or mocktest detail provided.');
        return;
      }

      if(!user.token.id) {
        console.error('No token found.');
        return;
      }
      console.log("Using token for request:", user.token.id);

      try {
        if(user.isAuth) {
            const response = await axiosInstance.post(`/mocktest/${mocktest_id}/submit`,
                {
                    user_name: user.token.id,
                    answers: answers
                },
            );
            console.log("Response:", response.data);
            navigate(`/classes/${classID}/mocktest/${mocktest_id}/results`, {
               state: {
                classID: classID,
                mocktest_id: mocktest_id,
                score: response.data.score,
                total: response.data.total_questions,
                mocktestName: response.data.mocktestName,
                studentName: response.data.studentName,
                feedback: response.data.feedback,
                dateOfMocktest: response.data.mocktestDateTaken,
               }
            });

            clearTimer();
        }
      } catch (error) {
        console.error('There was an error submitting the mock test.', error);
      }
  };

  return (
    <div className="mock-test">
        {mocktestDetail ? (
            <>
            <h1>{mocktestDetail?.mocktestName || 'Loading Test Name..'}</h1>
            <p className="subtitle">by BoardPrep Admin</p>
            {userType === 'S' && (
                <div className="exam-timer"> Time Remaining: {formatTime()} </div>
            )}
            <div className="surround">
            {questions && questions.length > 0 ? (
                questions.map((q, index) => (
                <MockTestCard
                    key={q.id}
                    noOfQuestions={index + 1}
                    question={q}
                    difficulty={q.difficulty}
                    choices={[q.choiceA, q.choiceB, q.choiceC, q.choiceD]}
                    subject={q.subject}
                    onAnswerSelected={handleAnswerSelected}
                    isSubmitting={isSubmitting}
                />
                ))
            ) : (
            <p>No questions available.</p>
            )}
            {userType === 'S' && (
                <button
                  className={`submit-button ${isSubmitting ? 'submitting' : ''}`}
                  onClick={handleSubmit}
                  disabled={isSubmitting}>
                  {isSubmitting ? <div className="loading-circle"></div> : "SUBMIT"}
                </button>
            )}
            </div>
            </>
        ) : (
        <p>Loading test name...</p>
        )}

    </div>
  );
};

export default Mocktest;