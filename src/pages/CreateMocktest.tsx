import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from "react-router-dom";
import axios from 'axios';
import axiosInstance from '../axiosInstance';
import '../styles/createmocktest.scss';

interface Mocktest {
    mocktestID: number;
    mocktestName: string;
    mocktestDescription: string;
    course: string;
    classID: string;
}

interface Question {
    id: number;
    question: string;
    choiceA: string;
    choiceB: string;
    choiceC: string;
    choiceD: string;
    correctAnswer: string;
    subject: string;
    difficulty: number;
    mocktest: number;
}

interface Course {
    course_id: string;
    course_title: string;
    hasMocktest: boolean;
}

interface Difficulty {
    id: number;
    name: string;
}

const CreateMockTestPage = () => {
    const [mocktestID, setMocktestID] = useState<number>(0);
    const [mockTestName, setMockTestName] = useState<string>('');
    const [mockTestDescription, setMockTestDescription] = useState<string>('');
    const [hasMocktest, setHasMocktest] = useState<boolean | null>(null);
    const [questions, setQuestions] = useState([{ id: 0, question: '', choiceA: '', choiceB: '', choiceC: '', choiceD: '', correctAnswer: '', subject: '', difficulty: 0}]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [difficulties, setDifficulties] = useState<Difficulty[]>([]);
    const [selectedCourse, setSelectedCourse] = useState<string>('');
    const [fetchedMockTest, setFetchedMockTest] = useState<Mocktest | null>(null);
    const [isViewMode, setIsViewMode] = useState(false);
    const { courseId, classID } = useParams<{ courseId: string, classID: string }>();
    const navigate = useNavigate();

    const handleAddQuestion = () => {
        setQuestions([...questions, { id: 0, question: '', choiceA: '', choiceB: '', choiceC: '', choiceD: '', correctAnswer: '', subject: '', difficulty: 0}]);
    };

    const handleQuestionChange = (index: number, field: string, value: string | number) => {
        const newQuestions = [...questions];
        if (field === 'difficulty') {
            const numValue = typeof value === 'string' ? parseInt(value, 10) : value;
            newQuestions[index] = { ...newQuestions[index], [field]: numValue || 0 };
        } else {
            newQuestions[index] = { ...newQuestions[index], [field]: value };
        }
        setQuestions(newQuestions);
    };

    useEffect(() => {
        const fetchMocktestData = async () => {
            if(!courseId) return;

            try {
                const mocktestResponse = await axiosInstance.get(`/mocktest/`);
                const mocktestData: Mocktest[] = mocktestResponse.data;
                console.log('Fetched Mock Test Data:', mocktestData);
                const currentMocktest = mocktestData.find((test: Mocktest) => test.course === courseId);
                if (currentMocktest) {
                    setMocktestID(currentMocktest.mocktestID);
                    setMockTestName(currentMocktest.mocktestName);
                    setMockTestDescription(currentMocktest.mocktestDescription);
                    setSelectedCourse(currentMocktest.course);
                    setHasMocktest(true);
                } else {
                    setHasMocktest(false);
                }
            } catch (error) {
                console.error('Error fetching mock test data: ', error);
                setHasMocktest(false);
            }
        };

        fetchMocktestData();
    }, [courseId]);

    useEffect(() => {
        const fetchQuestionsData = async () => {
            if (!mocktestID) return;

            try {
                const questionsResponse = await axiosInstance.get(`/questions/`);
                const questionsData: Question[] = questionsResponse.data;
                console.log('Fetched Questions Data:', questionsData);
                const relatedQuestions = questionsData.filter(q => q.mocktest === mocktestID);
                setQuestions(relatedQuestions.map(q => ({
                    id: q.id,
                    question: q.question,
                    choiceA: q.choiceA,
                    choiceB: q.choiceB,
                    choiceC: q.choiceC,
                    choiceD: q.choiceD,
                    correctAnswer: q.correctAnswer,
                    subject: q.subject,
                    difficulty: q.difficulty,
                    mocktest: q.mocktest
                })));
            } catch (error) {
                console.error('Error fetching questions data:', error);
            }
        };

        fetchQuestionsData();
    }, [mocktestID]);


    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const coursesResponse = await axiosInstance.get(`/courses/`);
                console.log('Courses: ', coursesResponse.data);
                const availableCourses = coursesResponse.data.filter((course: Course) => !course.hasMocktest);
                setCourses(availableCourses);
                console.log('hasMocktest: ', availableCourses);
                if (courseId) {
                    setSelectedCourse(courseId);
                }
            } catch (error) {
                console.error('Error fetching data: ', error);
            }
        };

        const fetchDifficulties = async () => {
            try {
                const difficultyResponse = await axiosInstance.get(`/difficulty/`);
                setDifficulties(difficultyResponse.data);
            } catch (error) {
                console.error('Error fetching difficulties:', error);
            }
        };

        fetchCourses();
        fetchDifficulties();
    }, [courseId]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const mocktestUrl = '/mocktest/';
        const questionUrl = '/questions/';

        try {
            const existingQuestions = questions.filter(q => q.id !== 0);
            const newQuestions = questions.filter(q => q.id === 0);

            if (!hasMocktest) {
                 const updatedQuestions = questions.map(question => {
                    const questionData: any = { ...question };
                    if (question.id) {
                        questionData.id = question.id;
                    }
                    return questionData;
                });

                const response = await axiosInstance.post(mocktestUrl, {
                    mocktestName: mockTestName,
                    mocktestDescription: mockTestDescription,
                    course: selectedCourse,
                    questions: updatedQuestions
                });

                const mocktest = response.data.mocktestID;

                for (let question of questions) {
                    console.log("Questions before sending:", questions);
                    console.log({...question, mocktest });
                    await axiosInstance.post(questionUrl, {
                        ...question,
                        mocktest: mocktest,
                    });
                }
            } else {
                await axiosInstance.put(`/mocktest/update_by_course/${courseId}/`, {
                    mocktestName: mockTestName,
                    mocktestDescription: mockTestDescription,
                    course: selectedCourse,
                    questions: existingQuestions
                });

                for (let question of newQuestions) {
                    await axiosInstance.post(questionUrl, {
                        ...question,
                        mocktest: mocktestID,
                    });
                }
            }
            console.log('Mock test created:', hasMocktest ? 'edited' : 'created');
            navigate(`/courses/${courseId}/edit`);
        } catch (error) {
            console.error('Error creating mock test:', error);
        }

        setMockTestName('');
        setMockTestDescription('');
        setQuestions([{ id: 0, question: '', choiceA: '', choiceB: '', choiceC: '', choiceD: '', correctAnswer: '', subject: '', difficulty: 0}]);

        if(hasMocktest) {
            alert("Mock test edited successfully.");
        } else {
            alert("Mock test created successfully.");
        }
    };

    const handleViewMockTest = async () => {
        const response = await axiosInstance.get(`/mocktest/${classID}`);
        setFetchedMockTest(response.data);
        setIsViewMode(true);
    };

    const handleDeleteMockTest = async () => {
        if (!courseId) {
            console.error("No course ID found for deletion.");
            return;
        }

        try {
            await axiosInstance.delete(`/mocktest/delete_by_course/${courseId}/`);
            console.log("Mock test deleted successfully");
            navigate(`/courses/${courseId}/edit`);

            setMockTestName('');
            setMockTestDescription('');
            setQuestions([{ id: 0, question: '', choiceA: '', choiceB: '', choiceC: '', choiceD: '', correctAnswer: '', subject: '', difficulty: 0}]);
            alert("Mock test deleted successfully.");
        } catch (error) {
            console.error('Error deleting mock test:', error);
            alert("Failed to delete mock test. Please try again.");
        }
    };

    return (
        <div className="create-mocktest-page">
            <h1>{hasMocktest ? 'Edit' : 'Create'} a Mock Test for {courseId}</h1>
            <form onSubmit={handleSubmit}>
                {hasMocktest ? (
                    <>
                        <div className="mocktest-container">
                            <input type="text" placeholder="Mock Test Name" value={mockTestName} onChange={(e) => setMockTestName(e.target.value)} required />
                            <textarea placeholder="Mock Test Description" value={mockTestDescription} onChange={(e) => setMockTestDescription(e.target.value)} required />
                        </div>
                        <div className="questions-container">
                            {questions.map((question, index) => (
                                <div key={index}>
                                    <textarea placeholder="Question" value={question.question} onChange={(e) => handleQuestionChange(index, 'question', e.target.value)} required />
                                    <input type="text" placeholder="Choice A" value={question.choiceA} onChange={(e) => handleQuestionChange(index, 'choiceA', e.target.value)} required />
                                    <input type="text" placeholder="Choice B" value={question.choiceB} onChange={(e) => handleQuestionChange(index, 'choiceB', e.target.value)} required />
                                    <input type="text" placeholder="Choice C" value={question.choiceC} onChange={(e) => handleQuestionChange(index, 'choiceC', e.target.value)} required />
                                    <input type="text" placeholder="Choice D" value={question.choiceD} onChange={(e) => handleQuestionChange(index, 'choiceD', e.target.value)} required />
                                    <input type="text" placeholder="Correct Answer" value={question.correctAnswer} onChange={(e) => handleQuestionChange(index, 'correctAnswer', e.target.value)} required />
                                    <input type="text" placeholder="Subject" value={question.subject} onChange={(e) => handleQuestionChange(index, 'subject', e.target.value)} required />
                                    <select
                                        value={question.difficulty}
                                        onChange={(e) => handleQuestionChange(index, 'difficulty', e.target.value)}
                                    >
                                        <option value="">Select Difficulty</option>
                                        {difficulties.map(difficulty => (
                                            <option key={difficulty.id} value={difficulty.id}>
                                                {difficulty.name}
                                            </option>
                                        ))}
                                    </select>
                                    <hr className="border"></hr>
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <>
                        <div className="mocktest-container">
                            <input type="text" placeholder="Mock Test Name" value={mockTestName} onChange={(e) => setMockTestName(e.target.value)} required />
                            <textarea placeholder="Mock Test Description" value={mockTestDescription} onChange={(e) => setMockTestDescription(e.target.value)} required />
                            <select value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)}>
                                <option value="">Select Course</option>
                                {courses.map((course) => (
                                    <option key={course.course_id} value={course.course_id}>{course.course_title}</option>
                                ))}
                            </select>
                        </div>
                        <div className="questions-container">
                            {questions.map((question, index) => (
                                <div key={index}>
                                    <textarea placeholder="Question" value={question.question} onChange={(e) => handleQuestionChange(index, 'question', e.target.value)} required />
                                    <input type="text" placeholder="Choice A" value={question.choiceA} onChange={(e) => handleQuestionChange(index, 'choiceA', e.target.value)} required />
                                    <input type="text" placeholder="Choice B" value={question.choiceB} onChange={(e) => handleQuestionChange(index, 'choiceB', e.target.value)} required />
                                    <input type="text" placeholder="Choice C" value={question.choiceC} onChange={(e) => handleQuestionChange(index, 'choiceC', e.target.value)} required />
                                    <input type="text" placeholder="Choice D" value={question.choiceD} onChange={(e) => handleQuestionChange(index, 'choiceD', e.target.value)} required />
                                    <input type="text" placeholder="Correct Answer" value={question.correctAnswer} onChange={(e) => handleQuestionChange(index, 'correctAnswer', e.target.value)} required />
                                    <input type="text" placeholder="Subject" value={question.subject} onChange={(e) => handleQuestionChange(index, 'subject', e.target.value)} required />
                                    <select
                                        value={question.difficulty}
                                        onChange={(e) => handleQuestionChange(index, 'difficulty', e.target.value)}
                                    >
                                        <option value="">Select Difficulty</option>
                                        {difficulties.map(difficulty => (
                                            <option key={difficulty.id} value={difficulty.id}>
                                                {difficulty.name}
                                            </option>
                                        ))}
                                    </select>
                                    <hr className="border"></hr>
                                </div>
                            ))}
                        </div>
                    </>
                )}
                <div className="buttons-container">
                    {hasMocktest && (
                        <button type="button" onClick={handleDeleteMockTest} className="delete-mocktest">Delete Mock Test</button>
                    )}
                    <button type="button" className="add-question" onClick={handleAddQuestion}>Add Question</button>
                    {hasMocktest ? (
                        <button type="submit" className="create-mocktest">Edit Mock Test</button>
                    ) : (
                        <button type="submit" className="create-mocktest">Create Mock Test</button>
                    )}
                </div>
            </form>
        </div>
    );
};

export default CreateMockTestPage;