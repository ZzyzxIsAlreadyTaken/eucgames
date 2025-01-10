"use client";

import React, { useState } from "react";
import "./feedbackTable.css";

interface FeedbackItem {
  id: number;
  title: string;
  comment: string;
  createdAt: string;
  tags: string[];
  username: string;
}

interface FeedbackTableProps {
  feedback: FeedbackItem[];
}

const FeedbackTable: React.FC<FeedbackTableProps> = ({ feedback }) => {
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: string;
  } | null>(null);

  const sortedFeedback = [...feedback].sort((a, b) => {
    if (sortConfig !== null) {
      const key = sortConfig.key as keyof FeedbackItem;
      if (a[key] < b[key]) {
        return sortConfig.direction === "ascending" ? -1 : 1;
      }
      if (a[key] > b[key]) {
        return sortConfig.direction === "ascending" ? 1 : -1;
      }
    }
    return 0;
  });

  const requestSort = (key: string) => {
    let direction = "ascending";
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "ascending"
    ) {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  return (
    <div className="feedback-table-container">
      <table className="feedback-table">
        <thead>
          <tr>
            <th onClick={() => requestSort("id")}>ID</th>
            <th onClick={() => requestSort("title")}>Tittel</th>
            <th onClick={() => requestSort("comment")}>Kommentar</th>
            <th onClick={() => requestSort("createdAt")}>Lagt til</th>
            <th onClick={() => requestSort("username")}>Bruker</th>
            <th>Tags</th>
          </tr>
        </thead>
        <tbody>
          {sortedFeedback.map((item) => (
            <tr key={item.id}>
              <td>{item.id}</td>
              <td>{item.title}</td>
              <td>{item.comment}</td>
              <td>{item.createdAt}</td>
              <td>{item.username}</td>
              <td>
                {item.tags && item.tags.length > 0 ? (
                  item.tags.map((tag, index) => (
                    <span key={index} className="tag">
                      {tag}
                    </span>
                  ))
                ) : (
                  <span className="no-tags">No tags</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default FeedbackTable;
