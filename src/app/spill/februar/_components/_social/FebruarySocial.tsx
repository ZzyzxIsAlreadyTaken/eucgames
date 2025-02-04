"use client";

import React, { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { type SocialComment } from "./types";
import { getLatestComments } from "./getLatestComments";
import { addComment } from "./addComment";
import { toggleLike } from "./likeComment";

const FebruarySocial: React.FC = () => {
  const [comments, setComments] = useState<SocialComment[]>([]);
  const [newComment, setNewComment] = useState<string>("");
  const [likingInProgress, setLikingInProgress] = useState<Set<number>>(
    new Set(),
  );
  const { user } = useUser();

  const fetchComments = async () => {
    try {
      const latestComments = await getLatestComments(user?.id);
      setComments(latestComments);
    } catch (error) {
      console.error(
        "Error fetching comments:",
        error instanceof Error ? error.message : String(error),
      );
    }
  };

  useEffect(() => {
    void fetchComments();
  }, [user?.id]);

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
        console.error(
          "Error adding comment:",
          error instanceof Error ? error.message : String(error),
        );
      }
    }
  };

  const handleLike = async (commentId: number, currentlyLiked: boolean) => {
    if (!user || likingInProgress.has(commentId)) return;

    try {
      setLikingInProgress((prev) => new Set([...prev, commentId]));
      const { liked } = await toggleLike(commentId, user.id);

      setComments((prevComments) =>
        prevComments.map((comment) =>
          comment.id === commentId
            ? {
                ...comment,
                likes: comment.likes + (liked ? 1 : -1),
                hasLiked: liked,
              }
            : comment,
        ),
      );
    } catch (error) {
      console.error(
        "Error toggling like:",
        error instanceof Error ? error.message : String(error),
      );
    } finally {
      setLikingInProgress((prev) => {
        const newSet = new Set(prev);
        newSet.delete(commentId);
        return newSet;
      });
    }
  };

  return (
    <div className="comments-section mx-5 mx-auto mt-4 rounded-lg bg-white/10 p-4 shadow-md sm:min-w-[800px]">
      <h3 className="mb-4 text-xl font-bold text-white">Siste kommentarer</h3>
      <ul className="space-y-4">
        {comments.map((comment) => (
          <li key={comment.id} className="rounded-md bg-white/5 p-3">
            <div className="flex items-center justify-between">
              <strong className="text-purple-500">{comment.username}</strong>
              <small className="text-gray-500">
                {new Date(comment.createdAt).toLocaleString()}
              </small>
            </div>
            <p className="mt-2 italic text-gray-400">{comment.comment}</p>
            {comment.isEdited && (
              <small className="text-xs text-gray-500">(Redigert)</small>
            )}
            <div className="mt-2 flex items-center gap-2 text-sm text-gray-400">
              <button
                onClick={() => void handleLike(comment.id, comment.hasLiked)}
                disabled={likingInProgress.has(comment.id) || !user}
                className={`flex items-center gap-1 rounded px-2 py-1 transition ${
                  comment.hasLiked
                    ? "text-purple-400 hover:text-purple-300"
                    : "hover:text-white"
                } ${
                  likingInProgress.has(comment.id) ? "animate-pulse" : ""
                } disabled:opacity-50`}
                title={user ? undefined : "Logg inn for å like"}
              >
                <span className="text-lg">
                  {comment.hasLiked ? "❤️" : "🤍"}
                </span>
                <span>{comment.likes}</span>
              </button>
            </div>
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

export default FebruarySocial;
