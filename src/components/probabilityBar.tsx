import React from "react";

interface ProbabilityBarProps {
  probability: number; // 0-100
}

const ProbabilityBar: React.FC<ProbabilityBarProps> = ({ probability }) => {
  return (
    <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
      <div
        className="h-full bg-green-500"
        style={{ width: `${probability}%` }}
      />
    </div>
  );
};

export default ProbabilityBar;