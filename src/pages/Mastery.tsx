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
    [key in 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14]: string;
  } = {
    5: 'Extend the Concept of a Free Body Diagram (FBD).',
    6: 'Identify and Break Down Different Types of Forces Acting on an Object.',
    7: 'Draw Free Body Diagrams for Objects in Equilibrium and Motion on an Incline.',
    8: 'Label Forces Correctly Using Vector Components in 2D FBDs.',
    9: 'Apply Rules for Determining Force Directions on Objects in Complex Scenarios.',
    10: 'Understand what a vector is and how it differs from a scalar quantity.',
    11: 'Break a force vector into horizontal and vertical components.',
    12: 'Use basic trigonometric functions (sine and cosine) to find the vector components of forces.',
    13: 'Visualize and draw simple vector diagrams showing the components of a force.',
    14: 'Solve basic equilibrium problems using vector components (e.g., forces acting on a box being pushed or pulled).',
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
          fundamentals and working through additional examples to build a stronger
          understanding.
        </p>
      );
    }
  };

  return (
    <div className="MainDash">
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
                <h4>Learning Objective: {item.learning_objective}</h4>
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
                  | 5
                  | 6
                  | 7
                  | 8
                  | 9
                  | 10
                  | 11
                  | 12
                  | 13
                  | 14
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
