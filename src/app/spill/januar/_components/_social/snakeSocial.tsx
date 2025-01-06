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
        const username =
          user.username ??
          (user.firstName && user.lastName
            ? `${user.firstName} ${user.lastName}`
            : (user.emailAddresses[0]?.emailAddress ?? "Anonymous"));

        await addComment(user.id, username, newComment);
        setNewComment("");
        void fetchComments();
      } catch (error) {
        console.error("Error adding comment:", error);
      }
    }
  };

  return (
    <div className="comments-section mx-5 mx-auto mt-4 rounded-lg bg-white/10 p-4 shadow-md sm:min-w-[800px]">
      <h3 className="mb-4 text-xl font-bold text-white">Siste kommentarer</h3>
      <ul className="space-y-4">
        {comments.map((comment) => (
          <li key={comment.id} className="rounded-md bg-white/5 p-3">
            <strong className="block text-purple-500">
              {comment.username}
            </strong>{" "}
            <span className="text-xs text-gray-300">
              Nåværende topp score: {userHighScore ?? "Har ikke score enda"}
            </span>
            <p className="ml-1 italic text-gray-400">{comment.comment}</p>
            <small className="text-gray-500">
              {new Date(comment.createdAt).toLocaleString()}
            </small>
          </li>
        ))}
      </ul>
      {user && (
        <div className="add-comment mt-4">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Legg inn en kommentar..."
            className="w-full rounded-md border border-gray-600 bg-gray-800 p-2 text-white focus:border-purple-500 focus:outline-none"
          />
          <button
            onClick={handleAddComment}
            className="mt-2 w-full rounded-md bg-purple-500 py-2 text-white transition hover:bg-purple-600"
          >
            Send inn
          </button>
        </div>
      )}
    </div>
  );
};

export default SnakeSocial;
