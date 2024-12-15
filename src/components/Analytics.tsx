import React from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import '../styles/analytics.scss';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

// Register the required chart components for Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Define the types for the props
interface PerformanceTrends {
  strong_learning_objectives: string[];
  weak_learning_objectives: string[];
  hardest_difficulty: [string, number] | null;
  easiest_difficulty: [string, number] | null;
}

interface TimeSpent {
  total_time: number;
  average_time_per_question: number;
}

interface DifficultyAnalysis {
  correct: Record<number, number>;
  wrong: Record<number, number>;
}

interface AnalyticsProps {
  analytics: {
    total_questions: number;
    correct_answers: number;
    wrong_answers: number;
    score_percentage: number;
    time_spent: TimeSpent;
    difficulty_analysis: DifficultyAnalysis;
    performance_trends: PerformanceTrends;
  };
}

const Analytics: React.FC<AnalyticsProps> = ({analytics}) => {
  // Data for the bar chart (score percentage)
  const scorePercentageData = {
    labels: ['Score Percentage'],
    datasets: [
      {
        label: 'Score Percentage',
        data: [analytics.score_percentage],
        backgroundColor: ['rgba(75, 192, 192, 0.6)'],
        borderColor: ['rgba(75, 192, 192, 1)'],
        borderWidth: 1,
      },
    ],
  };

  const timeSpentData = {
    labels: ['Total Time (seconds)', 'Avg. Time per Question (seconds)'],
    datasets: [
      {
        label: 'Time Spent',
        data: [analytics.time_spent.total_time, analytics.time_spent.average_time_per_question],
        backgroundColor: ['rgba(54, 162, 235, 0.6)', 'rgba(153, 102, 255, 0.6)'],
        borderColor: ['rgba(54, 162, 235, 1)', 'rgba(153, 102, 255, 1)'],
        borderWidth: 1,
      },
    ],
  };

  // Data for the pie chart (performance trends)
  const performanceTrendsData = {
    labels: ['Strong Learning Objectives', 'Weak Learning Objectives'],
    datasets: [
      {
        data: [
          analytics.performance_trends.strong_learning_objectives.length,
          analytics.performance_trends.weak_learning_objectives.length,
        ],
        backgroundColor: ['rgba(75, 192, 192, 0.6)', 'rgba(255, 99, 132, 0.6)'],
        borderColor: ['rgba(75, 192, 192, 1)', 'rgba(255, 99, 132, 1)'],
        borderWidth: 1,
      },
    ],
  };

  const difficultyLabelsMap: Record<number, string> = {
    1: 'Easy',
    2: 'Advanced',
    3: 'Expert',
  };


  // Convert numerical keys to strings for the difficulty analysis
  const difficultyLabels = Array.from(
    new Set([
      ...Object.keys(analytics.difficulty_analysis.correct),
      ...Object.keys(analytics.difficulty_analysis.wrong),
    ])
  ).map(Number);

  const descriptiveLabels = difficultyLabels.map((key) => difficultyLabelsMap[key] || `Level ${key}`);
  const difficultyCorrectData = difficultyLabels.map((key) => analytics.difficulty_analysis.correct[key] || 0);
  const difficultyWrongData = difficultyLabels.map((key) => analytics.difficulty_analysis.wrong[key] || 0);

  const difficultyData = {
    labels: descriptiveLabels, // Convert numeric keys to strings
    datasets: [
      {
        label: 'Correct Answers',
        data: difficultyCorrectData,
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
      {
        label: 'Wrong Answers',
        data: difficultyWrongData,
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="analytics-container">
      <div className="analytics-section">

        {/* <div className="analytics-item">
          <strong>Total Questions:</strong> {analytics.total_questions}
        </div>
        <div className="analytics-item">
          <strong>Correct Answers:</strong> {analytics.correct_answers}
        </div>
        <div className="analytics-item">
          <strong>Wrong Answers:</strong> {analytics.wrong_answers}
        </div> */}
        <div className="analytics-item">
          <strong>Score Percentage:</strong> {analytics.score_percentage}%
        </div>

        <div className="analytics-item">
          {/* <strong>Performance Trends:</strong> */}
          <div>
            <strong>Strong Learning Objectives:</strong>
            <ul>
              {analytics.performance_trends.strong_learning_objectives.length > 0 ? (
                analytics.performance_trends.strong_learning_objectives.map((objective, index) => (
                  <li key={index}>{objective}</li>
                ))
              ) : (
                <p>No strong learning objectives identified.</p>
              )}
            </ul>
          </div>
          <div>
            <strong>Weak Learning Objectives:</strong>
            <ul>
              {analytics.performance_trends.weak_learning_objectives.length > 0 ? (
                analytics.performance_trends.weak_learning_objectives.map((objective, index) => (
                  <li key={index}>{objective}</li>
                ))
              ) : (
                <p>No weak learning objectives identified.</p>
              )}
            </ul>
          </div>
        </div>

        {/* Bar chart for score percentage */}
        <div className="chart-container">
          <h4>Score Percentage</h4>
          <Bar data={scorePercentageData} options={{ responsive: true }} />
        </div>

        {/* Pie chart for performance trends */}
        <div className="chart-container">
          <h4>Performance Trends</h4>
          <Pie data={performanceTrendsData} options={{ responsive: true }} />
        </div>

        {/* Bar chart for time spent */}
        <div className="chart-container">
          <h4>Time Spent</h4>
          <Bar data={timeSpentData} options={{ responsive: true, maintainAspectRatio: false }} />
        </div>

        {/* Bar chart for difficulty analysis */}
        <div className="chart-container">
          <h4>Difficulty Analysis</h4>
          <Bar data={difficultyData} options={{ responsive: true, maintainAspectRatio: false }} />
        </div>
      </div>
    </div>
  );
};

export default Analytics;
