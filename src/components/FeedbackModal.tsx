import React, { useState } from "react";
import { saveFeedback } from "./saveFeedback";

interface FeedbackModalProps {
  onClose: () => void;
  userId: string;
  username: string;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({
  onClose,
  userId,
  username,
}) => {
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [submissionResult, setSubmissionResult] =
    useState<React.ReactNode | null>(null);
  const [errors, setErrors] = useState({ title: "", comment: "" });

  const availableTags = [
    "Bug",
    "Feature Request",
    "UI/UX",
    "Spill - Snake",
    "Annet",
  ];

  const handleTagChange = (tag: string) => {
    setSelectedTags((prevTags) =>
      prevTags.includes(tag)
        ? prevTags.filter((t) => t !== tag)
        : [...prevTags, tag],
    );
  };

  const validateForm = () => {
    const newErrors = {
      title: title.trim() === "" ? "Tittel er påkrevd" : "",
      comment: comment.trim() === "" ? "Kommentar er påkrevd" : "",
    };
    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error !== "");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const result = await saveFeedback(
      userId,
      username,
      title.trim(),
      comment.trim(),
      selectedTags,
    );
    if (result.success) {
      setSubmissionResult(
        <>
          <strong>Tilbakemelding sendt!</strong>
          <br />
          <span>Tittel: {title}</span>
          <br />
          <span>Kommentar: {comment}</span>
          <br />
          <span>Tags: {selectedTags.join(", ")}</span>
        </>,
      );
    } else {
      setSubmissionResult("Noe gikk galt, feedback ble ikke godt mottatt");
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
        {submissionResult ? (
          <div style={{ marginBottom: "20px", textAlign: "center" }}>
            <p>{submissionResult}</p>
            <button
              onClick={onClose}
              style={{
                marginTop: "10px",
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
              Lukk
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "15px" }}>
              <label
                className="text-md mb-1.5 block font-medium text-gray-900"
                htmlFor="feedback-title"
              >
                Tittel: <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "6px",
                  border: `1px solid ${errors.title ? "#ff4444" : "#ccc"}`,
                  boxSizing: "border-box",
                }}
                required
              />
              {errors.title && (
                <span style={{ color: "#ff4444", fontSize: "0.8rem" }}>
                  {errors.title}
                </span>
              )}
            </div>
            <div style={{ marginBottom: "15px" }}>
              <label
                className="text-md mb-1.5 block font-medium text-gray-900"
                htmlFor="feedback-comment"
              >
                Kommentar: <span className="text-red-500">*</span>
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                style={{
                  width: "100%",
                  height: "100px",
                  padding: "10px",
                  borderRadius: "6px",
                  border: `1px solid ${errors.comment ? "#ff4444" : "#ccc"}`,
                  boxSizing: "border-box",
                  resize: "vertical",
                }}
                required
              />
              {errors.comment && (
                <span style={{ color: "#ff4444", fontSize: "0.8rem" }}>
                  {errors.comment}
                </span>
              )}
            </div>
            <div style={{ marginBottom: "15px" }}>
              <label
                className="text-md mb-1.5 block font-medium text-gray-900"
                htmlFor="feedback-tags"
              >
                Tags:
              </label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                {availableTags.map((tag) => (
                  <label
                    key={tag}
                    style={{ display: "flex", alignItems: "center" }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedTags.includes(tag)}
                      onChange={() => handleTagChange(tag)}
                      style={{ marginRight: "5px" }}
                    />
                    {tag}
                  </label>
                ))}
              </div>
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
                Lukk
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
                Send inn
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default FeedbackModal;
