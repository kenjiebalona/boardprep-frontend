import React, { useEffect, useState } from "react";
import { Doughnut, Chart } from "react-chartjs-2";
import { Plugin, ChartData, ChartDataset } from "chart.js";
import {
  Chart as ChartJS,
  Title,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
  LineController,
  BarController,
} from "chart.js";
import axiosInstance from "../axiosInstance";
import "../styles/studentperformancemodal.scss";

ChartJS.register(
  Title,
  BarElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
  LineController,
  BarController
);

interface Student {
  user_name: string;
  password: string;
  first_name: string;
  last_name: string;
  email: string;
  registration_date: string;
  last_login: string;
  specialization: number;
  specialization_name: string;
  institution_id: number;
  subscription: number;
}

interface StudentPerformance {
  mocktestScoreID: number;
  mocktest_id: number;
  student: string;
  score: number;
  mocktestDateTaken: string;
  totalQuestions: number;
  studentName: string;
  easy_count: number;
  medium_count: number;
  hard_count: number;
  easy_correct: number;
  medium_correct: number;
  hard_correct: number;
  subjects_count: number;
  feedback: string;
  subjects: string;
  subjects_correct: string;
  mocktestName: string;
  mocktestDescription: string;
}

interface StudentPerformanceModalProps {
  classId: number;
  student: Student;
  closeModal: () => void;
}

