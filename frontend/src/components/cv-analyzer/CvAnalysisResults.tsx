import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, Loader2 } from "lucide-react";
import type { CvAnalysisResult } from "@/lib/cvAnalyzer";
import { CvScoreCard } from "./CvScoreCard";

interface CvAnalysisResultsProps {
  results: CvAnalysisResult[] | null;
  loading: boolean;
}

export function CvAnalysisResults({
  results,
  loading,
}: CvAnalysisResultsProps) {
  if (loading) {
    return (
      <Card className="lg:sticky lg:top-24">
        <CardContent className="flex flex-col items-center justify-center min-h-[320px] py-12">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-foreground font-medium">
            Analyzing CVs...
          </p>
          <p className="text-sm text-muted-foreground mt-1 text-center">
            AI is evaluating each CV based on your criteria
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!results || results.length === 0) {
    return (
      <Card className="lg:sticky lg:top-24">
        <CardContent className="flex flex-col items-center justify-center min-h-[320px] py-12 text-center">
          <FileText className="h-16 w-16 text-muted-foreground/40 mb-4" />
          <h3 className="font-display font-semibold text-foreground mb-1">
            No results yet
          </h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            Upload CVs and add your criteria to start the analysis
          </p>
        </CardContent>
      </Card>
    );
  }

  const averageScore =
    results.reduce((sum, cv) => sum + cv.score, 0) / results.length;
  const bestCandidate = results[0];

  return (
    <Card className="lg:sticky lg:top-24">
      <CardHeader className="border-b pb-4">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <CardTitle className="font-display text-lg">Results</CardTitle>
          <Badge variant="secondary">{results.length} CVs analyzed</Badge>
        </div>
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3">
            <p className="text-xs text-muted-foreground mb-1">Average score</p>
            <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">
              {Math.round(averageScore)}%
            </p>
          </div>
          <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-3">
            <p className="text-xs text-muted-foreground mb-1">Best score</p>
            <p className="text-2xl font-bold text-amber-700 dark:text-amber-400">
              {bestCandidate?.score ?? 0}%
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <ScrollArea className="h-[min(600px,55vh)] pr-3">
          <div className="space-y-4">
            {results.map((cv, index) => (
              <CvScoreCard key={cv.id} cv={cv} rank={index + 1} />
            ))}
          </div>
        </ScrollArea>
        <Button
          type="button"
          variant="secondary"
          className="w-full mt-4"
          onClick={() => window.print()}
        >
          Export results (print)
        </Button>
      </CardContent>
    </Card>
  );
}
