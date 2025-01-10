"use client";

import React, { useState } from "react";
import { FaCommentDots } from "react-icons/fa";
import { useUser } from "@clerk/nextjs";
import FeedbackModal from "./FeedbackModal";

const FeedbackBadge: React.FC = () => {
  const { user } = useUser();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // Only show the badge if the user is logged in
  if (!user) return null;

  const username =
    user.username ??
    (user.firstName && user.lastName
      ? `${user.firstName} ${user.lastName}`
      : user.emailAddresses[0]?.emailAddress);
  return (
    <div>
      <button
        onClick={handleOpenModal}
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          backgroundColor: "#CC65FF",
          color: "white",
          borderRadius: "50%",
          width: "50px",
          height: "50px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
        }}
      >
        <FaCommentDots size={24} />
      </button>
      {isModalOpen && (
        <FeedbackModal
          onClose={handleCloseModal}
          userId={user.id}
          username={username ?? "Ukjent bruker"}
        />
      )}
    </div>
  );
};

export default FeedbackBadge;
