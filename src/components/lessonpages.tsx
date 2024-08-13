import React, { useState, useEffect } from "react";
import axiosInstance from "../axiosInstance";
import ReactPaginate from "react-paginate";
import LessonContent from "./Lessons"; 

interface Page {
  page_number: number;
  content: string;
}

interface MaterialsProps {
  lessonId: string;
  markLessonAsCompleted: () => void;
  userType: string;
  studentId: string;
  classInstanceId: number;
  quizPassed: boolean;
}

const Materials: React.FC<MaterialsProps> = ({
  lessonId,
  markLessonAsCompleted,
  userType,
  studentId,
  classInstanceId,
  quizPassed,
}) => {
  const [pages, setPages] = useState<Page[]>([]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);

  useEffect(() => {
    axiosInstance
      .get(`/pages/${lessonId}/`)
      .then((response) => {
        setPages(response.data);
        setCurrentPageIndex(0); 
      })
      .catch((error) => console.error("Error fetching pages:", error));
  }, [lessonId]);

  const handlePageClick = (event: { selected: number }) => {
    setCurrentPageIndex(event.selected);
  };

  const handleBackClick = () => {
    console.log("Back button clicked");
  };

  return (
    <div className="materials-container">
      {pages.length > 0 && (
        <LessonContent
          content={pages[currentPageIndex].content}
          onBack={handleBackClick}
          markLessonAsCompleted={markLessonAsCompleted}
          userType={userType}
          studentId={studentId}
          lessonId={lessonId}
          classInstanceId={classInstanceId}
          passed={quizPassed}
        />
      )}

      {pages.length > 1 && (
        <ReactPaginate
          previousLabel={"Previous"}
          nextLabel={"Next"}
          breakLabel={"..."}
          pageCount={pages.length}
          marginPagesDisplayed={2}
          pageRangeDisplayed={5}
          onPageChange={handlePageClick}
          containerClassName={"pagination"}
          activeClassName={"active"}
          forcePage={currentPageIndex} // Ensures the correct page is highlighted in pagination
        />
      )}
    </div>
  );
};

export default Materials;
