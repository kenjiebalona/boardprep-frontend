// Searchbar.js
import React from "react";
import "../styles/searchbar.scss"; // Make sure this path is correct

interface SearchbarProps {
  onSearch: (query: string) => void;
}

function Searchbar({ onSearch }: SearchbarProps) {
  return (
    <div className="inputBox_container">
      <svg
        className="search_icon"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
      >
        <circle cx="11" cy="11" r="8" />
        <line x1="21" x2="16.65" y1="21" y2="16.65" />
      </svg>
      <input
        className="inputBox"
        type="text"
        placeholder="Search for courses"
        onChange={(e) => onSearch(e.target.value)}
      />
    </div>
  );
}

export default Searchbar;
