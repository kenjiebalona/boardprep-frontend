import { Block } from "@blocknote/core";
import "@blocknote/core/fonts/inter.css";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import { useCreateBlockNote } from "@blocknote/react";
import { useEffect, useState } from "react";
import ReactPaginate from "react-paginate";
import { useParams } from "react-router-dom";
import axiosInstance from "../axiosInstance";
import CourseModal from "../components/CourseModal";
import LessonsModal from "../components/LessonsModal";
import PublishModal from "../components/PublishModal";
import Syllabus from "../components/Syllabus";
import "../styles/details.scss";

interface Specialization {
  id: string;
  name: string;
}

interface SyllabusProps {
  lessons: Lesson[];
  onLessonClick: (lessonId: string) => Promise<void>;
  currentLesson: string | null;
  topics: Topic[];
  subtopics: Subtopic[];
  onTopicClick: (topicId: string) => void;
  onSubtopicClick: (subtopicId: string) => void;
}

interface Course {
  course_id: string;
  course_title: string;
  short_description: string;
  long_description: string;
  image: string;
  is_published: boolean;
  specializations: string[]; 
}

interface Page {
  page_number: number;
  content: Block[];
  syllabus: string;
}

interface Topic {
  topic_id: string;
  topic_title: string;
  order: number;
  subtopics: Subtopic[];
}

interface Lesson {
  lesson_id: string;
  lesson_title: string;
  order: number;
  syllabus: string;
  completed: boolean;
  quiz_id: string;
  topics: Topic[];  // Add this property to the Lesson interface
}

interface Subtopic {
  subtopic_id: string;
  subtopic_title: string;
  order: number;
}

function CourseDetails() {
  const { courseId } = useParams<{ courseId: string }>();
  const [topics, setTopics] = useState([]);
  const [subtopics, setSubtopics] = useState([]);
  const [currentTopic, setCurrentTopic] = useState<string | null>(null);
  const [currentSubtopic, setCurrentSubtopic] = useState<string | null>(null)
  const [pages, setPages] = useState<Page[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [currentLesson, setCurrentLesson] = useState<string | null>(null);
  const [isSyllabusCollapsed, setIsSyllabusCollapsed] = useState(false);
  const pageCount = pages.length;
  const [showEditorContent, setshowEditorContent] = useState(false);
  const [classId, setClassId] = useState<string | null>(null);
  const [editorContent, setEditorContent] = useState<Block[]>([]);
  const [isNewPage, setIsNewPage] = useState(false);
  const [syllabusId, setSyllabusId] = useState("");
  const [courseData, setCourseData] = useState<Course | null>(null);
  const [openModal, setOpenModal] = useState<string | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [lessonsLoaded, setLessonsLoaded] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [availableSpecializations, setAvailableSpecializations] = useState<Specialization[]>([]);
  const [blockType, setBlockType] = useState<string | null>(null);
  const [difficulty, setDifficulty] = useState<string | null>(null);
  const [showBlockForm, setShowBlockForm] = useState(false);

  const handleCreateBlockClick = () => {
    setShowBlockForm(true);
  };

  const handleBlockTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setBlockType(event.target.value);
  };

  const handleDifficultyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDifficulty(event.target.value);
  };

  const handleConfirmBlock = async () => {
    if (!blockType || !difficulty) {
      alert("Please select both block type and difficulty.");
      return;
    }

    console.log("Current Page ID:", currentPage);

    try {
      const payload = {
        blocks: [
          {
            block_type: blockType,
            difficulty: difficulty,
            content: editorContent, // Include the content from BlockNote
          },
        ],
        page: currentPage, // Replace with actual page ID dynamically
      };

      const response = await axiosInstance.post("/content-blocks/", payload); // Ensure correct API route
      console.log("Blocks created successfully:", response.data);
      setShowBlockForm(false);
    } catch (error) {
      console.error("Error creating blocks:", error);
    }
  };

  
