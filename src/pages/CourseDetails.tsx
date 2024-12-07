import { useEffect, useState } from "react";
import ReactPaginate from "react-paginate";
import { useParams } from "react-router-dom";
import axiosInstance from "../axiosInstance";
import AlertMessage from "../components/AlertMessage";
import CourseModal from "../components/CourseModal";
import LearningObjectiveModal from "../components/LearningObjectiveModal";
import LessonsModal from "../components/LessonsModal";
import PublishModal from "../components/PublishModal";
import Syllabus from "../components/Syllabus";
import TipTapEditor from "../components/TipTap";
import "../styles/details.scss";

interface BlockFormData {
  page: number;
  block_type: string;
  difficulty?: string;
  content: string;
  file: File | null;
}

interface ContentBlock {
  block_id: number;
  block_type: string;
  difficulty: string;
  content: string;
}

interface Objective {
  text: string;
}

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
  page_id: string;
  page_number: number;
  content: ContentBlock[];
  syllabus: string;
}

interface Topic {
  topic_id: string;
  topic_title: string;
  order: number;
  subtopics: Subtopic[];
  learning_objectives: Objective[];
}

interface Lesson {
  lesson_id: string;
  lesson_title: string;
  order: number;
  syllabus: string;
  completed: boolean;
  quiz_id: string;
  topics: Topic[];
  learning_objectives: Objective[];
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
  const [currentSubtopic, setCurrentSubtopic] = useState<string | null>(null);
  const [subtopicId, SetSubtopicId] = useState<string | null>(null);
  const [pages, setPages] = useState<Page[]>([]);
  const [pageMapping, setPageMapping] = useState<{ [key: number]: string }>({});
  const [isFetchingPages, setIsFetchingPages] = useState(false);

  const [currentPage, setCurrentPage] = useState(0);
  const [pageId, setPageId] = useState(0);
  const [block, setCurrentBlock] = useState(0);
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([]);
  const [hasBlock, setHasBlock] = useState(false);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [currentLesson, setCurrentLesson] = useState<string | null>(null);
  const [isSyllabusCollapsed, setIsSyllabusCollapsed] = useState(false);
  const pageCount = useState(0);
  const [showEditorContent, setshowEditorContent] = useState(false);
  const [classId, setClassId] = useState<string | null>(null);
  const [editorContent, setEditorContent] = useState<ContentBlock[]>([]);
  const [isNewPage, setIsNewPage] = useState(false);
  const [syllabusId, setSyllabusId] = useState("");
  const [courseData, setCourseData] = useState<Course | null>(null);
  const [openModal, setOpenModal] = useState<string | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [lessonsLoaded, setLessonsLoaded] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [availableSpecializations, setAvailableSpecializations] = useState<
    Specialization[]
  >([]);
  const [blockType, setBlockType] = useState<string | null>(null);
  const [difficulty, setDifficulty] = useState<string | null>(null);
  const [showBlockForm, setShowBlockForm] = useState(false);
  const [showObjectiveModal, setShowObjectiveModal] = useState(false);
  
  const [blockTypeFilter, setBlockTypeFilter] = useState<Set<string>>(new Set());
  const [difficultyFilter, setDifficultyFilter] = useState<Set<string>>(new Set());

  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState("success");

  const filteredContentBlocks = contentBlocks.filter((block) => {
    const matchesType =
      blockTypeFilter.size === 0 || blockTypeFilter.has(block.block_type);
    const matchesDifficulty =
      difficultyFilter.size === 0 || difficultyFilter.has(block.difficulty);
    return matchesType && matchesDifficulty;
  });
  

  const handleCreateLessonBlock = async () => {
    try {
      if (!pageId) {
        alert("No page is selected to add a lesson block.");
        return;
      }
  
      const blockData: BlockFormData = {
        page: pageId,
        block_type: "lesson", 
        content: "New Lesson Content",
        file: null,
      };
  
      const payload = { blocks: [blockData] };
      const response = await axiosInstance.post("/content-blocks/", payload);
  
      const createdBlock = response.data.blocks[0];
      setContentBlocks((prevBlocks) => [...prevBlocks, createdBlock]);
      setEditorContent((prevContent) => [...prevContent, createdBlock]);
  
      setHasBlock(true);

       // Show success alert
       setAlertMessage("Lesson block added successfully!");
       setAlertType("success");
       setShowAlert(true);

      console.log("Lesson content block created successfully:", createdBlock);
    } catch (error) {
      console.error("Error creating lesson content block:", error);

      // Show error alert
      setAlertMessage("Failed to add lesson block. Please try again.");
      setAlertType("error");
      setShowAlert(true);

      alert("Failed to create lesson content block. Please try again.");
    }
  };
  

  
  const handleOpenObjectiveModal = () => {
    setShowObjectiveModal(true);
  };

