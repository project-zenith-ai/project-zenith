import { useEffect, useState } from "react";

interface ResultPanelProps {
  aiLikely: boolean;
  confidence: string; // e.g., "87%"
  features: {
    length: number;
    wordCount: number;
    avgWordLength: number;
  };
  explanation?: string;
}

const ResultPanel: React.FC<ResultPanelProps> = ({ aiLikely, confidence, features, explanation }) => {
  const confidenceNum = parseFloat(confidence) || 0;

  const [fillWidth, setFillWidth] = useState(0);

  useEffect(() => {
    // Trigger the fill animation after component mounts
    const timer = setTimeout(() => setFillWidth(confidenceNum), 100);
    return () => clearTimeout(timer);
  }, [confidenceNum]);

  return (
    <div className="result-panel">
      <div className="result-panel-header">Analysis Results</div>

      <div className={`stat ${aiLikely ? "ai-likely-yes" : "ai-likely-no"}`}>
        AI Likely: <strong>{aiLikely ? "Yes" : "No"}</strong>
      </div>

      <div className="stat confidence">
        <span className="confidence-label">Confidence:</span>
        <div className="probability-bar-container">
          <div
            className="probability-bar-fill"
            style={{ width: `${fillWidth}%` }}
          >
            <span className="confidence-percentage">{confidence}</span>
          </div>
        </div>
      </div>

      <div className="stat">
        Text Length: <span className="stat-number">{features.length}</span> characters
      </div>

      <div className="stat">
        Word Count: <span className="stat-number">{features.wordCount}</span>
      </div>

      <div className="stat">
        Average Word Length: <span className="stat-number">{features.avgWordLength.toFixed(2)}</span>
      </div>

      {explanation && <p className="explanation">{explanation}</p>}
    </div>
  );
};

export default ResultPanel;