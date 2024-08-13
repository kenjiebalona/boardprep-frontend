import React, { useEffect, useState } from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import "../styles/card-leaderboard.scss";

interface LeaderboardEntry {
  ranking: number;
  student_id: string;
  score: number;
  time_taken?: string; 
}

const CardLeaderboard: React.FC<{ studentId: string; showTimeTaken?: boolean }> = ({ studentId, showTimeTaken = false }) => {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [studentData, setStudentData] = useState<LeaderboardEntry | null>(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:8000/challenges/leaderboards/?student_id=${studentId}`);
        const data = await response.json();
        setLeaderboardData(data.leaderboard);
        setStudentData(data.student || null);
      } catch (error) {
        console.error("Error fetching leaderboard data:", error);
      }
    };

    fetchLeaderboard();
  }, [studentId]);

  return (
    <div className={`leaderboard-container ${showTimeTaken ? 'larger' : ''}`}>
      <h2>LEADERBOARD</h2>
      <TableContainer component={Paper} className="table-container">
        <Table aria-label="leaderboard table">
          <TableHead>
            <TableRow>
              <TableCell className="table-header">Rank</TableCell>
              <TableCell className="table-header">Username</TableCell>
              <TableCell align="left" className="table-header">Score</TableCell>
              {showTimeTaken && <TableCell align="left" className="table-header">Time Taken</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {leaderboardData.map((entry) => (
              <TableRow key={entry.student_id}>
                <TableCell className="table-body">{entry.ranking}</TableCell>
                <TableCell className="table-body">{entry.student_id}</TableCell>
                <TableCell align="left" className="table-body">{entry.score}</TableCell>
                {showTimeTaken && <TableCell align="left" className="table-body">{entry.time_taken}</TableCell>}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default CardLeaderboard;
