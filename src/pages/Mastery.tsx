import React, { useEffect, useState } from 'react';
import '../styles/dashboard.scss';
import DashboardCards from '../components/DashboardCards';
import CardChallenge from '../components/CardChallenge';
import CardLeaderboard from '../components/CardLeaderboard';
import ClassCard from '../components/ClassCard';
import CourseCard from '../components/CoursecardC';
import axiosInstance from '../axiosInstance';
import { useAppSelector } from '../redux/hooks';
import { selectUser } from '../redux/slices/authSlice';

interface Class {
  classId: number;
  className: string;
  classDescription: string;
  teacher_name: string;
  course: string;
  image: string;
  students: string[];
  classCode: string;
}

interface Course {
  course_id: string;
  course_title: string;
  short_description: string;
  image: string;
}

interface Mastery {
  id: number;
  mastery_level: string;
  questions_attempted: number;
  last_updated: string;
  student: string;
  learning_objective: number;
}

const Mastery = () => {
  const user = useAppSelector(selectUser);
  const [mastery, setMastery] = useState<Mastery[]>([]);
  const [selectedMastery, setSelectedMastery] = useState<Mastery | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const learningObjectives: {
    [key in 23 | 24 | 25 | 26 | 27 | 28 | 29 | 30 | 31 | 32 | 33 | 34]: string;
  } = {
    23: 'Understand the relationship between binary, decimal, and hexadecimal systems.',
    24: 'Learn methods to convert between decimal numbers and other numeral systems, including binary and hexadecimal.',
    25: 'Recognize the importance of radix in computer processing for data representation​.',
    26: 'Explore fixed-point and floating-point representation methods in binary systems.',
    27: "Learn how negative numbers are represented using complements (e.g., two's complement).",
    28: 'Understand the concept of mantissa and exponent in floating-point representations.',
    29: 'Master the definitions and applications of basic logical operations: AND, OR, NOT, and XOR.',
    30: 'Learn truth tables and their usage in computing logical outcomes.',
    31: "Understand De Morgan's laws and their application in simplifying logical expressions​.",
    32: 'Understand BNF as a formal language for defining programming grammar.',
    33: 'Learn to represent syntax rules unambiguously using sequence, repetition, and selection constructs.',
    34: 'Explore the distinction between terminal and non-terminal symbols in syntax definitions.',
  };

  useEffect(() => {
    fetchMastery();
  }, [user.token]);

  const fetchMastery = async () => {
    const id = user.token.id;
    try {
      const { data } = await axiosInstance.get(`/mastery/?student_id=${id}`);
      setMastery(data);
      console.log(data);
    } catch (err) {
      console.log(err);
    }
  };

  const openModal = (item: Mastery) => {
    setSelectedMastery(item);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const getMasteryDescription = (level: number) => {
    if (level >= 75) {
      return (
        <p>
          Excellent work! You're mastering the concept and should focus on
          applying it to more advanced problems. Keep pushing to solidify your
          understanding.
        </p>
      );
    } else if (level >= 50) {
      return (
        <p>
          Good job! You're halfway there. Keep practicing to improve your
          proficiency and tackle more complex problems.
        </p>
      );
    } else {
      return (
        <p>
          It looks like you need more practice. Consider revisiting the
          fundamentals and working through additional examples to build a
          stronger understanding.
        </p>
      );
    }
  };

  return (
    <div className="MasteryDash">
      <div className="mastery-container">
        <h3>Mastery Levels</h3>
        <div className="mastery-list">
          {mastery.map((item) => {
            const masteryLevel = parseFloat(item.mastery_level);
            let progressBarColor = '#f44336';
            if (masteryLevel >= 50) progressBarColor = '#ff9800';
            if (masteryLevel >= 60) progressBarColor = '#4caf50';

            return (
              <div
                key={item.id}
                className="mastery-item"
                onClick={() => openModal(item)}
              >
                <h4>
                  Learning Objective:{' '}
                  {learningObjectives[
                    item.learning_objective as
                      | 23
                      | 24
                      | 25
                      | 26
                      | 27
                      | 28
                      | 29
                      | 30
                      | 31
                      | 32
                      | 33
                      | 34
                  ] || 'Unknown Learning Objective'}
                </h4>
                <div className="progress-bar-container">
                  <div
                    className="progress-bar"
                    style={{
                      width: `${masteryLevel}%`,
                      backgroundColor: progressBarColor,
                    }}
                  />
                </div>
                <p>Mastery Level: {masteryLevel}%</p>
              </div>
            );
          })}
        </div>
      </div>

      {isModalOpen && selectedMastery && (
        <div className="modal-mastery-overlay">
          <div className="modal-mastery">
            <button className="close-btn" onClick={closeModal}>
              X
            </button>
            <h3>
              {' '}
              {learningObjectives[
                selectedMastery.learning_objective as
                  | 23
                  | 24
                  | 25
                  | 26
                  | 27
                  | 28
                  | 29
                  | 30
                  | 31
                  | 32
                  | 33
                  | 34
              ] || 'Unknown Learning Objective'}
            </h3>
            <p>
              <strong>Mastery Level:</strong> {selectedMastery.mastery_level}%
            </p>
            <p>
              <strong>Questions Attempted:</strong>{' '}
              {selectedMastery.questions_attempted}
            </p>
            <p>
              <strong>Last Updated:</strong>{' '}
              {new Date(selectedMastery.last_updated).toLocaleString()}
            </p>
            {getMasteryDescription(parseFloat(selectedMastery.mastery_level))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Mastery;
