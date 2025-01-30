import React from "react";

interface ActivityCardProps {
  title: string;
  value: number | string;
  className?: string;
}

function ActivityCard({ title, value, className }: ActivityCardProps) {
  return (
    <div className={`rounded-lg bg-white p-6 shadow ${className ?? ""}`}>
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>

      <p className="mt-2 text-3xl font-semibold text-gray-900">{value}</p>
    </div>
  );
}

export default ActivityCard;
