import { useEffect, useState } from "react";

interface Features {
  length: number;
  wordCount: number;
  avgWordLength: number;
}

interface CouncilMember {
  name: string;
  aiLikely: boolean;
  confidence: string; // "0-100%" string
  explanation?: string;
}

interface ResultPanelProps {
  aiLikely: boolean;
  confidence: string;
  features: Features;
  explanation?: string; // council consensus summary
  councilMembers?: CouncilMember[];
}

const ResultPanel: React.FC<ResultPanelProps> = ({
  aiLikely,
  confidence,
  features,
  explanation,
  councilMembers: propCouncilMembers,
}) => {
  const [fillWidth, setFillWidth] = useState(0);
  const [councilMembers, setCouncilMembers] = useState<CouncilMember[]>([]);
  const [councilSummary, setCouncilSummary] = useState<string>("");

  // Animate overall confidence bar
  useEffect(() => {
    const num = parseFloat(confidence) || 0;
    setTimeout(() => setFillWidth(num), 100);
  }, [confidence]);

  // Set council summary and members
  useEffect(() => {
    if (explanation) {
      // Extract summary (everything before "Council reasoning —")
      const [summary] = explanation.split("Council reasoning —");
      setCouncilSummary(summary.trim());
    }

    // Use structured councilMembers from props if available
    if (propCouncilMembers && propCouncilMembers.length > 0) {
      setCouncilMembers(propCouncilMembers);
    }
  }, [explanation, propCouncilMembers]);

  const renderProbabilityBar = (prob: number | string) => {
    const num = typeof prob === "string" ? parseFloat(prob) : prob;
    return (
      <div className="probability-bar-container">
        <div
          className="probability-bar-fill"
          style={{ width: `${num || 0}%` }}
        >
          <span className="confidence-percentage">{num?.toFixed(1)}%</span>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Main Analysis Results */}
      <div className="result-panel">
        <div className="result-panel-header">Analysis Results</div>
        <div className={`stat ${aiLikely ? "ai-likely-yes" : "ai-likely-no"}`}>
          {aiLikely ? "Likely AI" : "Likely Human"}
        </div>

        <div className="stat font-semibold mt-2">Confidence Meter</div>
        {renderProbabilityBar(fillWidth)}

        <div className="stat mt-2">Text Length: {features.length}</div>
        <div className="stat">Word Count: {features.wordCount}</div>
        <div className="stat">
          Average Word Length: {features.avgWordLength.toFixed(2)}
        </div>

        {councilSummary && (
          <p className="explanation mt-3">{councilSummary}</p>
        )}
      </div>

      {/* Council Members */}
      {councilMembers.length > 0 && (
        <div className="flex flex-wrap gap-4 justify-center">
          {councilMembers.map((member, idx) => {
            const memberConfidence = parseFloat(member.confidence) || 0;
            return (
              <div key={idx} className="result-panel w-80">
                <div className={`stat ${member.aiLikely ? "ai-likely-yes" : "ai-likely-no"}`}>
                  {member.name}'s Opinion: {member.aiLikely ? "Likely AI" : "Likely Human"}
                </div>

                <div className="stat font-semibold mt-1">Confidence Meter</div>
                <div className="probability-bar-container">
                  <div
                    className="probability-bar-fill"
                    style={{ width: `${memberConfidence}%` }}
                  >
                    <span className="confidence-percentage">{memberConfidence.toFixed(1)}%</span>
                  </div>
                </div>

                {member.explanation && (
                  <p className="explanation mt-2">{member.explanation}</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ResultPanel;