  const handleCloseObjectiveModal = () => {
    setShowObjectiveModal(false);
  };

  const handleSaveObjectives = async () => {
    try {  
      setAlertMessage("Learning objectives saved successfully!");
      setAlertType("success");
      setShowAlert(true); 
    } catch (error) {
      console.error("Error saving objectives:", error);
      setAlertMessage("Failed to save learning objectives.");
      setAlertType("error");
      setShowAlert(true); 
    }
  };

  const fetchContentBlocks = async (pageId: number) => {
    try {
      console.log("Fetching content blocks for page ID:", pageId);
      const response = await axiosInstance.get(
        `/pages/${pageId}/content_blocks/`
      );

      const blocks: ContentBlock[] = response.data.map(
        (block: any) =>
          ({
            ...block,
            block_type: block.block_type || "Unknown Type",
            block_id: Number(block.block_id),
          } as ContentBlock)
      );

      setContentBlocks(blocks);
      setHasBlock(blocks.length > 0);
      setEditorContent(blocks);
    } catch (error) {
      console.error("Error fetching content blocks:", error);
    }
  };

  const handleContentChange = (id: number, updatedContent: string) => {
    setContentBlocks((prevBlocks) =>
      prevBlocks.map((block) =>
        block.block_id === id ? { ...block, content: updatedContent } : block
      )
    );
  };
  
  const handleDeleteBlock = async (blockId: number) => {
    try {
      await axiosInstance.delete(`/content-blocks/${blockId}/`);
      console.log(
        `Block with ID ${blockId} deleted successfully from the database.`
      );

      setContentBlocks((prevBlocks) =>
        prevBlocks.filter((block) => Number(block.block_id) !== blockId)
      );
    } catch (error) {
      console.error("Error deleting block:", error);
      alert("Failed to delete the block. Please try again.");
    }
  };

  const handleCreateBlockClick = () => {
    setShowBlockForm(true);
  };

