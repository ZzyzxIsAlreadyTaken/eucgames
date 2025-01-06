"use client";

import React, { useEffect, useState } from "react";
import { getLatestComments } from "./getLatestComments";
import { getUserHighScore } from "./getUserHighScore";
import { useUser } from "@clerk/nextjs";
import { addComment } from "./addComment";

interface Comment {
  id: number;
  username: string;
  comment: string;
  createdAt: Date;
}

const SnakeSocial: React.FC = () => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [userHighScore, setUserHighScore] = useState<number | null>(null);
  const [newComment, setNewComment] = useState<string>("");
  const { user } = useUser();

  const fetchComments = async () => {
    try {
      const latestComments = await getLatestComments();
      setComments(latestComments || []);
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  useEffect(() => {
    void fetchComments();
    const fetchUserHighScore = async () => {
      if (user) {
        const { score } = await getUserHighScore(user.id);
        setUserHighScore(score);
      }
    };
    void fetchUserHighScore();
  }, [user]);

  const handleAddComment = async () => {
    if (user && newComment.trim()) {
      try {
        const username = user.username ?? "Anonymous";
        await addComment(user.id, username, newComment);
        setNewComment("");
        void fetchComments();
      } catch (error) {
        console.error("Error adding comment:", error);
      }
    }
  };

  return (
    <div className="comments-section">
      <h3>Latest Comments</h3>
      <ul>
        {comments.map((comment) => (
          <li key={comment.id}>
            <strong>
              {comment.username} - {userHighScore ?? "No score yet"}
            </strong>
            : {comment.comment}
            <br />
            <small>{new Date(comment.createdAt).toLocaleString()}</small>
          </li>
        ))}
      </ul>
      {user && (
        <div className="add-comment">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
          />
          <button onClick={handleAddComment}>Submit</button>
        </div>
      )}
    </div>
  );
};

export default SnakeSocial;
