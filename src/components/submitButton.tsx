import React from "react";

interface SubmitButtonProps {
  onClick: () => void;
  loading?: boolean;
  label?: string;
}

const SubmitButton: React.FC<SubmitButtonProps> = ({ onClick, loading, label }) => {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 flex items-center justify-center gap-2"
    >
      {loading && <span className="loader-border loader-border-white"></span>}
      {label || "Analyze Content"}
    </button>
  );
};

export default SubmitButton;