  const handleBlockTypeChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setBlockType(event.target.value);
  };

  const handleDifficultyChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setDifficulty(event.target.value);
  };

  const handleConfirmBlock = async () => {
    if (!blockType || !difficulty) {
      alert("Please select both block type and difficulty.");
      return;
    }
  
    try {
      const blockData: BlockFormData = {
        page: pageId,
        block_type: blockType.toLowerCase(),
        difficulty: difficulty.toLowerCase(),
        content: "New Content",
        file: null,
      };
  
      const payload = { blocks: [blockData] };
      const response = await axiosInstance.post("/content-blocks/", payload);
  
      const createdBlock = response.data.blocks[0];
      setContentBlocks((prevBlocks) => [...prevBlocks, createdBlock]);
      setEditorContent((prevContent) => [...prevContent, createdBlock]);
  
      setHasBlock(true);
      setShowBlockForm(false);

      // Show success alert
      setAlertMessage("New block created successfully!");
      setAlertType("success");
      setShowAlert(true);

    } catch (error) {

      // Show error alert
      setAlertMessage("Failed to create block. Please try again.");
      setAlertType("error");
      setShowAlert(true);

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
        topics: lesson.topics || [],
      }));
  
      console.log("Updated Lessons:", updatedLessons);
      setLessons(updatedLessons);
  
     
      if (updatedLessons.length === 0) return;
  
    
      const firstLesson = updatedLessons[0];
      setCurrentLesson(firstLesson.lesson_id);
  
     
      const firstTopic = firstLesson.topics?.[0];
      const firstSubtopic = firstTopic?.subtopics?.[0];
  
      
      if (firstTopic) setCurrentTopic(firstTopic.topic_title);
      if (firstSubtopic) {
        setCurrentSubtopic(firstSubtopic.subtopic_title);
        SetSubtopicId(firstSubtopic.subtopic_id); 
      }
  
      
      if (firstSubtopic?.subtopic_id) {
        await fetchPages(firstSubtopic.subtopic_id);
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
    console.log("Subtopic Id in Fetched Pages function:", subtopicId)
    if (!subtopicId) {
      console.error("Subtopic ID is undefined");
      return;
    }

    setIsFetchingPages(true);
    setContentBlocks([]);
    setEditorContent([]);
    setHasBlock(false);
  
  
    try {
      const response = await axiosInstance.get(`/pages/by_subtopic/${subtopicId}/`);
      const fetchedPages = response.data.pages;
  
      if (fetchedPages.length > 0) {
        const firstPage = fetchedPages[0];
        setEditorContent(firstPage.content);
        setCurrentPage(firstPage.page_number);
        setPageId(firstPage.page_id);
        setIsNewPage(false);

        console.log("PageId of firstPage:", pageId)
        await fetchContentBlocks(firstPage.page_id);
        const newPageMapping: { [key: number]: string } = {};
        fetchedPages.forEach((page: Page, index: number) => {
          newPageMapping[index] = page.page_id;
        });
        setPageMapping(newPageMapping);
      } else {
        setEditorContent([]);
        setCurrentPage(0);
        setPageId(0);
        setIsNewPage(true);
      }
  
      setPages(fetchedPages);
      console.log("Fetched pages:", fetchedPages);

    } catch (error) {
      console.error("Error fetching pages:", error);
    }
    finally {
      setIsFetchingPages(false); 
    }
  };


  

  const handleLessonClick = async (lessonId: string) => {
    setCurrentLesson(lessonId);
    const selectedLesson = lessons.find((l) => l.lesson_id === lessonId);
  
    if (selectedLesson && selectedLesson.topics && selectedLesson.topics.length > 0) {
      const firstTopic = selectedLesson.topics[0];
      setCurrentTopic(firstTopic.topic_title);
  
      if (firstTopic.subtopics && firstTopic.subtopics.length > 0) {
        const firstSubtopic = firstTopic.subtopics[0];
        setCurrentSubtopic(firstSubtopic.subtopic_title);
        SetSubtopicId(firstSubtopic.subtopic_id);
        await fetchPages(firstSubtopic.subtopic_id);
      }
    }
    console.log("Setting showEditorContent to true");
  
    setshowEditorContent(true);
  };
  
  
  const handleTopicClick = (topicId: string) => {
    setCurrentTopic(topicId);
    const selectedLesson = lessons.find((l) => l.lesson_id === currentLesson);
    const selectedTopic = selectedLesson?.topics.find(
      (t) => t.topic_title === topicId
    );
    if (
      selectedTopic &&
      Array.isArray(selectedTopic.subtopics) &&
      selectedTopic.subtopics.length > 0
    ) {
      const firstSubtopic = selectedTopic.subtopics[0];
      setCurrentSubtopic(firstSubtopic.subtopic_title);
    }
  };

  const handleSubtopicClick = (subtopicId: string) => {
    if (subtopicId === currentSubtopic) {
      console.log(`Subtopic ${subtopicId} already selected, skipping fetch.`);
      return; // Prevent fetching if the same subtopic is clicked again
    }
    setPages([])
    console.log("Clicked subtopicId:", subtopicId);
    console.log("handle first", subtopicId);
    SetSubtopicId(subtopicId); 
    console.log("Setting showEditorContent to true on sub");
    setshowEditorContent(true); 
  
  };
  

  useEffect(() => {
    console.log("useeff first", subtopicId);
    if (subtopicId) {
      console.log("Fetching pages for subtopic:", subtopicId);
      fetchPages(subtopicId); 
    }
  }, [subtopicId]);
  
  

  const handlePageClick = async (event: { selected: number }) => {
    console.log("Page Clicked")
    const newPageNumber = event.selected;
    const newPageId = pageMapping[newPageNumber];
  
    setCurrentPage(newPageNumber);
    setIsNewPage(false);
  
    if (newPageId) {
      try {
        console.log("Fetching data for new page ID:", newPageId);
  
      
        setContentBlocks([]);
        setEditorContent([]);
        setHasBlock(false);
  
    
        const response = await axiosInstance.get(`/pages/${newPageId}/`);
        if (response.data) {
          const newPageContent = response.data.content;
          setEditorContent(newPageContent);
          setPageId(Number(newPageId));
          
         
          await fetchContentBlocks(Number(newPageId));
        } else {
          console.log("No content found for page ID:", newPageId);
        }
      } catch (error) {
        console.error("Error fetching page data:", error);
      }
    } else {
      console.warn(`No mapping found for page number ${newPageNumber}`);
    }
  };
  
  

  const handleOpenPublishModal = () => {
    setShowPublishModal(true);
  };

  const handleClosePublishModal = () => {
    setShowPublishModal(false);
  };

  const saveEditorContent = async () => {
    const method = contentBlocks.some((block) => block.block_id)
      ? "put"
      : "post";
    const apiUrl = `/content-blocks/by_page/${pageId}/`;
    console.log("Curr Page", currentPage);
    console.log("Page Id", pageId);

    try {
      const payload = {
        content_blocks: contentBlocks,
      };

      console.log("Payload:", payload);

      await axiosInstance[method](apiUrl, payload);

      // Show success alert
      setAlertMessage("Content saved successfully!");
      setAlertType("success");
      setShowAlert(true);

      console.log("Page saved successfully");
    } catch (error) {
      console.error("Error saving page content:", error);

      // Show error alert
      setAlertMessage("Failed to save content. Please try again.");
      setAlertType("error");
      setShowAlert(true);
    }
  };

  // Callback for closing the alert
  const handleAlertClose = (isSuccess: boolean) => {
    setShowAlert(false);
    if (isSuccess) {
      console.log("Alert closed after success.");
    }
  };

  const handleNewPage = async () => {
    try {
      const response = await axiosInstance.post(
        `/pages/by_subtopic/${subtopicId}/`,
        {
          page_number: pages.length,
          content_blocks: [],
          subtopic: subtopicId,
        }
      );
  
      const newPage = response.data;
      setPages((prevPages) => [...prevPages, newPage]);
      setPageMapping((prevMapping) => ({
        ...prevMapping,
        [newPage.page_number]: newPage.page_id,
      }));
  
      setCurrentPage(newPage.page_number);
      setPageId(newPage.page_id);
      setIsNewPage(false);
  
      
      await fetchContentBlocks(newPage.page_id);

      // Show success alert
      setAlertMessage("New page added successfully!");
      setAlertType("success");
      setShowAlert(true);
  
      console.log("New page created and added to the state:", newPage);
    } catch (error) {
      console.error("Error creating a new page:", error);

      // Show error alert
      setAlertMessage("Failed to add new page. Please try again.");
      setAlertType("error");
      setShowAlert(true);
    }
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

  useEffect(() => {
    console.log("PageCount updated:", pages.length);
  }, [pages]);

  useEffect(() => {
    console.log("Current Page:", currentPage);
  }, [currentPage]);


  

  const handleBackToSyllabus = () => {
    setshowEditorContent(false);
  };

  const handleExamClick = () => {
    // props
  };

  const handleCancelBlock = () => {
    setShowBlockForm(false);
  };

  return (
    <div className="dashboard-background">
      {showAlert && (
        <AlertMessage
          message={alertMessage}
          type={alertType}
          onClose={handleAlertClose}
        />
      )}
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
            <button className="btnDets" onClick={handleBackToSyllabus}>
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
            <button className="btnDets4" onClick={() => handleCreateLessonBlock()}>
              Add Lesson Block
            </button>
          )}

          {showEditorContent && (
            <button className="btnDets3" onClick={handleCreateBlockClick}>
              Create New Block
            </button>
          )}

          {showEditorContent && (
          <button className="btnDets4" onClick={handleOpenObjectiveModal}>
            Add Learning Objectives
          </button>
          )}

          {showEditorContent && showObjectiveModal && (
            <LearningObjectiveModal
              closeModal={handleCloseObjectiveModal}
              onSave={handleSaveObjectives}
            />
          )}

          {showEditorContent && showBlockForm && (
            <div className="create-block-form">
              <h3 className="h-title">Select Block Type</h3>
              <div className="option-group">
                {["Example", "Case Study" ,"Practice"].map((type) => (
                  <div key={type} className="option">
                    <input
                      type="radio"
                      name="blockType"
                      value={type}
                      onChange={handleBlockTypeChange}
                    />
                    <label>{type}</label>
                  </div>
                ))}
              </div>

              <h3 className="diff-title">Learner Type</h3>
              <div className="option-group">
                {["Beginner", "Intermediate", "Advanced"].map((level) => (
                  <div key={level} className="option">
                    <input
                      type="radio"
                      name="difficulty"
                      value={level}
                      onChange={handleDifficultyChange}
                    />
                    <label className="input">{level}</label>
                  </div>
                ))}
              </div>

              <div className="form-buttons">
                <button className="btnDets2" onClick={handleConfirmBlock}>
                  Create Block
                </button>
                <button className="btnDets2" onClick={handleCancelBlock}>
                  Cancel
                </button>
              </div>
            </div>
          )}

          {showEditorContent && (
          <div className="filter-container-two">
            <div className="filter-groups-two">
              <div className="filter-options-two">
                <h4 className="block-type-label">Block Type</h4>
                <div className="filter-buttons-two">
                  <div
                    className={`filter-button-two ${
                      blockTypeFilter.size === 0 ? "selected" : ""
                    }`}
                    onClick={() => setBlockTypeFilter(new Set())}
                  >
                    All
                  </div>
                  {["Lesson", "Example", "Case Study", "Practice"].map((type) => (
                    <div
                      key={type}
                      className={`filter-button-two ${
                        blockTypeFilter.has(type.toLowerCase()) ? "selected" : ""
                      }`}
                      onClick={() => {
                        const newFilter = new Set(blockTypeFilter);
                        if (newFilter.has(type.toLowerCase())) {
                          newFilter.delete(type.toLowerCase());
                        } else {
                          newFilter.add(type.toLowerCase());
                        }
                        setBlockTypeFilter(newFilter);
                      }}
                    >
                      {type}
                    </div>
                  ))}
                </div>
              </div>

              <div className="filter-options-two">
                <h4 className="diff-label">Learner Type</h4>
                <div className="filter-buttons-two">
                  <div
                    className={`filter-button-two ${
                      difficultyFilter.size === 0 ? "selected" : ""
                    }`}
                    onClick={() => setDifficultyFilter(new Set())}
                  >
                    All
                  </div>
                  {["Beginner", "Intermediate", "Advanced", "None"].map((level) => (
                    <div
                      key={level}
                      className={`filter-button-two ${
                        difficultyFilter.has(level.toLowerCase()) ? "selected" : ""
                      }`}
                      onClick={() => {
                        const newFilter = new Set(difficultyFilter);
                        if (newFilter.has(level.toLowerCase())) {
                          newFilter.delete(level.toLowerCase());
                        } else {
                          newFilter.add(level.toLowerCase());
                        }
                        setDifficultyFilter(newFilter);
                      }}
                    >
                      {level}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          )}

          {showEditorContent && !isFetchingPages && (
            <div>
              {filteredContentBlocks.length > 0 ? (
                filteredContentBlocks.map((block, index) => (
                  <div className="content-blocks" key={index}>
                    <div className="block-type-label">{block.block_type}</div>
                    <div className="diff-label">{block.difficulty}</div>
                    <button
                      className="delete-block-btn"
                      onClick={() => handleDeleteBlock(Number(block.block_id))}
                      aria-label="Delete block"
                    >
                      -
                    </button>
                    <TipTapEditor
                      key={block.block_id}
                      content={block.content}
                      onChange={(updatedContent) =>
                        handleContentChange(block.block_id, updatedContent)
                      }
                    />
                  </div>
                ))
              ) : (
                <div>No content blocks match the filters. Please adjust your filters.</div>
              )}

            </div>
          )}



            {showEditorContent && pages.length > 0 && (
              <ReactPaginate
                pageCount={pages.length}
                previousLabel={currentPage > 0 ? "<" : ""}
                nextLabel={currentPage < pages.length - 1 ? ">" : ""}
                breakLabel={"..."}
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
