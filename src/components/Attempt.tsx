import React, { useEffect, useState } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import '../styles/card-leaderboard.scss';
import axiosInstance from '../axiosInstance';

interface MockTestResult {
  mocktestID: number;
  score: number;
  start_time: Date;
  end_time: Date;
  total_questions: number;
  mocktest: number;
  student: string;
}

const Attempt: React.FC<{ studentId: string; showTimeTaken?: boolean }> = ({
  studentId,
  showTimeTaken = false,
}) => {
  const [mocktestData, setMocktestData] = useState<MockTestResult[]>([]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await axiosInstance.get(
          `/studentMocktestAttempt/?student_id=${studentId}`
        );
        const data = response.data;
        data.forEach((entry: MockTestResult) => {
          entry.start_time = new Date(entry.start_time);
          entry.end_time = new Date(entry.end_time);
        });
        console.log('Attempts data:', data);
        setMocktestData(data);
      } catch (error) {
        console.error('Error fetching leaderboard data:', error);
        setMocktestData([]);
      }
    };

    fetchLeaderboard();
  }, [studentId]);

  return (
    <div className={`leaderboard-container ${showTimeTaken ? 'larger' : ''}`}>
      <h2>ATTEMPTS</h2>
      <TableContainer component={Paper} className="table-container">
        <Table aria-label="leaderboard table">
          <TableHead>
            <TableRow>
              <TableCell className="table-header">Date</TableCell>
              <TableCell align="left" className="table-header">
                Score
              </TableCell>
              {showTimeTaken && (
                <TableCell align="left" className="table-header">
                  Time Taken
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {mocktestData.length > 0 ? (
              mocktestData.map((entry) => (
                <TableRow key={entry.mocktestID}>
                  <TableCell className="table-body">
                    {entry.start_time.getUTCMonth() + 1}/
                    {entry.start_time.getUTCDate()}/
                    {entry.start_time.getUTCFullYear()}
                  </TableCell>
                  <TableCell align="left" className="table-body">
                    {entry.score} / {entry.total_questions}
                  </TableCell>
                  {showTimeTaken && (
                    <TableCell align="left" className="table-body">
                      {Math.floor((entry.end_time.getTime() - entry.start_time.getTime()) / 60000)} minutes
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={showTimeTaken ? 4 : 3}
                  className="table-body"
                  align="center"
                >
                  No mocktest attempt yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default Attempt;
