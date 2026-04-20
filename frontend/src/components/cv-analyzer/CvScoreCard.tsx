import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { CvAnalysisResult } from "@/lib/cvAnalyzer";

interface CvScoreCardProps {
  cv: CvAnalysisResult;
  rank: number;
}

function scoreStyles(score: number) {
  if (score >= 80)
    return {
      badge: "bg-emerald-100 text-emerald-900 border-emerald-200",
      icon: "🏆",
    };
  if (score >= 60)
    return {
      badge: "bg-amber-100 text-amber-900 border-amber-200",
      icon: "⭐",
    };
  if (score >= 40)
    return {
      badge: "bg-orange-100 text-orange-900 border-orange-200",
      icon: "⚠️",
    };
  return { badge: "bg-red-100 text-red-900 border-red-200", icon: "❌" };
}

function rankLabel(rank: number) {
  if (rank === 1) return "🥇";
  if (rank === 2) return "🥈";
  if (rank === 3) return "🥉";
  return String(rank);
}

export function CvScoreCard({ cv, rank }: CvScoreCardProps) {
  const [expanded, setExpanded] = useState(false);
  const styles = scoreStyles(cv.score);

  return (
    <Card
      className={`p-4 border transition-shadow hover:shadow-md ${cv.error ? "border-destructive/40" : ""}`}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${styles.badge}`}
          >
            {rankLabel(rank)}
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-foreground truncate">
              {cv.name}
            </h3>
            <p className="text-xs text-muted-foreground font-mono">
              {cv.id.slice(0, 12)}
            </p>
          </div>
        </div>
        <Badge variant="outline" className={`shrink-0 gap-1 ${styles.badge}`}>
          <span>{styles.icon}</span>
          <span>{cv.score}%</span>
        </Badge>
      </div>

      {cv.error ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          {cv.justification}
        </div>
      ) : (
        <>
          <div className="mb-3">
            <p
              className={`text-sm text-muted-foreground whitespace-pre-wrap ${!expanded ? "line-clamp-3" : ""}`}
            >
              {cv.justification}
            </p>
            <Button
              variant="link"
              size="sm"
              className="h-auto p-0 mt-1 text-xs"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? "▲ Voir moins" : "▼ Voir plus"}
            </Button>
          </div>

          {cv.matchedCriteria && cv.matchedCriteria.length > 0 && (
            <div className="mb-3">
              <p className="text-xs font-semibold text-emerald-700 mb-2">
                ✅ Points forts ({cv.matchedCriteria.length})
              </p>
              <div className="flex flex-wrap gap-1.5">
                {cv.matchedCriteria.map((criteria, idx) => (
                  <Badge
                    key={idx}
                    variant="secondary"
                    className="text-xs font-normal bg-emerald-50 text-emerald-800 border-emerald-200"
                  >
                    {criteria}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {cv.missingCriteria && cv.missingCriteria.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-red-700 mb-2">
                ⚠️ Points d&apos;amélioration ({cv.missingCriteria.length})
              </p>
              <div className="flex flex-wrap gap-1.5">
                {cv.missingCriteria.map((criteria, idx) => (
                  <Badge
                    key={idx}
                    variant="secondary"
                    className="text-xs font-normal bg-red-50 text-red-800 border-red-200"
                  >
                    {criteria}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </Card>
  );
}
