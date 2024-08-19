import React, { useEffect, useState } from "react";
import axiosInstance from "../axiosInstance";
import ExamResult from "./ExamResult";
import "../styles/exam-content.scss"; 
import axios, { AxiosError } from 'axios';


interface Choice {
  id: string;
  text: string;
}

interface Question {
  id: string;
  text: string;
  choices: Choice[];
  correct_option: string;
}

interface Exam {
  id: string;
  title: string;
  questions: Question[];
  courseId: string;
}

interface StudentExamAttempt {
  id: string;
  exam: string;
  score: number | null;
  total_questions: number;
  start_time: string;
  end_time: string | null;
  passed: boolean;
  attempt_number: number;
}

interface ExamContentProps {
  studentId: string;
  classInstanceId: number;
  courseId: string;
  title: string;
  onTryAgain: () => void;
  onNextLesson: () => void;
}

const ExamContent: React.FC<ExamContentProps> = ({
  studentId,
  classInstanceId,
  courseId,
  title,
  onTryAgain,
  onNextLesson,
}) => {
  const [exam, setExam] = useState<Exam | null>(null);
  const [attempt, setAttempt] = useState<StudentExamAttempt | null>(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<{ [questionId: string]: string }>({});
  const [flags, setFlags] = useState<{ [questionId: string]: boolean }>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<{ [questionId: string]: boolean }>({});
  const [feedback, setFeedback] = useState<string | null>(null);

  const questionsPerPage = 5;

  const fetchAttemptNumber = async (examId: string) => {
    try {
      const response = await axiosInstance.get(
        `/exams/${examId}/current-attempt-number/`,
        {
          params: { student_id: studentId }
        }
      );
      console.log("Full response data:", response.data); 
      const attemptNumber = response.data.last_attempt?.attempt_number || response.data.next_attempt_number;
      console.log("Fetched attempt number:", attemptNumber);
      return attemptNumber;
    } catch (error) {
      console.error("Error fetching attempt number:", error);
      return 1; 
    }
  };

  const fetchExamQuestions = async (examId: string, attemptNumber: number) => {
    try {
      const response = await axiosInstance.get(`/exams/${examId}/get_exam_questions/`, {
        params: { student_id: studentId, attempt_number: attemptNumber }
      });
  
      console.log("Exam questions response data:", response.data);
  
      const { exam_title, questions } = response.data;
  
      const formattedQuestions: Question[] = questions.map((q: any) => ({
        id: q.id,
        text: q.text,
        choices: q.choices.map((c: any) => ({
          id: c.id,
          text: c.text
        })),
        correct_option: q.correct_option
      }));
  
      console.log("Formatted questions:", formattedQuestions); 
  
      setExam({
        id: examId,
        title: exam_title,
        questions: formattedQuestions,
        courseId: courseId
      });
  
      console.log("Exam state set:", { id: examId, title: exam_title, questions: formattedQuestions, courseId });
    } catch (error: any) {
      console.error("Error fetching exam questions:", error);
      alert("An error occurred while fetching the exam questions. Please try again later.");
    }
  };  

  const checkExistingExam = async () => {
    try {
      const response = await axiosInstance.get(
        `/exams/`,
        {
          params: {
            student_id: studentId,
            class_instance_id: classInstanceId,
            course_id: courseId
          }
        }
      );

      console.log("Response data from exams endpoint:", response.data); 

      
      const existingExam = response.data.find((exam: any) => exam.student === studentId);

      console.log("Existing exam found:", existingExam); 

      if (existingExam) {
      const attemptNumber = await fetchAttemptNumber(existingExam.id);
      console.log("Fetched attempt number:", attemptNumber); 

        setAttempt({
          id: existingExam.id,
          exam: existingExam.id,
          score: null,
          total_questions: 0,
          start_time: "",
          end_time: null,
          passed: false,
          attempt_number: attemptNumber
        });
        await fetchExamQuestions(existingExam.id, attemptNumber);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error checking existing exam:", error);
      return false;
    }
  };

  const createExamAndAttempt = async () => {
    const hasExam = await checkExistingExam();
    if (hasExam) {
      setLoading(false);
      return;
    }
  
    try {
      const createExamResponse = await axiosInstance.post(
        "/exams/generate_adaptive_exam/",
        {
          student: studentId,
          class_instance: classInstanceId,
          course: courseId,
          title: title,
        }
      );
      const examData = createExamResponse.data;
  
      const attemptNumber = await fetchAttemptNumber(examData.id);
  
      const createAttemptResponse = await axiosInstance.post(
        "/studentExamAttempt/",
        {
          exam: examData.id,
          total_questions: examData.questions.length,
          attempt_number: attemptNumber,
        }
      );
      const attemptData = createAttemptResponse.data;
  
      setAttempt(attemptData);
      await fetchExamQuestions(examData.id, attemptNumber);
    } catch (error: any) {
      console.error("Error creating exam or attempt:", error);
    } finally {
      setLoading(false);
    }
  };  

  const handleRetakeExam = async () => {
    try {
      const response = await axiosInstance.post(
        "/studentExamAttempt/retake_exam/",
        {
          student_id: studentId,
          exam_id: exam?.id,
        }
      );

      if (response.status === 200) {
        const { attempt_number } = response.data;
        setAttempt((prevAttempt) =>
          prevAttempt
            ? { ...prevAttempt, attempt_number }
            : null
        );
        await fetchExamQuestions(exam!.id, attempt_number); 
        setShowResults(false);
        onTryAgain(); 
      } else {
        console.log("Failed to retake the exam. Please try again later.");
      }
    } catch (error: any) {
      console.error("Error retaking exam:", error);
      console.log("An error occurred while retaking the exam. Please try again later.");
    }
  };

  useEffect(() => {
    createExamAndAttempt();
  }, [studentId, classInstanceId, courseId, title]);

  const handleAnswerChange = (questionId: string, choiceId: string) => {
    setAnswers({
      ...answers,
      [questionId]: choiceId,
    });
  };

  const handleFlagToggle = (questionId: string) => {
    setFlags((prevFlags) => ({
      ...prevFlags,
      [questionId]: !prevFlags[questionId],
    }));
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSubmit = async () => {
    if (!exam || !attempt) {
      console.error("Exam or attempt data is missing.");
      return;
    }
  
    const answersPayload = Object.entries(answers).map(([questionId, choiceId]) => ({
      question_id: parseInt(questionId, 10), 
      selected_choice_id: choiceId,
    }));
  
    const payload = {
      student_id: studentId,
      answers: answersPayload,
      attempt_number: attempt.attempt_number,
    };
  
    try {
      const submitExamResponse = await axiosInstance.post(
        `/exams/${exam.id}/submit/`,
        payload
      );
  
      if (submitExamResponse.status === 200 || submitExamResponse.status === 201) {
        const { score, feedback, total_questions, start_time, end_time, passed, attempt_number } = submitExamResponse.data;
  
        await fetchDetailedResults(exam.id, attempt_number);
  
        setAttempt((prevAttempt) =>
          prevAttempt
            ? { ...prevAttempt, score, total_questions, start_time, end_time, passed }
            : null
        );
        setFeedback(feedback);
        setShowResults(true);
      } else {
        alert("Failed to submit exam. Please try again later.");
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error("Error submitting exam:", error.message);
        console.error("Error response data:", error.response?.data);
        alert("An error occurred while submitting the exam. Please try again later.");
      } else {
        console.error("Unexpected error:", error);
        alert("An unexpected error occurred. Please try again later.");
      }
    }
  };
  

  const fetchDetailedResults = async (examId: string, attemptNumber: number) => {
    if (!attemptNumber) {
      console.error("Attempt number is missing.");
      alert("Exam Finished!");
      return;
    }
  
    try {
      const response = await axiosInstance.get(
        `/exams/${examId}/detailed_results/`,
        {
          params: { student_id: studentId, attempt_number: attemptNumber }
        }
      );
  
      console.log("Detailed results response data:", response.data); 
  
      const resultsData = response.data.results || [];
      const resultsMap = resultsData.reduce(
        (acc: { [key: string]: boolean }, item: any) => {
          if (item.id && typeof item.is_correct === 'boolean') {
            acc[item.id] = item.is_correct; 
          }
          return acc;
        },
        {}
      );
  
      setResults(resultsMap);
  
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        console.error("Error fetching detailed results:", error.message);
        console.error("Error response data:", error.response?.data);
        console.error("Error response headers:", error.response?.headers);
      } else {
        console.error("Unexpected error:", error);
      }
      alert("An error occurred while fetching detailed results. Please try again later.");
    }
  };
  

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!exam || !attempt) {
    return <div className="loading">Loadinggg...</div>;
  }

  const totalPages = Math.ceil(exam.questions.length / questionsPerPage);
  const displayedQuestions = exam.questions.slice(
    (currentPage - 1) * questionsPerPage,
    currentPage * questionsPerPage
  );

  return (
    <div className="exam-content">
      {showResults ? (
        <ExamResult
          examId={exam.id} 
          questions={exam.questions}
          answers={answers}
          results={results}
          score={attempt.score ?? 0}
          feedback={feedback}
          totalQuestions={exam.questions.length}
          passed={attempt.passed ?? false}
          onTryAgain={() => {
            setShowResults(false);
            onTryAgain();
            handleRetakeExam();
          }}
          onNextLesson={() => {
            setShowResults(false);
            onNextLesson();
          }}
        />
      ) : (
        <>
          <h2>{exam.title}</h2>
          <div className="exam-body">
            <div className="questions-section">
              {displayedQuestions.map((question, index) => (
                <div
                  key={question.id}
                  className={`question-block ${
                    flags[question.id] ? "flagged" : ""
                  }`}
                >
                  <p>
                    {(currentPage - 1) * questionsPerPage + index + 1}.{" "}
                    {question.text}
                  </p>
                  <button
                    className="flag-button"
                    onClick={() => handleFlagToggle(question.id)}
                  >
                    🚩
                  </button>
                  <ul>
                    {question.choices.map((choice) => (
                      <li key={choice.id}>
                        <label>
                          <input
                            type="radio"
                            name={`question-${question.id}`} 
                            value={choice.id}
                            checked={answers[question.id] === choice.id}
                            onChange={() =>
                              handleAnswerChange(question.id, choice.id)
                            }
                          />
                          {choice.text}
                        </label>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="question-nav">
              {exam.questions.map((_, index) => (
                <div
                  key={index}
                  className={`question-number ${
                    answers[exam.questions[index].id] ? "answered" : ""
                  } ${flags[exam.questions[index].id] ? "flagged-box" : ""}`}
                  onClick={() =>
                    handlePageChange(Math.floor(index / questionsPerPage) + 1)
                  }
                >
                  {index + 1}
                </div>
              ))}
              <button className="submit-button" onClick={handleSubmit}>
                Submit
              </button>
            </div>
          </div>
          <div className="pagination">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              &lt;
            </button>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              &gt;
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ExamContent;