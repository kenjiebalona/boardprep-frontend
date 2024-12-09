import React, { useState } from 'react';
import '../styles/masterymodal.scss';

interface MasteryModalProps {
  isOpen: boolean;
  masteryData: any;
  onClose: () => void;
}

const MasteryModal: React.FC<MasteryModalProps> = ({ isOpen, masteryData, onClose }) => {
  const [filter, setFilter] = useState<'lesson' | 'topic' | 'subtopic'>('lesson');  

  if (!isOpen || !masteryData || masteryData.length === 0) return null;

  const getArrowAndColor = (percentage: number) => {
    if (percentage >= 60) {
      return { arrow: '🡅', color: 'green' }; 
    } else if (percentage < 50) {
      return { arrow: '🡇', color: 'red' }; 
    } else {
      return { arrow: '━', color: 'orange' }; 
    }
  };

  const renderLesson = (lesson: any) => (
    <div key={lesson.lesson_id} className="lesson-card">
      <div className='mastery-card'>
      <div className="card-content">
        <div className="left-side-two">
          <h3 className='header-mastery'>⭐{lesson.lesson_title}</h3>
          <div className={`mastery-indicator-two ${getArrowAndColor(lesson.mastery).color}`}>
            <span>{lesson.mastery}% </span>
          </div>
        </div>
        <div className="right-side-two">
        <span
              className={`mastery-indicator ${getArrowAndColor(lesson.mastery).color}`}
            >
              {getArrowAndColor(lesson.mastery).arrow}
            </span>
        </div>
      </div>
    </div>
    </div>
  );

  const renderTopic = (topic: any) => (
    <div key={topic.topic_id} className="topic-card">
      <div className="card-content">
        <div className="left-side-two">
          <h4 className='header-mastery-two'>🌟{topic.topic_title}</h4>
          <div className={`mastery-indicator-two ${getArrowAndColor(topic.mastery).color}`}>
            <span>{topic.mastery}% </span>
          </div>
        </div>
        <div className="right-side-two">
        <span
              className={`mastery-indicator ${getArrowAndColor(topic.mastery).color}`}
            >
              {getArrowAndColor(topic.mastery).arrow}
            </span>
        </div>
      </div>
    </div>
  );

  const renderSubtopic = (subtopic: any) => (
    <div key={subtopic.subtopic_id} className="subtopic-card">
      <div className="card-content">
        <div className="left-side-two">
          <h5 className='header-mastery-three'>✨{subtopic.subtopic_title}</h5>
          <div className={`mastery-indicator-two ${getArrowAndColor(subtopic.mastery).color}`}>
            <span>{subtopic.mastery}% </span>
          </div>
        </div>
        <div className="right-side-two">
        <span
              className={`mastery-indicator ${getArrowAndColor(subtopic.mastery).color}`}
            >
              {getArrowAndColor(subtopic.mastery).arrow}
            </span>  
        </div>
      </div>

      <div className="learning-objectives-container">
        {subtopic.learning_objectives?.map((objective: any) => (
          <div key={objective.objective_id} className="objective-card">
            <p className='header-mastery-four'>{objective.objective_text}</p>
            <div className={`mastery-indicator-two ${getArrowAndColor(objective.mastery).color}`}>
              <span>{objective.mastery}% </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="mastery-modal-overlay">
      <div className="mastery-modal">
        <h2 className='header-mastery'>Mastery Data</h2>

        <div className="filter-container-three">
          <div className="filter-buttons-three">
            <button
              className={`filter-button-three ${filter === 'lesson' ? 'selected' : ''}`}
              onClick={() => setFilter('lesson')}
            >
              ⭐Lesson
            </button>
            <button
              className={`filter-button-three ${filter === 'topic' ? 'selected' : ''}`}
              onClick={() => setFilter('topic')}
            >
              🌟Topic
            </button>
            <button
              className={`filter-button-three ${filter === 'subtopic' ? 'selected' : ''}`}
              onClick={() => setFilter('subtopic')}
            >
              ✨Subtopic
            </button>
          </div>
        </div>

        <div className="mastery-modal-content">
          {masteryData.map((lesson: any) => (
            <div key={lesson.lesson_id} className="lesson-card">
              {filter === 'lesson' && renderLesson(lesson)}

              {filter === 'lesson' || filter === 'topic' ? (
                lesson.topics?.map((topic: any) => (
                  <div key={topic.topic_id}>
                    {filter !== 'subtopic' && renderTopic(topic)} 

                    {(filter === 'lesson' || filter === 'topic' || filter === 'subtopic') && topic.subtopics?.map((subtopic: any) => renderSubtopic(subtopic))}
                  </div>
                ))
              ) : null}

              {filter === 'subtopic' && (
                lesson.topics?.map((topic: any) =>
                  topic.subtopics?.map((subtopic: any) => renderSubtopic(subtopic))
                )
              )}
            </div>
          ))}
        </div>
        <button className="close-btn" onClick={onClose}>X</button>
      </div>
    </div>
  );
};

export default MasteryModal;
