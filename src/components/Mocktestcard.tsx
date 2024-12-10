import React from 'react';
import "../styles/mocktestCard.scss";
import { useAppSelector } from "../redux/hooks";
import { selectUser } from "../redux/slices/authSlice";

export interface Question {
  id: number;
  question: string;
  choiceA: string;
  choiceB: string;
  choiceC: string;
  choiceD: string;
  subject: string;
  difficulty: number;
  correctAnswer?: string;
}

interface MockTestCardProps {
  noOfQuestions: number;
  question: Question;
  subject: string;
  difficulty: number;
  choices: string[];
  onAnswerSelected: (questionId: number, selectedAnswer: string) => void;
  isSubmitting: boolean;
}

const MockTestCard: React.FC<MockTestCardProps> = ({ noOfQuestions, question, subject, difficulty, choices, onAnswerSelected, isSubmitting }) => {
  const user = useAppSelector(selectUser);
  const userType = user.token.type;

  return (
      <div className="overflow">
          <div className="mock-test-card">
            <div className="questionAndSubjectAndDifficulty">
                <div className="question">
                    <span className="questionNumbers">{noOfQuestions}.</span> {question.question}
                </div>
                <div className="subjectAndDifficulty">
                    <div className={difficulty === 1 ? 'difficultyBoxEasy' : difficulty === 2 ? 'difficultyBoxMedium' : 'difficultyBoxHard'}>
                        <div className="difficulty">
                            <p className={difficulty === 1 ? 'difficultyWordEasy' : difficulty === 2 ? 'difficultyWordMedium' : 'difficultyWordHard'}>{difficulty}</p>
                        </div>
                    </div>
                    <div className="subjectBox">
                        <div className="subject">
                            <p className="subjectWord">{subject}</p>
                        </div>
                    </div>
                </div>
            </div>
            {userType === 'S' && (
                <div className="options">
                  {choices.map((option, index) => (
                    <div className="custom-radio" key={index}>
                      <input
                        type="radio"
                        id={`choice-${option}-${question.id}`}
                        name={`question-${question.id}`}
                        value={option}
                        onChange={(e) => onAnswerSelected(question.id, e.target.value)}
                        className="radio-input"
                        disabled={isSubmitting}
                      />
                      <label htmlFor={`choice-${option}-${question.id}`}>{option}</label>
                    </div>
                  ))}
                </div>
            )}
            {(userType === 'T' || userType === 'C') && (
                <div className="options">
                  {choices.map((option, index) => (
                    <div className="custom-radio" key={index}>
                      <input
                        type="radio"
                        id={`choice-${option}-${question.id}`}
                        name={`question-${question.id}`}
                        value={option}
                        checked={option === question.correctAnswer}
                        className="radio-input"
                        disabled={isSubmitting}
                      />
                      <label htmlFor={`choice-${option}-${question.id}`}>{option}</label>
                    </div>
                  ))}
                </div>
            )}
          </div>
      </div>
  );
};

export default MockTestCard;
