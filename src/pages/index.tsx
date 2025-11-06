import { useState } from "react";
import InputBox from "../components/inputBox";
import SubmitButton from "../components/submitButton";
import ResultPanel from "../components/resultPanel";

interface Features {
  length: number;
  wordCount: number;
  avgWordLength: number;
}

interface CouncilMember {
  name: string;
  aiLikely: boolean;
  confidence: string;
  explanation?: string;
}

interface DetectionResponse {
  aiLikely: boolean;
  confidence: string;
  features: Features;
  explanation?: string;
  councilMembers?: CouncilMember[];
}

export default function Home() {
  const [text, setText] = useState("");
  const [result, setResult] = useState<DetectionResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!text.trim()) {
      setError("Please enter some text to analyze.");
      return;
    }

    setError(null);
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Unknown error");
      }

      const data: DetectionResponse = await res.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-panel-bg px-4 py-12">
      <div className="main-container">
        <h1>Project Zenith</h1>
        <p>AI Content Detection & Analysis</p>

        <InputBox value={text} onChange={setText} />

        {error && <p className="text-error">{error}</p>}

        <SubmitButton onClick={handleAnalyze} loading={loading} label="Run Detection" />

        {result && (
          <ResultPanel
            aiLikely={result.aiLikely}
            confidence={result.confidence}
            features={result.features}
            explanation={result.explanation}
            councilMembers={result.councilMembers}
          />
        )}
      </div>
    </div>
  );
}