import React from "react";

interface InputBoxProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const InputBox: React.FC<InputBoxProps> = ({ value, onChange, placeholder }) => {
  return (
    <div className="flex justify-center w-full">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || "Paste your text here..."}
        className="w-full max-w-[600px] p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-accent"
        rows={6}
      />
    </div>
  );
};

export default InputBox;