function StudentPerformanceModal({
  classId,
  student,
  closeModal,
}: StudentPerformanceModalProps) {
  const [studentPerformance, setStudentPerformance] =
    useState<StudentPerformance>();

  useEffect(() => {
    const fetchStudentPerformance = async () => {
      try {
        const response = await axiosInstance.get(
          `/scores/?student_id=${student.user_name}&class_id=${classId}`
        );
        setStudentPerformance(response.data[0]);
      } catch (err) {
        console.error(err);
      }
    };

    fetchStudentPerformance();
  }, [classId, student.user_name]);

  const parseSubjects = (subjects: string | null) => {
    if (subjects === null) return {};

    const subjectsArray = subjects.split(",");
    const subjectsObject: { [key: string]: number } = {};

    for (const subject of subjectsArray) {
      const [subjectName, count] = subject.split(":");
      subjectsObject[subjectName] = parseInt(count);
    }

    return subjectsObject;
  };

  const handleCloseClick = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    closeModal();
  };

  const scoreData = {
    datasets: [
      {
        data: studentPerformance && [
          studentPerformance.score,
          studentPerformance.totalQuestions - studentPerformance.score,
        ],
        backgroundColor: ["rgba(182, 80, 244, 1)", "#626b77"],
        borderColor: ["rgba(182, 80, 244, 1)", "#626b77"],
        cutout: "85%",
      },
    ],
  };

  const scoreOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: false,
      },
    },
  };

  const centerTextPlugin = {
    id: "centerText",
    afterDatasetsDraw(chart: any) {
      const ctx = chart.ctx;
      const width = chart.width;
      const height = chart.height;

      ctx.save();
      ctx.font = `${20}px sans-serif`;
      ctx.textAlign = "center";
      ctx.fillStyle = "white";

      const score = studentPerformance?.score;
      const totalQuestions = studentPerformance?.totalQuestions;

      const textX = width / 2;
      const textY = height / 2;

      if (score !== undefined && totalQuestions !== undefined) {
        const fractionSize = 20;
        const offset = fractionSize / 2;

        ctx.font = `${fractionSize}px sans-serif`;
        ctx.fillText(`${score}`, textX, textY - offset);
        ctx.fillRect(textX - 30, textY, 60, 1);
        ctx.fillText(`${totalQuestions}`, textX, textY + offset + fractionSize);
      }
    },
  };

  const plugins: Plugin<"doughnut">[] = [centerTextPlugin];

  const difficultyData: ChartData<
    "bar" | "line",
    (number | undefined)[],
    string
  > = {
    labels: ["Easy", "Medium", "Hard"],
    datasets: [
      {
        type: "line",
        label: "Number of Questions By Difficulty",
        data: [
          studentPerformance?.easy_count,
          studentPerformance?.medium_count,
          studentPerformance?.hard_count,
        ],
        backgroundColor: "rgba(255, 99, 132, 0.2)",
        borderColor: "rgba(255, 99, 132, 1)",
        borderWidth: 1,
        fill: false,
      } as ChartDataset<"line", number[]>,
      {
        type: "bar",
        label: "Number of Correct Answers By Difficulty",
        data: [
          studentPerformance?.easy_correct,
          studentPerformance?.medium_correct,
          studentPerformance?.hard_correct,
        ],
        backgroundColor: "rgba(54, 162, 235, 0.2)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 1,
      } as ChartDataset<"bar", number[]>,
    ],
  };

  const difficultyOptions = {
    type: "bar",
    scales: {
      x: {
        stacked: true,
        ticks: {
          color: "white",
        },
        grid: {
          color: "rgba(255, 255, 255, 0.1)",
        },
      },
      y: {
        stacked: true,
        ticks: {
          color: "white",
        },
        grid: {
          color: "rgba(255, 255, 255, 0.1)",
        },
      },
    },
    plugins: {
      legend: {
        labels: {
          color: "white",
        },
      },
    },
  };

  let subjects: { [key: string]: number } = {};
  let subjectsCorrect: { [key: string]: number } = {};

  if (studentPerformance) {
    subjects = parseSubjects(studentPerformance.subjects);
    subjectsCorrect = parseSubjects(studentPerformance.subjects_correct);
  }

  const subjectLabels = Object.keys(subjects);

  const subjectData: ChartData<"bar" | "line", number[], string> = {
    labels: subjectLabels,
    datasets: [
      {
        type: "line",
        label: "Number of Questions Per Subject",
        data: subjectLabels.map((subject) => subjects[subject]),
        backgroundColor: "rgba(255, 99, 132, 0.2)",
        borderColor: "rgba(255, 99, 132, 1)",
        borderWidth: 1,
        fill: false,
      } as ChartDataset<"line", number[]>,
      {
        type: "bar",
        label: "Number of Correct Answers Per Subject",
        data: subjectLabels.map((subject) =>
          subjectsCorrect[subject] ? subjectsCorrect[subject] : 0
        ),
        backgroundColor: "rgba(54, 162, 235, 0.2)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 1,
      } as ChartDataset<"bar", number[]>,
    ],
  };

  const subjectOptions = {
    type: "bar",
    scales: {
      x: {
        stacked: true,
        ticks: {
          color: "white",
        },
        grid: {
          color: "rgba(255, 255, 255, 0.1)",
        },
      },
      y: {
        stacked: true,
        ticks: {
          color: "white",
        },
        grid: {
          color: "rgba(255, 255, 255, 0.1)",
        },
      },
    },
    plugins: {
      legend: {
        labels: {
          color: "white",
        },
      },
    },
  };

  return (
    <div id="modal" className="modal">
      <div className="activity-modal">
        <div className="modal-header">
          <div className="h1">Performance Review</div>
          <span className="close" onClick={handleCloseClick}>
            &times;
          </span>
        </div>
        {studentPerformance ? (
          <div className="dashboard">
            <div className="left">
              <div className="group group1">
                <div style={{ width: "100px", height: "100px" }}>
                  <Doughnut
                    data={scoreData}
                    options={scoreOptions}
                    plugins={plugins}
                  />
                </div>
                <div className="group1__data">
                  <span>Test Name: {studentPerformance.mocktestName}</span>
                  <span>Student: {studentPerformance.studentName}</span>
                  <span>Course: {student.specialization_name}</span>
                  <span>
                    Date Taken: {studentPerformance.mocktestDateTaken}
                  </span>
                </div>
              </div>
              <div className="group group2">
                <div style={{ width: "500px", height: "250px" }}>
                  <Chart
                    type="bar"
                    data={difficultyData}
                    options={difficultyOptions}
                  />
                </div>
                <div style={{ width: "500px", height: "250px" }}>
                  <Chart
                    type="bar"
                    data={subjectData}
                    options={subjectOptions}
                  />
                </div>
              </div>
            </div>
            <div className="group group3">
              <h2 className="title">Preppy's Feedback</h2>
              <br />
              <div className="feedback">
                {studentPerformance.feedback.split("\n").map((line, index) => (
                  <span key={index}>
                    {line}
                    <br />
                  </span>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="h1">No performance data available.</div>
        )}
      </div>
    </div>
  );
}

export default StudentPerformanceModal;
