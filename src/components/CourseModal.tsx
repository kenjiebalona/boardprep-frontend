import axios from "axios";
import { debounce } from "lodash";
import React, { FormEvent, useEffect, useRef, useState } from "react";
import axiosInstance from "../axiosInstance";
import "../styles/coursemodal.scss";

interface Specialization {
  id: string;
  name: string;
}

interface CourseModalProps {
  closeModal: () => void;
  course?: Course | null;
  onUpdateDashboard: () => void;
  availableSpecializations: Specialization[]; 
}

interface Course {
  course_id: string;
  course_title: string;
  short_description: string;
  long_description: string;
  image: string;
  specializations: string[]; 
}

function CourseModal({
  closeModal,
  course,
  onUpdateDashboard,
  availableSpecializations, 
}: CourseModalProps) {
  const courseIdRef = useRef<HTMLInputElement>(null);
  const courseTitleRef = useRef<HTMLInputElement>(null);
  const shortDescriptionRef = useRef<HTMLTextAreaElement>(null);
  const imageRef = useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formErrors, setFormErrors] = useState({
    courseId: "",
    courseTitle: "",
    shortDescription: "",
    image: "",
  });
  const [isFormValid, setIsFormValid] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [touched, setTouched] = useState({
    courseId: false,
    courseTitle: false,
    shortDescription: false,
    image: false,
  });
  const [isCourseIdAvailable, setIsCourseIdAvailable] = useState(true);
  const [selectedSpecializations, setSelectedSpecializations] = useState<string[]>(
    course?.specializations || []
  );

  const checkCourseIdAvailability = async (courseId: string) => {
    try {
      const response = await axiosInstance.get(`/courses/check_id/${courseId}`);
      setIsCourseIdAvailable(!response.data.exists);
    } catch (error) {
      console.error("Error checking course ID availability:", error);
    }
  };

  const [debouncedCheck, setDebouncedCheck] = useState(() =>
    debounce(checkCourseIdAvailability, 500)
  );

  useEffect(() => {
    setDebouncedCheck(() => debounce(checkCourseIdAvailability, 500));

    return () => {
      debouncedCheck.cancel();
    };
  }, []);

  const handleCourseIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const courseId = e.target.value;
    if (courseId.length <= 10) {
      debouncedCheck(courseId);
    }
    handleInputChange(e);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    e.target.setCustomValidity("");
    validateForm();
  };
  const handleBlur = (field: any) => {
    setTouched({ ...touched, [field]: true });
  };

  
  useEffect(() => {
    if (course) {
      setIsEditing(true);
      if (courseIdRef.current) courseIdRef.current.value = course.course_id;
      if (courseTitleRef.current)
        courseTitleRef.current.value = course.course_title;
      if (shortDescriptionRef.current)
        shortDescriptionRef.current.value = course.short_description;

      if (course.specializations && course.specializations.length > 0) {
        setSelectedSpecializations(course.specializations);
        console.log("Course Specializations: ", course.specializations);
      } else {
        console.log("No specializations selected for this course.");
      }
    }
    validateForm();
  }, [course]);

  const validateForm = () => {
    const errors = { ...formErrors };

    errors.courseId =
      courseIdRef.current && courseIdRef.current.value === ""
        ? "Course ID is required."
        : courseIdRef.current && courseIdRef.current.value.length > 10
        ? "Course ID must be maximum 10 characters long."
        : !isCourseIdAvailable
        ? "Course ID is already taken."
        : "";

    errors.courseTitle =
      courseTitleRef.current && courseTitleRef.current.value.length < 5
        ? "Course title must be at least 5 characters long."
        : "";

    errors.shortDescription =
      shortDescriptionRef.current && shortDescriptionRef.current.value === ""
        ? "Short description is required."
        : "";

    errors.image = errors.image =
      imageRef.current && !imageRef.current.files?.[0]
        ? "Please select an image file."
        : "";

    setFormErrors(errors);

    const isAllFieldsValid = !Object.values(errors).some(
      (error) => error !== ""
    );
    setIsFormValid(isAllFieldsValid);
  };

  const handleUpdateDashboard = () => {
    closeModal();
  };

  const handleSpecializationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const options = e.target.options;
    const selected = [];
    for (const element of options) {
      if (element.selected) {
        selected.push(element.value);
      }
    }
    console.log("Selected Specializations: ", selected);
    setSelectedSpecializations(selected);
  };

  const handleInvalid = (target: HTMLInputElement | HTMLTextAreaElement) => {
    const customMessages: { [key: string]: string } = {
      courseId: "Please enter a valid Course ID.",
      courseTitle: "Please enter a valid Course Title.",
      shortDescription: "Please provide a short description.",
    };

    const message = customMessages[target.name as keyof typeof customMessages];
    target.setCustomValidity(message || "");
  };

  const renderValidationIcon = (error: string) => {
    if (error) {
      return <span className="validation-icon error-icon">⨂</span>;
    }
    return <span className="validation-icon success-icon">✔</span>;
  };

  useEffect(() => {
    setTouched({
      courseId: false,
      courseTitle: false,
      shortDescription: false,
      image: false,
    });
  }, [course]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setServerError(null);
    validateForm();
    if (!isFormValid) return;

    const courseId = courseIdRef.current?.value;
    const courseTitle = courseTitleRef.current?.value;
    const shortDescription = shortDescriptionRef.current?.value;
    const image = imageRef.current?.files?.[0] || null;

    try {
      let newCourseId;
      if (isEditing) {
        if (course) {
          const formData = new FormData();
          formData.append("course_id", course.course_id);
          formData.append("course_title", courseTitle || "");
          formData.append("short_description", shortDescription || "");
          if (image) formData.append("image", image);

          selectedSpecializations.forEach((spec) => {
            formData.append("specializations", spec);
          });

          const response = await axiosInstance.put(
            `/courses/${course.course_id}/`,
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          );

          if (response.status === 200) {
            closeModal();
          }
        }
      } else {
        const formData = new FormData();
        formData.append("course_id", courseId ?? "");
        formData.append("course_title", courseTitle ?? "");
        formData.append("short_description", shortDescription ?? "");
        if (image) formData.append("image", image);

        const response = await axiosInstance.post("/courses/", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        console.log("Submitting course with ID:", courseId);

        if (response.status === 200 || response.status === 201) {
          if (!isEditing) {
            newCourseId = response.data.course_id;
          }
          closeModal();
          handleUpdateDashboard();
        } else {
          console.error("Error response", response.data);
        }
      }
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        setServerError(
          err.response.data.message ||
            "An error occurred while submitting the form."
        );
      } else {
        setServerError("An unexpected error occurred.");
      }
      console.error("Error in POST/PUT request:", err);
    }
  };


  return (
    <div className="main-modal">
      <div className="modal-content">
        <div className="modal-header">
          <h1>{isEditing ? "Edit Course" : "Create Course"}</h1>
          <span className="close" onClick={closeModal}>
            &times;
          </span>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <input
              type="text"
              placeholder="Course ID"
              ref={courseIdRef}
              name="courseId"
              required
              onChange={handleCourseIdChange}
              onBlur={() => handleBlur("courseId")}
              className={`form-control ${
                formErrors.courseId && touched.courseId ? "error-input" : ""
              }`}
            />
            {formErrors.courseId && touched.courseId && (
              <div className="error-message">{formErrors.courseId}</div>
            )}
          </div>

          <div className="form-group">
            <input
              type="text"
              placeholder="Course Title"
              ref={courseTitleRef}
              name="courseTitle"
              required
              onChange={handleInputChange}
              onBlur={() => handleBlur("courseTitle")}
              className={`form-control ${
                formErrors.courseTitle && touched.courseTitle
                  ? "error-input"
                  : ""
              }`}
            />
            {formErrors.courseTitle && touched.courseTitle && (
              <div className="error-message">{formErrors.courseTitle}</div>
            )}
          </div>

          <div className="form-group">
            <textarea
              placeholder="Short Description"
              ref={shortDescriptionRef}
              name="shortDescription"
              required
              onChange={handleInputChange}
              onBlur={() => handleBlur("shortDescription")}
              className={`form-control ${
                formErrors.shortDescription && touched.shortDescription
                  ? "error-input"
                  : ""
              }`}
            />
            {formErrors.shortDescription && touched.shortDescription && (
              <div className="error-message">{formErrors.shortDescription}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="specializations">Specializations</label>
            <select
              id="specializations"
              name="specializations"
              multiple
              value={selectedSpecializations}
              onChange={handleSpecializationChange}
              className="form-control"
            >
              {availableSpecializations.map((spec) => (
                <option key={spec.id} value={spec.id}>
                  {spec.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <input
              type="file"
              accept="image/*"
              ref={imageRef}
              name="image"
              required={!isEditing}
              onChange={handleInputChange}
              onBlur={() => handleBlur("image")}
              className={`form-control ${
                formErrors.image && touched.image ? "error-input" : ""
              }`}
            />
            {formErrors.image && touched.image && (
              <div className="error-message">{formErrors.image}</div>
            )}
          </div>
          {serverError && <div className="server-error">{serverError}</div>}
          <button type="submit" className="submit-btn" disabled={!isFormValid}>
            {isEditing ? "Save" : "Create"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CourseModal;
