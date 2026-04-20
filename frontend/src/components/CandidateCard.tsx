import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Star } from "lucide-react";
import { Candidate } from "@/data/mockData";

interface CandidateCardProps {
  candidate: Candidate;
  rank?: number;
}

const CandidateCard = ({ candidate, rank }: CandidateCardProps) => {
  const statusColors: Record<string, string> = {
    pending: "bg-muted text-muted-foreground",
    reviewed: "bg-info/10 text-info",
    shortlisted: "bg-success/10 text-success",
    rejected: "bg-destructive/10 text-destructive",
  };

  const scoreColor = candidate.aiScore >= 0.8 ? "text-success" : candidate.aiScore >= 0.6 ? "text-warning" : "text-destructive";

  return (
    <Card className="p-5 hover:shadow-md transition-all duration-200 border border-border">
      <div className="flex items-start gap-4">
        {rank && (
          <div className="w-8 h-8 rounded-full gradient-hero flex items-center justify-center text-primary-foreground text-sm font-bold shrink-0">
            {rank}
          </div>
        )}
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-display font-bold shrink-0">
          {candidate.name.split(" ").map(n => n[0]).join("")}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h4 className="font-display font-semibold text-foreground truncate">{candidate.name}</h4>
            <div className="flex items-center gap-1 ml-2">
              <Star className={`w-4 h-4 ${scoreColor} fill-current`} />
              <span className={`text-sm font-bold ${scoreColor}`}>{Math.round(candidate.aiScore * 100)}%</span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">{candidate.title}</p>
          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{candidate.location}</span>
            <span>{candidate.experience} yrs exp</span>
          </div>
          <div className="flex flex-wrap gap-1 mt-3">
            {candidate.skills.slice(0, 3).map(skill => (
              <Badge key={skill} variant="secondary" className="text-xs">{skill}</Badge>
            ))}
          </div>
          <div className="flex items-center justify-between mt-3">
            <Badge className={`text-xs ${statusColors[candidate.status]}`}>{candidate.status}</Badge>
            <div className="flex gap-2">
              <Button size="sm" variant="ghost" className="text-xs">Profile</Button>
              <Button size="sm" className="text-xs">Shortlist</Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default CandidateCard;
