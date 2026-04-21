import { useEffect, useState, type ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import StatCard from "@/components/StatCard";
import JobCard from "@/components/JobCard";
import { Brain, FileText, Briefcase, Star, LogOut, Search, Bell } from "lucide-react";
import type { Job } from "@/data/mockData";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useAppSignOut } from "@/hooks/useAppSignOut";
import { extractCVText } from "@/lib/cvAnalyzer";

const statusColors: Record<string, string> = {
  pending: "bg-muted text-muted-foreground",
  reviewed: "bg-info/10 text-info",
  shortlisted: "bg-success/10 text-success",
  rejected: "bg-destructive/10 text-destructive",
};

const CandidateDashboard = () => {
  const { toast } = useToast();
  const signOutApp = useAppSignOut();
  const [name, setName] = useState("Candidate");
  const [bio, setBio] = useState("");
  const [skillsText, setSkillsText] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<
    Array<{
      id: string;
      jobId: string;
      jobTitle: string;
      company: string;
      appliedAt: string;
      status: "pending" | "reviewed" | "shortlisted" | "rejected";
      aiScore: number;
    }>
  >([]);
  const [applyingJobId, setApplyingJobId] = useState<string | null>(null);
  const [pendingApplyJobId, setPendingApplyJobId] = useState<string | null>(null);
  const [isApplyDialogOpen, setIsApplyDialogOpen] = useState(false);
  const [selectedCvFile, setSelectedCvFile] = useState<File | null>(null);

  const loadData = async () => {
    const [me, jobsResult, applicationsResult] = await Promise.all([
      api.getMe(),
      api.getJobs(),
      api.getMyApplications(),
    ]);
    setName(me.user.name || "Candidate");
    setBio(me.profile?.bio || "");
    setSkillsText((me.profile?.skills || []).join(", "));
    setJobs(
      jobsResult.jobs.map((job) => ({
        id: job.id,
        title: job.title,
        company: job.company,
        location: job.location,
        type: job.type,
        salary: job.salary,
        description: job.description,
        requirements: job.requirements,
        postedAt: job.postedAt,
        applicants: job.applicants,
        status: job.status,
      }))
    );
    setApplications(
      applicationsResult.applications.map((application) => ({
        id: application.id,
        jobId: application.jobId,
        jobTitle: application.job?.title || "Unknown Job",
        company: application.job?.company || "Unknown Company",
        appliedAt: application.appliedAt,
        status: application.status,
        aiScore: application.aiScore,
      }))
    );
  };

  useEffect(() => {
    const loadProfile = async () => {
      try {
        await loadData();
      } catch (error) {
        await signOutApp();
        toast({
          title: "Session expired",
          description: "Please login again.",
          variant: "destructive",
        });
      }
    };

    void loadProfile();
  }, [toast, signOutApp]);

  const handleLogout = () => {
    void signOutApp();
  };

  const handleSaveProfile = async () => {
    try {
      setIsSaving(true);
      const skills = skillsText
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      await api.updateMe({ name, bio, skills });
      toast({ title: "Profile updated", description: "Your profile changes were saved." });
    } catch (error) {
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "Unable to update profile.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleApply = async (jobId: string) => {
    setPendingApplyJobId(jobId);
    setSelectedCvFile(null);
    setIsApplyDialogOpen(true);
  };

  const handleCvSelectedForApply = async (event: ChangeEvent<HTMLInputElement>) => {
    setSelectedCvFile(event.target.files?.[0] || null);
  };

  const submitApplicationWithCv = async () => {
    const file = selectedCvFile;
    const jobId = pendingApplyJobId;
    if (!file || !jobId) return;
    try {
      setApplyingJobId(jobId);
      const cvText = await extractCVText(file);
      await api.applyToJob({
        jobId,
        cvPath: file.name,
        cvText: cvText.slice(0, 100000),
      });
      await loadData();
      toast({
        title: "Application sent",
        description: "Your CV was uploaded and your application was saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Application failed",
        description: error instanceof Error ? error.message : "Could not apply to this job.",
        variant: "destructive",
      });
    } finally {
      setApplyingJobId(null);
      setPendingApplyJobId(null);
      setSelectedCvFile(null);
      setIsApplyDialogOpen(false);
    }
  };

  const appliedJobIds = new Set(applications.map((app) => app.jobId));

  return (
    <div className="min-h-screen bg-background">
      {/* Top Bar */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-hero flex items-center justify-center">
              <Brain className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-lg text-foreground">Tanit-Talent</span>
          </Link>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon"><Bell className="w-4 h-4" /></Button>
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-display font-bold text-sm">
              {name
                .split(" ")
                .map((part) => part[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-1" /> Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="font-display font-bold text-2xl text-foreground">Welcome back, {name} 👋</h1>
          <p className="text-muted-foreground text-sm mt-1">Track your applications and discover new opportunities</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard title="Applications" value={applications.length} icon={FileText} trend={{ value: 12, positive: true }} />
          <StatCard title="Shortlisted" value={applications.filter((item) => item.status === "shortlisted").length} icon={Star} />
          <StatCard title="Avg. AI Score" value={`${Math.round((applications.reduce((sum, item) => sum + item.aiScore, 0) / Math.max(applications.length, 1)) * 100)}%`} icon={Brain} />
          <StatCard title="Open Jobs" value={jobs.filter((job) => job.status === "active").length} icon={Briefcase} trend={{ value: 8, positive: true }} />
        </div>

        <Tabs defaultValue="applications" className="space-y-6">
          <TabsList>
            <TabsTrigger value="applications">My Applications</TabsTrigger>
            <TabsTrigger value="discover">Discover Jobs</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="applications">
            <div className="space-y-4">
              {applications.map(app => (
                <Card key={app.id} className="p-5 flex items-center justify-between">
                  <div>
                    <h4 className="font-display font-semibold text-foreground">{app.jobTitle}</h4>
                    <p className="text-sm text-muted-foreground">{app.company} · Applied {app.appliedAt}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">AI Score</p>
                      <p className="font-bold text-primary">{Math.round(app.aiScore * 100)}%</p>
                    </div>
                    <Badge className={statusColors[app.status]}>{app.status}</Badge>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="discover">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {jobs.slice(0, 8).map(job => (
                <JobCard
                  key={job.id}
                  job={job}
                  onApply={handleApply}
                  applyDisabled={applyingJobId === job.id || appliedJobIds.has(job.id)}
                  applyLabel={appliedJobIds.has(job.id) ? "Applied" : applyingJobId === job.id ? "Applying..." : "Apply"}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="profile">
            <Card className="p-8 max-w-2xl">
              <h3 className="font-display font-semibold text-lg text-foreground mb-6">Profile</h3>
              <p className="text-sm text-muted-foreground mb-4">
                CV upload is requested when you click Apply on a job. The uploaded CV is saved with that application and scored automatically by AI.
              </p>
              <div className="mt-6 space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground">Full Name</label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} className="mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Bio</label>
                  <Input value={bio} onChange={(e) => setBio(e.target.value)} className="mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Skills (comma separated)</label>
                  <Input value={skillsText} onChange={(e) => setSkillsText(e.target.value)} className="mt-1" />
                </div>
                <Button onClick={handleSaveProfile} disabled={isSaving}>
                  Save Profile
                </Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      <Dialog open={isApplyDialogOpen} onOpenChange={setIsApplyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload CV to apply</DialogTitle>
            <DialogDescription>
              Select your CV file (PDF, DOCX, or TXT) to apply for this job.
            </DialogDescription>
          </DialogHeader>
          <input type="file" accept=".pdf,.docx,.txt" onChange={handleCvSelectedForApply} />
          {selectedCvFile && (
            <p className="text-sm text-muted-foreground">Selected: {selectedCvFile.name}</p>
          )}
          <DialogFooter>
            <Button
              onClick={() => void submitApplicationWithCv()}
              disabled={!selectedCvFile || (pendingApplyJobId !== null && applyingJobId === pendingApplyJobId)}
            >
              {pendingApplyJobId !== null && applyingJobId === pendingApplyJobId ? "Applying..." : "Apply Now"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CandidateDashboard;
