import { useEffect, useState } from "react";
import {
  api,
  type ApiApplication,
  type AuthUser,
  type ApiProfile,
} from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, X } from "lucide-react";

interface CVViewerProps {
  applicationId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function CVViewer({ applicationId, isOpen, onClose }: CVViewerProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cvData, setCvData] = useState<{
    cvText: string;
    candidate: AuthUser;
    profile: ApiProfile | null;
    application: ApiApplication;
  } | null>(null);

  useEffect(() => {
    if (!isOpen || !applicationId) return;

    const fetchCV = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await api.getCandidateCV(applicationId);
        setCvData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load CV");
      } finally {
        setLoading(false);
      }
    };

    fetchCV();
  }, [isOpen, applicationId]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Candidate CV</DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="rounded-lg bg-destructive/10 p-4 text-sm text-destructive">
              {error}
            </div>
          ) : cvData ? (
            <>
              <div className="space-y-3 border-b pb-4">
                <div>
                  <h3 className="font-semibold text-lg">
                    {cvData.candidate.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {cvData.candidate.email}
                  </p>
                </div>
                {cvData.profile && (
                  <div>
                    {cvData.profile.bio && (
                      <div className="mb-2">
                        <p className="text-sm font-medium">Bio</p>
                        <p className="text-sm text-muted-foreground">
                          {cvData.profile.bio}
                        </p>
                      </div>
                    )}
                    {cvData.profile.skills &&
                      cvData.profile.skills.length > 0 && (
                        <div>
                          <p className="text-sm font-medium mb-1">Skills</p>
                          <div className="flex flex-wrap gap-2">
                            {cvData.profile.skills.map((skill) => (
                              <span
                                key={skill}
                                className="inline-block bg-secondary text-secondary-foreground px-2 py-1 rounded text-xs"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold">CV Content</h4>
                <div className="bg-muted p-4 rounded-lg max-h-[400px] overflow-y-auto whitespace-pre-wrap text-sm text-foreground leading-relaxed">
                  {cvData.cvText}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm border-t pt-4">
                <div>
                  <p className="text-xs text-muted-foreground">Match Score</p>
                  <p className="font-semibold text-lg">
                    {(cvData.application.aiScore * 100).toFixed(1)}%
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    Application Status
                  </p>
                  <p className="font-semibold capitalize">
                    {cvData.application.status}
                  </p>
                </div>
              </div>
            </>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
