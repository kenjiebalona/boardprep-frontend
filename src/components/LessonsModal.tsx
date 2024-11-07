import React, { FormEvent, useEffect, useState, useRef } from "react";
import axios from "axios";
import "../styles/coursemodal.scss";
import axiosInstance from "../axiosInstance";

interface Lesson {
  lesson_id: string;
  lesson_title: string;
  order: number;
  syllabus: string;
}

interface LessonModalProps {
  closeModal: () => void;
  onUpdateDashboard: () => void;
  syllabusId: string;
  initialLessonId?: string;
  initialLessonTitle?: string;
}

function LessonModal({
  closeModal,
  onUpdateDashboard,
  syllabusId,
  initialLessonId = "",
  initialLessonTitle = "",
}: LessonModalProps) {
  const [isUpdating, setIsUpdating] = useState(Boolean(initialLessonId));
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const orderRef = useRef<HTMLInputElement>(null);
  const [selectedLessonId, setSelectedLessonId] = useState(initialLessonId);
  const [lessonTitle, setLessonTitle] = useState(initialLessonTitle);
  const [dropdownSelectedLesson, setDropdownSelectedLesson] =
    useState(initialLessonTitle);

  const [formErrors, setFormErrors] = useState({
    lessonTitle: "",
    order: "",
  });

  const [touched, setTouched] = useState({
    lessonTitle: false,
    order: false,
  });

  const handleBlur = (field: string) => {
    setTouched({ ...touched, [field]: true });
  };

  useEffect(() => {
    setIsUpdating(!!initialLessonId);
    if (!initialLessonId) {
      // If there is no initial lesson ID, clear the lesson title for new lesson creation
      setLessonTitle("");
    }
  }, [initialLessonId]);

  useEffect(() => {
    if (isUpdating) {
      // When updating an existing lesson
      fetchLessons();
    } else {
      // When creating a new lesson
      setSelectedLessonId("");
      setLessonTitle("");
      setDropdownSelectedLesson("");
      if (orderRef.current) {
        orderRef.current.value = "";
      }
    }
  }, [isUpdating, initialLessonId, initialLessonTitle]);

  const fetchLessons = async () => {
    try {
      const response = await axiosInstance.get(
        `/lessons/by_syllabus/${syllabusId}/`
      );
      setLessons(response.data);

      if (initialLessonId && response.data.length > 0) {
        const currentLesson = response.data.find(
          (lesson: Lesson) => lesson.lesson_id === initialLessonId
        );
        if (currentLesson) {
          setSelectedLessonId(initialLessonId);
          setLessonTitle(currentLesson.lesson_title);
          setDropdownSelectedLesson(currentLesson.lesson_title);
        }
      }
    } catch (error) {
      console.error("Error fetching lessons:", error);
    }
  };

  useEffect(() => {
    const fetchLessonDetails = async () => {
      try {
        const response = await axiosInstance.get(
          `/lessons/${selectedLessonId}`
        );

        setLessonTitle(response.data.lesson_title);
      } catch (error) {
        console.error("Error fetching lesson details:", error);
      }
    };

    if (selectedLessonId && isUpdating) {
      fetchLessonDetails();
    }
  }, [selectedLessonId]);

  const handleLessonSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedLessonTitle = event.target.value;
    setDropdownSelectedLesson(selectedLessonTitle);

    const selectedLesson = lessons.find(
      (lesson) => lesson.lesson_title === selectedLessonTitle
    );
    if (selectedLesson) {
      setSelectedLessonId(selectedLesson.lesson_id);
      setLessonTitle(selectedLesson.lesson_title);
    }
  };

  const handleLessonTitleChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setLessonTitle(event.target.value);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;
    const order = orderRef.current?.value;
    let response;

    if (isUpdating) {
      response = await axiosInstance.put(
        `/lessons/${selectedLessonId}/update_lesson/`,
        { lesson_id: selectedLessonId, order, lesson_title: lessonTitle }
      );
    } else {
      // POST request for creating a new lesson
      response = await axiosInstance.post("/lessons/", {
        lesson_title: lessonTitle,
        order: order,
        syllabus: syllabusId,
      });
    }

    if (response && (response.status === 200 || response.status === 201)) {
      onUpdateDashboard();
      closeModal();
    }
  };

  const validateForm = () => {
    const errors = { ...formErrors };
    errors.lessonTitle = !lessonTitle ? "Lesson title is required." : "";

    const orderValue = orderRef.current?.value;
    errors.order = !orderValue
      ? "Order is required."
      : !/^\d+$/.test(orderValue) // Regex to check if the value is a positive integer
      ? "Order must be an integer."
      : "";

    setFormErrors(errors);
    return !Object.values(errors).some((error) => error);
  };

  const handleCloseModal = () => {
    closeModal();
};

  return (
    <div className="main-modal">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{isUpdating ? "Update Lesson" : "Create Lesson"}</h2>
          <span className="close" onClick={handleCloseModal}>
            &times;
          </span>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-radio-buttons">
            <label className="radio-label">
              <input
                type="radio"
                name="action"
                checked={!isUpdating}
                onChange={() => {
                  setIsUpdating(false);
                  setLessonTitle("");
                }}
              />
              New Lesson
            </label>
            <label className="radio-label">
              <input
                type="radio"
                name="action"
                checked={isUpdating}
                onChange={() => setIsUpdating(true)}
                disabled={lessons.length === 0} // Disable if no lessons available
              />
              Update Lesson
            </label>
          </div>
          {
            isUpdating ? (
              <select
                value={dropdownSelectedLesson}
                onChange={handleLessonSelect}
              >
                <option value="">Select a Lesson</option>
                {lessons.map((lesson) => (
                  <option key={lesson.lesson_id} value={lesson.lesson_title}>
                    {lesson.lesson_title}
                  </option>
                ))}
              </select>
            ) : null /* Removed input for New Lesson ID */
          }
          <input
            type="text"
            placeholder="Lesson Title"
            value={lessonTitle}
            onChange={handleLessonTitleChange}
            onBlur={() => handleBlur("lessonTitle")}
            className={`form-control ${
              formErrors.lessonTitle && touched.lessonTitle ? "error-input" : ""
            }`}
          />
          {formErrors.lessonTitle && touched.lessonTitle && (
            <div className="error-message">{formErrors.lessonTitle}</div>
          )}
          <input
            type="text"
            placeholder="Order"
            ref={orderRef}
            onBlur={() => handleBlur("order")}
            className={`form-control ${
              formErrors.order && touched.order ? "error-input" : ""
            }`}
          />
          {formErrors.order && touched.order && (
            <div className="error-message">{formErrors.order}</div>
          )}
          <button type="submit">
            {isUpdating ? "Update Lesson" : "Create Lesson"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default LessonModal;
