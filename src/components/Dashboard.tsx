import "../styles/testing.scss";

import React from "react";

function Dashboard() {
  return (
    <div className="dashboard-nav">
      <ul>
        <li className="nav-link">
          <a href="/">Home</a>
        </li>
        <li className="nav-link">
          <a href="/about">About</a>
        </li>
        <li className="nav-link">
          <a href="/contact">Contact</a>
        </li>
      </ul>
    </div>
  );
}

export default Dashboard;