async function uploadFile(file: File) {
  const formData = new FormData();
  formData.append("upload", file);

  try {
    const response = await axiosInstance.post("/upload_file/", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    
    const uploadedFileUrl = response.data.url;
    const isImage = file.type.startsWith("image/");
    
    return {
      url: uploadedFileUrl,
      isImage,  
    };
  } catch (error) {
    console.error("Error uploading file:", error);
    throw new Error("File upload failed");
  }
}


  const onUpdateDashboard = async () => {
    fetchSyllabus();
  };

  useEffect(() => {
    fetchSpecializations();
  }, []);

  useEffect(() => {
    console.log("Lessons length:", lessons.length);
    if (lessons.length === 0 && lessonsLoaded) {
      handleOpenLessonModal();
    }
  }, [lessons, lessonsLoaded]);


  useEffect(() => {
    if (courseId) {
      fetchSyllabusAndFirstLesson();
    }
  }, [courseId]);

  const fetchSyllabusAndFirstLesson = async () => {
    try {
      const syllabusResponse = await axiosInstance.get(`/syllabi/${courseId}/`);
      const syllabusData = syllabusResponse.data[0];
      const fetchedSyllabusId = syllabusData.syllabus_id;
      setSyllabusId(fetchedSyllabusId);

      const updatedLessons = syllabusData.lessons.map((lesson: any) => ({
        ...lesson,
        completed: false,
        quiz_id: lesson.quiz_id || "",
        topics: lesson.topics || [] 
      }));
      console.log(updatedLessons);
      setLessons(updatedLessons);

      if (updatedLessons.length > 0) {
        const firstLesson = updatedLessons[0];
        setCurrentLesson(firstLesson.lesson_id);
        if (firstLesson.topics.length > 0) {
          const firstTopic = firstLesson.topics[0];
          setCurrentTopic(firstTopic.topic_title);
          if (firstTopic.subtopics.length > 0) {
            const firstSubtopic = firstTopic.subtopics[0];
            setCurrentSubtopic(firstSubtopic.subtopic_title);
          }
        }
        await fetchPages(firstLesson.lesson_id);
      }
    } catch (error) {
      console.error("Error fetching syllabus:", error);
    }
  };

  const fetchSpecializations = async () => {
    try {
      const response = await axiosInstance.get("/specializations/");
      setAvailableSpecializations(response.data);
    } catch (error) {
      console.error("Error fetching specializations:", error);
    }
  };
  

  const fetchSyllabus = async () => {
    try {
      const response = await axiosInstance.get(`/syllabi/${courseId}/`);
      const syllabusData = response.data[0];
      const sortedLessons = syllabusData.lessons.sort(
        (a: Lesson, b: Lesson) => a.order - b.order
      );
      setLessons(sortedLessons);
    } catch (error) {
      console.error("Error fetching syllabus:", error);
    }
  };

  useEffect(() => {
    if (courseId) {
      fetchSyllabus();
    }
  }, [courseId]);
  

  const handleCheckboxChange = () => {
    setIsSyllabusCollapsed(!isSyllabusCollapsed);
  };

  useEffect(() => {
    fetchCourseData();
  }, [courseId]);

  const fetchCourseData = async () => {
    try {
      const response = await axiosInstance.get(`/courses/${courseId}/`);
      setCourseData(response.data);
    } catch (error) {
      console.error("Error fetching course data:", error);
    }
  };

  const handleConfirmPublish = async () => {
    try {
      await axiosInstance.put(`/courses/${courseId}/publish/`, {
        isPublished: true,
      });
      console.log("Course published successfully");
      fetchCourseData();
    } catch (error) {
      console.error("Error in publishing course:", error);
    }
  };

  const handleOpenCourseModal = () => {
    fetchCourseData();
    setOpenModal("course");
  };

  const handleOpenLessonModal = () => {
    if (lessons.length === 0) {
      console.warn("No lessons available for updating");
      setOpenModal("lesson");
      return;
    }
    const currentLessonDetails = lessons.find(
      (l) => l.lesson_id === currentLesson
    );
    if (currentLessonDetails) {
      setSelectedLesson(currentLessonDetails);
    }
    setOpenModal("lesson");
  };

  const handleCloseModal = () => {
    setOpenModal(null);
  };

  const fetchPages = async (subtopicId: string) => {
    if (!subtopicId) {
      console.error("Subtopic ID is undefined"); // Log if undefined
      return;
  }
  
    try {
        const response = await axiosInstance.get(`/pages/${subtopicId}/`);
        console.log("Fetched pages:", response.data); // Log the response

        setPages(response.data);

        if (response.data.length > 0) {
            setEditorContent(response.data[0].content);
            setCurrentPage(response.data[0].page_number); // Use page_number as the current page ID
            setIsNewPage(false);
        } else {
            setEditorContent([]);
            setCurrentPage(0); // Reset current page if no pages are found
            setIsNewPage(true);
        }
    } catch (error) {
        console.error("Error fetching pages:", error);
    }
};


  const handleLessonClick = async (lessonId: string) => {
    setCurrentLesson(lessonId);
    const selectedLesson = lessons.find(l => l.lesson_id === lessonId);
    if (selectedLesson && Array.isArray(selectedLesson.topics) && selectedLesson.topics.length > 0) {
      const firstTopic = selectedLesson.topics[0];
      setCurrentTopic(firstTopic.topic_title);
      if (firstTopic.subtopics.length > 0) {
        const firstSubtopic = firstTopic.subtopics[0];
        setCurrentSubtopic(firstSubtopic.subtopic_title);
      }
    }
    await fetchPages(lessonId);
    setshowEditorContent(true); 
  };


  const handleTopicClick = (topicId: string) => {
    setCurrentTopic(topicId);
    const selectedLesson = lessons.find(l => l.lesson_id === currentLesson);
    const selectedTopic = selectedLesson?.topics.find(t => t.topic_title === topicId);
    if (selectedTopic && Array.isArray(selectedTopic.subtopics) && selectedTopic.subtopics.length > 0) {
      const firstSubtopic = selectedTopic.subtopics[0];
      setCurrentSubtopic(firstSubtopic.subtopic_title);
    }
  };
  

  const handleSubtopicClick = (subtopicId: string) => {
    if (!subtopicId) {
      console.error("Subtopic ID is undefined"); // Add a log for debugging
      return;
  }
    setCurrentSubtopic(subtopicId);
    fetchPages(subtopicId);
    setshowEditorContent(true);  // Call fetchPages with the selected subtopicId
  };

  const handlePageClick = async (event: { selected: number }) => {
    const newPageIndex = event.selected;
    console.log("Page clicked, selected index:", newPageIndex);
    setCurrentPage(newPageIndex);
    setIsNewPage(true);
    if (currentLesson) {
      try {
        const response = await axiosInstance.get(
          `/pages/${currentLesson}/${newPageIndex + 1}/`
        );
        if (response.data) {
          setEditorContent(response.data.content);
          setIsNewPage(false);
        }
      } catch (error: any) {}
    }
  };

  const handleOpenPublishModal = () => {
    setShowPublishModal(true);
  };

  const handleClosePublishModal = () => {
    setShowPublishModal(false);
  };

  const editor = useCreateBlockNote({
    initialContent: editorContent.length ? editorContent : [
      { type: "paragraph", content: "New page content" }
    ],
    uploadFile,
  });
  

  const handleEditorChange = (event: any, editor: any) => {
    const data = editor.getData();
    setEditorContent(data);
    console.log("Editor content (should be HTML):", data);
  };

  const saveEditorContent = async () => {
    if (!currentLesson || !syllabusId) {
      console.error("No current lesson or syllabus ID selected");
      return;
    }

    const pageId = isNewPage ? pages.length + 1 : currentPage + 1;
    const method = isNewPage ? "post" : "put";
    const apiUrl = `/pages/${currentSubtopic}/`;

    try {
      const payload = {
        page_number: pageId,      
        content: editor.document, 
        subtopic: currentSubtopic
      };

      await axiosInstance[method](apiUrl, payload);
      console.log("Page saved successfully");
    } catch (error) {
      console.error("Error saving page content:", error);
    }
  };

  const handleNewPage = () => {
    setIsNewPage(true);
    setEditorContent([]);
    setCurrentPage(pages.length);
  };

  const handleEditorReady = (editor: any) => {
    const toolbarContainer = document.querySelector(".toolbar-container");
    if (toolbarContainer) {
      toolbarContainer.appendChild(editor.ui.view.toolbar.element);
    } else {
      console.error("Toolbar container not found");
    }
  };

  const mediaEmbedConfig = {
    toolbar: ["mediaEmbed"],
  };


  console.log("PageCount:", pageCount);

  const handleBackToSyllabus = () => {
    setshowEditorContent(false); 
  };

  const handleExamClick = () => {
    // props
  };

  const handleCancelBlock = () => {
    setShowBlockForm(false);  // assuming you use setShowBlockForm to manage form visibility
  };

  return (
    <div className="dashboard-background">
      <header className="top-header">
        <h1>Course Management</h1>
        <button className="create-btn" onClick={handleOpenCourseModal}>
          Course
        </button>
        <button className="create-btn" onClick={handleOpenLessonModal}>
          Lesson
        </button>
        <button
          className={`create-btn ${
            courseData?.is_published ? "published" : ""
          }`}
          onClick={
            !courseData?.is_published ? handleOpenPublishModal : undefined
          }
          disabled={courseData?.is_published}
        >
          {courseData?.is_published ? "Published" : "Publish Course"}
        </button>
      </header>

      <div className={`course-page ${isSyllabusCollapsed ? "collapsed" : ""}`}>
        <input
          type="checkbox"
          id="checkbox"
          className="checkbox"
          checked={isSyllabusCollapsed}
          onChange={handleCheckboxChange}
        />
        <label htmlFor="checkbox" className="toggle">
          <div className="bars" id="bar1"></div>
          <div className="bars" id="bar2"></div>
          <div className="bars" id="bar3"></div>
        </label>

        <div className="lesson-content-container">
          {!showEditorContent && (
            <Syllabus
            lessons={lessons}
            onLessonClick={handleLessonClick}
            onTopicClick={handleTopicClick}
            onSubtopicClick={handleSubtopicClick}
            currentLesson={currentLesson}
            currentTopic={currentTopic}
            currentSubtopic={currentSubtopic}
          />
          )}
        {showEditorContent && (
            <button className="btnDets" onClick={handleBackToSyllabus} >
              Back
            </button>
          )}
          {showEditorContent && (
            <button className="btnDets" onClick={saveEditorContent}>
              Save Content
            </button>
          )}
          {showEditorContent && (
            <button className="btnDets" onClick={handleNewPage}>
              Add New Page
            </button>
          )}

          {showEditorContent && (
            <button className="btnDets3" onClick={handleCreateBlockClick}>
              Create New Block
            </button>
          )}

          {showEditorContent && showBlockForm && (
            <div className="create-block-form">
              <h3>Select Block Type</h3>
              {['Objective', 'Lesson', 'Example'].map((type) => (
                <div key={type}>
                  <label>
                    <input
                      type="radio"
                      name="blockType"
                      value={type}
                      onChange={handleBlockTypeChange}
                    />
                    {type}
                  </label>
                </div>
              ))}
              <h3 className="diff-title">Select Difficulty</h3>
              {['Beginner', 'Intermediate', 'Advanced'].map((level) => (
                <div key={level}>
                  <label>
                    <input
                      type="radio"
                      name="difficulty"
                      value={level}
                      onChange={handleDifficultyChange}
                    />
                    {level}
                  </label>
                </div>
              ))}
              <div className="form-buttons">
                <button className="btnDets2" onClick={handleConfirmBlock}>Create Block</button>
                <button className="btnDets2" onClick={handleCancelBlock}>Cancel</button>
              </div>
            </div>
          )}

          {showEditorContent && (
            <div className="blocknote-editor">
                   <BlockNoteView editor={editor} />
                  
            </div>
          )}

          {showEditorContent && pageCount > 1 && (
            <ReactPaginate
              previousLabel={currentPage > 0 ? "previous" : ""}
              nextLabel={currentPage < pageCount - 1 ? "next" : ""}
              breakLabel={"..."}
              pageCount={pageCount}
              onPageChange={handlePageClick}
              containerClassName={"pagination"}
              activeClassName={"active"}
              forcePage={currentPage}
            />
          )}
          </div>
        </div>

        {openModal === "course" && (
          <CourseModal
            closeModal={handleCloseModal}
            course={courseData}
            onUpdateDashboard={onUpdateDashboard}
            availableSpecializations={availableSpecializations} 
          />
        )}

        {openModal === "lesson" && (
          <LessonsModal
            closeModal={handleCloseModal}
            syllabusId={syllabusId}
            onUpdateDashboard={onUpdateDashboard}
            initialLessonId={selectedLesson?.lesson_id}
            initialLessonTitle={selectedLesson?.lesson_title}
          />
        )}
        {showPublishModal && courseData && (
          <PublishModal
            closeModal={handleClosePublishModal}
            onConfirmPublish={handleConfirmPublish}
            courseData={courseData}
          />
        )}
      </div>
  );
}

export default CourseDetails;
