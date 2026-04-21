import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, Users, Briefcase } from "lucide-react";
import { Job } from "@/data/mockData";
import { Link } from "react-router-dom";
import { getStoredUser } from "@/lib/auth";

interface JobCardProps {
  job: Job;
  showApply?: boolean;
  onApply?: (jobId: string) => void;
  applyDisabled?: boolean;
  applyLabel?: string;
}

const JobCard = ({
  job,
  showApply = true,
  onApply,
  applyDisabled = false,
  applyLabel,
}: JobCardProps) => {
  const user = getStoredUser();
  const ctaHref = !user
    ? "/auth"
    : user.role === "admin"
      ? "/admin"
      : user.role === "recruteur"
        ? "/recruiter"
        : "/candidate";
  const ctaLabel =
    applyLabel || (user?.role === "candidat" || !user ? "Apply" : "Go to Dashboard");

  const typeColors: Record<string, string> = {
    "Full-time": "bg-success/10 text-success border-success/20",
    "Part-time": "bg-info/10 text-info border-info/20",
    "Contract": "bg-warning/10 text-warning border-warning/20",
    "Remote": "bg-primary/10 text-primary border-primary/20",
  };

  return (
    <Card className="p-6 hover:shadow-lg transition-all duration-300 border border-border hover:border-primary/30 group">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-display font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
            {job.title}
          </h3>
          <p className="text-muted-foreground text-sm mt-1">{job.company}</p>
        </div>
        <Badge variant="outline" className={typeColors[job.type]}>
          {job.type}
        </Badge>
      </div>

      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{job.description}</p>

      <div className="flex flex-wrap gap-2 mb-4">
        {job.requirements.slice(0, 4).map((req) => (
          <Badge key={req} variant="secondary" className="text-xs font-normal">
            {req}
          </Badge>
        ))}
        {job.requirements.length > 4 && (
          <Badge variant="secondary" className="text-xs font-normal">+{job.requirements.length - 4}</Badge>
        )}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-border">
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{job.location}</span>
          <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" />{job.salary}</span>
          <span className="flex items-center gap-1"><Users className="w-3 h-3" />{job.applicants}</span>
        </div>
        {showApply && (
          onApply ? (
            <Button size="sm" onClick={() => onApply(job.id)} disabled={applyDisabled}>
              {ctaLabel}
            </Button>
          ) : (
            <Link to={ctaHref}>
              <Button size="sm">{ctaLabel}</Button>
            </Link>
          )
        )}
      </div>
    </Card>
  );
};

export default JobCard;
