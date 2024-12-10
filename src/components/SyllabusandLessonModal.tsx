import React, { FormEvent, useRef } from "react";
import axiosInstance from "../axiosInstance";

interface SyllabusLessonModalProps {
  closeModal: () => void;
  onCreateLesson: () => void;
  onUpdateDashboard: () => void;
  course: string;
}

function SyllabusLessonModal({
  closeModal,
  onCreateLesson,
  onUpdateDashboard,
  course,
}: SyllabusLessonModalProps) {
  const syllabusIdRef = useRef<HTMLInputElement>(null);
  const lessonIdRef = useRef<HTMLInputElement>(null);
  const lessonTitleRef = useRef<HTMLInputElement>(null);
  const orderRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const syllabusId = syllabusIdRef.current?.value;
    const lessonId = lessonIdRef.current?.value;
    const lessonTitle = lessonTitleRef.current?.value;
    const order = orderRef.current?.value;

    const syllabusPayload = {
      syllabus_id: syllabusIdRef.current?.value,
      course_id: course,
    };

    try {
      // First, send a request to the /syllabi/ endpoint
      const syllabusResponse = await axiosInstance.post(
        "/syllabi/",
        syllabusPayload
      );

      if (syllabusResponse.status === 201) {
        // If the syllabus is created successfully, then send a request to the /lessons/ endpoint
        const lessonPayload = {
          lesson_id: lessonIdRef.current?.value,
          lesson_title: lessonTitleRef.current?.value,
          order: orderRef.current?.value,
          syllabus_id: syllabusResponse.data.id, // Use the ID from the syllabus response
        };

        const lessonResponse = await axiosInstance.post(
          "/lessons/",
          lessonPayload
        );

        if (lessonResponse.status === 201) {
          // If the lesson is created successfully
          onCreateLesson();
          onUpdateDashboard();
          closeModal();
        }
      }
    } catch (error) {
      console.error("Error creating syllabus and lesson:", error);
      alert("Failed to create syllabus and lesson");
      console.log(syllabusId);
      console.log(course);
      console.log(lessonId);
      console.log(lessonTitle);
      console.log(order);
    }
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <div className="modal-header">
          <h1>Create Syllabus and Lesson</h1>
          <span className="close" onClick={closeModal}>
            &times;
          </span>
        </div>

        <form onSubmit={handleSubmit}>
          <input type="text" placeholder="Syllabus ID" ref={syllabusIdRef} />
          <input type="text" placeholder="Lesson ID" ref={lessonIdRef} />
          <input type="text" placeholder="Lesson Title" ref={lessonTitleRef} />
          <input type="text" placeholder="Order" ref={orderRef} />
          <button type="submit">Create Syllabus and Lesson</button>
        </form>
      </div>
    </div>
  );
}

export default SyllabusLessonModal;
