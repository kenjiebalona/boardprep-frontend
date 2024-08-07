import * as React from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import "../styles/card-leaderboard.scss";

interface Data {
  name: string;
  trackingId: number;
  date: string;
  status: string;
}

function createData(name: string, trackingId: number, date: string, status: string): Data { 
  return { name, trackingId, date, status };
}

const rows: Data[] = [
  createData("Lasania Chiken Fri", 18908424, "2 March 2022", "Approved"),
  createData("Big Baza Bang ", 18908424, "2 March 2022", "Pending"),
  createData("Mouth Freshner", 18908424, "2 March 2022", "Approved"),
];

const CardLeaderboard: React.FC = () => {
  return (
    <div className="leaderboard-container">
      <h3>LEADERBOARD</h3>
      <TableContainer
        component={Paper}
        className="table-container"
      >
        <Table aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell className="table-header">Username</TableCell>
              <TableCell align="left" className="table-header">Points</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow
                key={row.name}
                className="table-row"
              >
                <TableCell component="th" scope="row">
                  {row.name}
                </TableCell>
                <TableCell component="th" align="left">{row.trackingId}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}

export default CardLeaderboard;
