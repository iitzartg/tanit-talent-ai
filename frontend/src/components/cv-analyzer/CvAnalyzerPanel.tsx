import { useCallback, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CvFileDropzone } from "./CvFileDropzone";
import { CvPromptInput } from "./CvPromptInput";
import { CvAnalysisResults } from "./CvAnalysisResults";
import {
  analyzeCVs,
  type CvAnalysisResult,
  type CvUploadItem,
} from "@/lib/cvAnalyzer";

function makeCvItems(files: File[]): CvUploadItem[] {
  return files.map((file, index) => ({
    id: `${Date.now()}-${index}-${Math.random().toString(36).slice(2, 11)}`,
    file,
    name: file.name,
  }));
}

export function CvAnalyzerPanel() {
  const [cvs, setCvs] = useState<CvUploadItem[]>([]);
  const [prompt, setPrompt] = useState("");
  const [results, setResults] = useState<CvAnalysisResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFilesSelected = useCallback((files: File[]) => {
    setCvs(makeCvItems(files));
    setResults(null);
    setError("");
  }, []);

  const handleAnalyze = async () => {
    if (!prompt.trim()) {
      setError("Please enter screening criteria.");
      return;
    }
    if (cvs.length === 0) {
      setError("Please upload at least one CV.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const analysisResults = await analyzeCVs(cvs, prompt);
      setResults(analysisResults);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(`Analysis failed: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <div className="space-y-6">
          <CvFileDropzone
            onFilesSelected={handleFilesSelected}
            cvCount={cvs.length}
          />
          <CvPromptInput
            prompt={prompt}
            onPromptChange={setPrompt}
            onAnalyze={handleAnalyze}
            loading={loading}
            cvCount={cvs.length}
          />
          {error && (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>
        <CvAnalysisResults results={results} loading={loading} />
      </div>
    </div>
  );
}
