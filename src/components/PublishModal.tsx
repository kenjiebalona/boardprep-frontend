import React, { FormEvent } from "react";
import "../styles/coursemodal.scss"; // Reusing the same styles as LessonModal

interface Course {
  course_id: string;
  course_title: string;
  short_description: string;
  long_description: string;
  image: string;
  is_published: boolean;
}

interface PublishModalProps {
  closeModal: () => void;
  onConfirmPublish: () => void;
  courseData: Course;
}

function PublishModal({
  closeModal,
  onConfirmPublish,
  courseData,
}: PublishModalProps) {
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onConfirmPublish();
  };

  const isPublished = courseData?.is_published;

  return (
    <div className="main-modal">
      <div className="modal-content">
        <div className="modal-header">
          <h1>{isPublished ? "Course Published" : "Publish Course"}</h1>
          <span className="close" onClick={closeModal}>
            &times;
          </span>
        </div>
        <form onSubmit={handleSubmit}>
          <p>
            {isPublished
              ? "This course has already been published."
              : "Are you sure you want to publish this course?"}
          </p>
          <button
            type="submit"
            className={`submit-btn ${isPublished ? "published" : ""}`}
            disabled={isPublished}
          >
            {isPublished ? "Published" : "Publish"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default PublishModal;
