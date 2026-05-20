import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Star, Loader2 } from "lucide-react";
import { Candidate } from "@/data/mockData";
import { ApiApplication } from "@/lib/api";
import { useState } from "react";

interface CandidateCardProps {
  candidate?: Candidate;
  application?: ApiApplication;
  rank?: number;
  onShortlist?: (applicationId: string) => Promise<void>;
  onViewCV?: (applicationId: string) => void;
  isShortlisting?: boolean;
}

const CandidateCard = ({
  candidate,
  application,
  rank,
  onShortlist,
  onViewCV,
  isShortlisting,
}: CandidateCardProps) => {
  const [localShortlisting, setLocalShortlisting] = useState(false);

  const statusColors: Record<string, string> = {
    pending: "bg-muted text-muted-foreground",
    reviewed: "bg-blue-100 text-blue-700",
    shortlisted: "bg-green-100 text-green-700",
    rejected: "bg-destructive/10 text-destructive",
  };

  // Support both mock and real data
  const displayCandidate = application?.candidate || candidate;
  const displayProfile = application?.profile;
  const displayStatus = application?.status || candidate?.status || "pending";
  const displayScore = application?.aiScore ?? candidate?.aiScore ?? 0;
  const displayName = displayCandidate?.name || candidate?.name || "Unknown";
  const displayEmail = displayCandidate?.email || candidate?.email;
  const displaySkills = displayProfile?.skills || candidate?.skills || [];
  const isShortlisted = application?.isShortlisted || false;

  const scoreColor =
    displayScore >= 0.8
      ? "text-success"
      : displayScore >= 0.6
        ? "text-warning"
        : "text-destructive";

  const handleShortlist = async () => {
    if (!application || !onShortlist) return;
    setLocalShortlisting(true);
    try {
      await onShortlist(application.id);
    } finally {
      setLocalShortlisting(false);
    }
  };

  const handleViewCV = () => {
    if (application && onViewCV) {
      onViewCV(application.id);
    }
  };

  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <Card className="p-5 hover:shadow-md transition-all duration-200 border border-border">
      <div className="flex items-start gap-4">
        {rank && (
          <div className="w-8 h-8 rounded-full gradient-hero flex items-center justify-center text-primary-foreground text-sm font-bold shrink-0">
            {rank}
          </div>
        )}
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-display font-bold shrink-0">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-display font-semibold text-foreground truncate">
                {displayName}
              </h4>
              {displayEmail && (
                <p className="text-xs text-muted-foreground truncate">
                  {displayEmail}
                </p>
              )}
            </div>
            <div className="flex items-center gap-1 ml-2 shrink-0">
              <Star className={`w-4 h-4 ${scoreColor} fill-current`} />
              <span className={`text-sm font-bold ${scoreColor}`}>
                {Math.round(displayScore * 100)}%
              </span>
            </div>
          </div>

          {displayProfile?.bio && (
            <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
              {displayProfile.bio}
            </p>
          )}

          {displaySkills.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {displaySkills.slice(0, 3).map((skill) => (
                <Badge key={skill} variant="secondary" className="text-xs">
                  {skill}
                </Badge>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between mt-3">
            <Badge className={`text-xs ${statusColors[displayStatus]}`}>
              {displayStatus}
            </Badge>
            <div className="flex gap-2">
              {application && onViewCV && (
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs"
                  onClick={handleViewCV}
                >
                  View CV
                </Button>
              )}
              {application && onShortlist && (
                <Button
                  size="sm"
                  variant={isShortlisted ? "secondary" : "default"}
                  className="text-xs"
                  onClick={handleShortlist}
                  disabled={localShortlisting || isShortlisting}
                >
                  {localShortlisting || isShortlisting ? (
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  ) : null}
                  {isShortlisted ? "★ Shortlisted" : "☆ Shortlist"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default CandidateCard;
