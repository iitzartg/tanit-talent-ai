import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";

interface CvPromptInputProps {
  prompt: string;
  onPromptChange: (value: string) => void;
  onAnalyze: () => void;
  loading: boolean;
  cvCount: number;
}

const examples = [
  "Looking for a React developer with at least 3 years of experience, strong TypeScript and Node.js skills.",
  "Need a project manager with agile delivery experience and PMP certification.",
  "Looking for a data scientist with machine learning expertise, Python, and at least 2 years of experience.",
  "Hiring a B2B sales profile with 5 years of tech-sector experience and fluent English.",
];

export function CvPromptInput({
  prompt,
  onPromptChange,
  onAnalyze,
  loading,
  cvCount,
}: CvPromptInputProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-display text-lg">Search Criteria</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium text-foreground">
            Describe the target profile:
          </label>
          <Textarea
            value={prompt}
            onChange={(e) => onPromptChange(e.target.value)}
            placeholder="Example: Looking for a React developer with at least 3 years of experience..."
            className="mt-2 min-h-[160px] resize-none"
          />
        </div>

        <div>
          <p className="text-xs text-muted-foreground mb-2">
            Example criteria:
          </p>
          <div className="flex flex-wrap gap-2">
            {examples.map((example, index) => (
              <Button
                key={index}
                type="button"
                variant="secondary"
                size="sm"
                className="h-auto py-1.5 px-3 text-xs font-normal text-left whitespace-normal max-w-full"
                onClick={() => onPromptChange(example)}
              >
                {example.slice(0, 48)}...
              </Button>
            ))}
          </div>
        </div>

        <Button
          type="button"
          className="w-full"
          disabled={loading || cvCount === 0 || !prompt.trim()}
          onClick={onAnalyze}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Running analysis...
            </>
          ) : (
            `Analyze ${cvCount} CV${cvCount > 1 ? "s" : ""}`
          )}
        </Button>

        {cvCount === 0 && (
          <p className="text-xs text-amber-700 dark:text-amber-500 text-center">
            Please upload CVs first.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
