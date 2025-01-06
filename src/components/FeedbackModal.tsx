import React, { useState } from "react";
import { saveFeedback } from "./saveFeedback";

interface FeedbackModalProps {
  onClose: () => void;
  userId: string;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({ onClose, userId }) => {
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await saveFeedback(userId, title, comment);
    if (result.success) {
      alert("Feedback submitted successfully!");
      onClose();
    } else {
      alert("Failed to submit feedback.");
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: "0",
        left: "0",
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          padding: "30px",
          borderRadius: "12px",
          width: "400px",
          maxWidth: "90%",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
        }}
      >
        <h2
          style={{
            marginBottom: "20px",
            fontSize: "1.5rem",
            textAlign: "center",
          }}
        >
          Tilbakemelding
        </h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "15px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "5px",
                fontWeight: "bold",
              }}
            >
              Tittel:
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "6px",
                border: "1px solid #ccc",
                boxSizing: "border-box",
              }}
            />
          </div>
          <div style={{ marginBottom: "15px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "5px",
                fontWeight: "bold",
              }}
            >
              Kommentar:
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              style={{
                width: "100%",
                height: "100px",
                padding: "10px",
                borderRadius: "6px",
                border: "1px solid #ccc",
                boxSizing: "border-box",
                resize: "vertical",
              }}
            />
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                marginRight: "10px",
                padding: "10px 20px",
                borderRadius: "6px",
                border: "none",
                backgroundColor: "#f0f0f0",
                cursor: "pointer",
                transition: "background-color 0.3s",
              }}
              onMouseOver={(e) =>
                (e.currentTarget.style.backgroundColor = "#e0e0e0")
              }
              onMouseOut={(e) =>
                (e.currentTarget.style.backgroundColor = "#f0f0f0")
              }
            >
              Close
            </button>
            <button
              type="submit"
              style={{
                padding: "10px 20px",
                borderRadius: "6px",
                border: "none",
                backgroundColor: "#CC65FF",
                color: "white",
                cursor: "pointer",
                transition: "background-color 0.3s",
              }}
              onMouseOver={(e) =>
                (e.currentTarget.style.backgroundColor = "#b055e0")
              }
              onMouseOut={(e) =>
                (e.currentTarget.style.backgroundColor = "#CC65FF")
              }
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FeedbackModal;
