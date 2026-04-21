import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import StatCard from "@/components/StatCard";
import CandidateCard from "@/components/CandidateCard";
import JobCard from "@/components/JobCard";
import {
  ViewsChart,
  SkillsChart,
  TrendChart,
  CategoryChart,
} from "@/components/Charts";
import {
  Brain,
  Briefcase,
  Users,
  BarChart3,
  Plus,
  LogOut,
  Bell,
  Trash2,
  Pencil,
} from "lucide-react";
import { analyticsData, type Candidate } from "@/data/mockData";
import { Link } from "react-router-dom";
import { api, type ApiJob } from "@/lib/api";
import { useAppSignOut } from "@/hooks/useAppSignOut";
import { useToast } from "@/hooks/use-toast";

const mapApiJobToUiJob = (job: ApiJob) => ({
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
});

type RecruiterCandidateItem = {
  jobId: string;
  candidate: Candidate;
};

const RecruiterDashboard = () => {
  const { toast } = useToast();
  const signOutApp = useAppSignOut();
  const [jobs, setJobs] = useState<ApiJob[]>([]);
  const [candidates, setCandidates] = useState<RecruiterCandidateItem[]>([]);
  const [selectedJob, setSelectedJob] = useState("");
  const [initials, setInitials] = useState("RC");
  const [isPublishing, setIsPublishing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [deletingJobId, setDeletingJobId] = useState<string | null>(null);
  const [jobToDelete, setJobToDelete] = useState<ApiJob | null>(null);
  const [editingJobId, setEditingJobId] = useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    company: "",
    location: "",
    type: "Full-time" as ApiJob["type"],
    salary: "",
    description: "",
    requirements: "",
  });
  const [editForm, setEditForm] = useState({
    title: "",
    company: "",
    location: "",
    type: "Full-time" as ApiJob["type"],
    salary: "",
    description: "",
    requirements: "",
  });

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [me, jobsResult, applicationsResult] = await Promise.all([
          api.getMe(),
          api.getMyJobs(),
          api.getRecruiterApplications(),
        ]);
        const userInitials = me.user.name
          .split(" ")
          .map((part) => part[0])
          .join("")
          .slice(0, 2)
          .toUpperCase();
        setInitials(userInitials || "RC");
        setJobs(jobsResult.jobs);
        if (jobsResult.jobs.length > 0) {
          setSelectedJob((current) => current || jobsResult.jobs[0].id);
        }
        const nextCandidates: RecruiterCandidateItem[] =
          applicationsResult.applications.map((application) => {
            const candidateName =
              application.candidate?.name || "Unknown Candidate";
            const profileSkills = application.profile?.skills || [];
            return {
              jobId: application.jobId,
              candidate: {
                id: application.id,
                name: candidateName,
                email: application.candidate?.email || "unknown@email.com",
                title:
                  profileSkills.length > 0 ? profileSkills[0] : "Candidate",
                location: "Tunisia",
                skills: profileSkills,
                experience: 0,
                aiScore: application.aiScore,
                appliedAt: application.appliedAt,
                status: application.status,
              },
            };
          });
        setCandidates(nextCandidates);
      } catch {
        void signOutApp();
      }
    };
    void loadDashboardData();
  }, [signOutApp]);

  const handleLogout = () => {
    void signOutApp();
  };

  const handlePublishJob = async () => {
    const trimmedTitle = form.title.trim();
    const trimmedCompany = form.company.trim();
    const trimmedLocation = form.location.trim();
    const trimmedSalary = form.salary.trim();
    const trimmedDescription = form.description.trim();
    const requirements = form.requirements
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    if (trimmedTitle.length < 3) {
      toast({
        title: "Publish failed",
        description: "Job title must be at least 3 characters.",
        variant: "destructive",
      });
      return;
    }
    if (trimmedCompany.length < 2) {
      toast({
        title: "Publish failed",
        description: "Company must be at least 2 characters.",
        variant: "destructive",
      });
      return;
    }
    if (trimmedLocation.length < 2) {
      toast({
        title: "Publish failed",
        description: "Location must be at least 2 characters.",
        variant: "destructive",
      });
      return;
    }
    if (!trimmedSalary) {
      toast({
        title: "Publish failed",
        description: "Salary range is required.",
        variant: "destructive",
      });
      return;
    }
    if (trimmedDescription.length < 20) {
      toast({
        title: "Publish failed",
        description: "Description must be at least 20 characters.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsPublishing(true);
      const payload = {
        title: trimmedTitle,
        company: trimmedCompany,
        location: trimmedLocation,
        type: form.type,
        salary: trimmedSalary,
        description: trimmedDescription,
        requirements,
      };
      const result = await api.createJob(payload);
      setJobs((prev) => [result.job, ...prev]);
      setSelectedJob(result.job.id);
      setForm({
        title: "",
        company: "",
        location: "",
        type: "Full-time",
        salary: "",
        description: "",
        requirements: "",
      });
      toast({
        title: "Job published",
        description: "The new job is now available to candidates.",
      });
    } catch (error) {
      toast({
        title: "Publish failed",
        description:
          error instanceof Error ? error.message : "Could not publish job.",
        variant: "destructive",
      });
    } finally {
      setIsPublishing(false);
    }
  };

  const filteredCandidates = candidates.filter((candidate) => {
    if (!selectedJob) return true;
    return candidate.jobId === selectedJob;
  });

  const handleDeleteJob = async (jobId: string) => {
    try {
      setDeletingJobId(jobId);
      await api.deleteJob(jobId);
      const remainingJobs = jobs.filter((job) => job.id !== jobId);
      setJobs(remainingJobs);
      setCandidates((prev) => prev.filter((item) => item.jobId !== jobId));
      if (selectedJob === jobId) {
        setSelectedJob(remainingJobs[0]?.id || "");
      }
      toast({
        title: "Job deleted",
        description: "The job post and its applications were removed.",
      });
    } catch (error) {
      toast({
        title: "Delete failed",
        description: error instanceof Error ? error.message : "Could not delete this job.",
        variant: "destructive",
      });
    } finally {
      setDeletingJobId(null);
      setJobToDelete(null);
    }
  };

  const openEditDialog = (job: ApiJob) => {
    setEditingJobId(job.id);
    setEditForm({
      title: job.title,
      company: job.company,
      location: job.location,
      type: job.type,
      salary: job.salary,
      description: job.description,
      requirements: job.requirements.join(", "),
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateJob = async () => {
    if (!editingJobId) return;
    const requirements = editForm.requirements
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    try {
      setIsUpdating(true);
      const result = await api.updateJob(editingJobId, {
        title: editForm.title.trim(),
        company: editForm.company.trim(),
        location: editForm.location.trim(),
        type: editForm.type,
        salary: editForm.salary.trim(),
        description: editForm.description.trim(),
        requirements,
      });
      setJobs((prev) => prev.map((job) => (job.id === editingJobId ? result.job : job)));
      setCandidates((prev) => prev.filter((item) => item.jobId !== editingJobId));
      setIsEditDialogOpen(false);
      setEditingJobId(null);
      toast({
        title: "Job updated",
        description: "Your job post was updated. Candidates can apply again with fresh CV submissions.",
      });
    } catch (error) {
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "Could not update this job.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top Bar */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-hero flex items-center justify-center">
              <Brain className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-lg text-foreground">
              Tanit-Talent
            </span>
            <Badge variant="secondary" className="text-xs">
              Recruiter
            </Badge>
          </Link>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon">
              <Bell className="w-4 h-4" />
            </Button>
            <div className="w-8 h-8 rounded-full gradient-warm flex items-center justify-center text-primary-foreground font-display font-bold text-sm">
              {initials}
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-1" /> Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display font-bold text-2xl text-foreground">
              Recruiter Dashboard
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Manage jobs, review candidates, and track performance
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/jobs">
              <Button variant="outline" className="gap-2">
                <Briefcase className="w-4 h-4" /> Open Jobs List
              </Button>
            </Link>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="w-4 h-4" /> Post New Job
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle className="font-display">
                    Create Job Posting
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                <div>
                  <label className="text-sm font-medium">Job Title</label>
                  <Input
                    className="mt-1"
                    placeholder="e.g. Senior React Developer"
                    value={form.title}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, title: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Company</label>
                  <Input
                    className="mt-1"
                    placeholder="Company name"
                    value={form.company}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, company: e.target.value }))
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Location</label>
                    <Input
                      className="mt-1"
                      placeholder="City, Country"
                      value={form.location}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          location: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Salary Range</label>
                    <Input
                      className="mt-1"
                      placeholder="e.g. 3000-5000 TND"
                      value={form.salary}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, salary: e.target.value }))
                      }
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    className="mt-1"
                    placeholder="Describe the role..."
                    rows={4}
                    value={form.description}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">
                    Requirements (comma-separated)
                  </label>
                  <Input
                    className="mt-1"
                    placeholder="React, TypeScript, Node.js"
                    value={form.requirements}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        requirements: e.target.value,
                      }))
                    }
                  />
                </div>
                <Button
                  className="w-full"
                  onClick={handlePublishJob}
                  disabled={isPublishing}
                >
                  Publish Job
                </Button>
              </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Active Jobs"
            value={jobs.length}
            icon={Briefcase}
            trend={{ value: 15, positive: true }}
          />
          <StatCard
            title="Total Candidates"
            value={candidates.length}
            icon={Users}
            trend={{ value: 23, positive: true }}
          />
          <StatCard
            title="Avg AI Score"
            value={`${Math.round(analyticsData.avgAiScore * 100)}%`}
            icon={Brain}
          />
          <StatCard
            title="Conversion Rate"
            value={`${analyticsData.conversionRate}%`}
            icon={BarChart3}
            trend={{ value: 4.2, positive: true }}
          />
        </div>

        <Tabs defaultValue="candidates" className="space-y-6">
          <TabsList className="flex flex-wrap h-auto gap-1">
            <TabsTrigger value="candidates">AI-Ranked Candidates</TabsTrigger>
            <TabsTrigger value="jobs">My Jobs</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="candidates">
            <div className="mb-4">
              <p className="text-sm text-muted-foreground mb-3">
                Showing candidates for your selected job.
              </p>
              <div className="flex gap-2 flex-wrap">
                {jobs.map((job) => (
                  <Badge
                    key={job.id}
                    variant={selectedJob === job.id ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setSelectedJob(job.id)}
                  >
                    {job.title}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              {filteredCandidates
                .sort((a, b) => b.candidate.aiScore - a.candidate.aiScore)
                .map((item, i) => (
                  <CandidateCard
                    key={item.candidate.id}
                    candidate={item.candidate}
                    rank={i + 1}
                  />
                ))}
            </div>
          </TabsContent>

          <TabsContent value="jobs">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {jobs.map((job) => (
                <Card key={job.id} className="p-4 space-y-3">
                  <JobCard job={mapApiJobToUiJob(job)} showApply={false} />
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => openEditDialog(job)}>
                      <Pencil className="w-4 h-4 mr-1" />
                      Update
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      disabled={deletingJobId === job.id}
                      onClick={() => setJobToDelete(job)}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      {deletingJobId === job.id ? "Deleting..." : "Delete Job"}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ViewsChart />
              <TrendChart />
              <SkillsChart />
              <CategoryChart />
            </div>
          </TabsContent>
        </Tabs>
      </div>
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display">Update Job Posting</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <label className="text-sm font-medium">Job Title</label>
              <Input
                className="mt-1"
                value={editForm.title}
                onChange={(e) => setEditForm((prev) => ({ ...prev, title: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Company</label>
              <Input
                className="mt-1"
                value={editForm.company}
                onChange={(e) => setEditForm((prev) => ({ ...prev, company: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Location</label>
                <Input
                  className="mt-1"
                  value={editForm.location}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, location: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium">Salary Range</label>
                <Input
                  className="mt-1"
                  value={editForm.salary}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, salary: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea
                className="mt-1"
                rows={4}
                value={editForm.description}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, description: e.target.value }))
                }
              />
            </div>
            <div>
              <label className="text-sm font-medium">Requirements (comma-separated)</label>
              <Input
                className="mt-1"
                value={editForm.requirements}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, requirements: e.target.value }))
                }
              />
            </div>
            <Button className="w-full" onClick={handleUpdateJob} disabled={isUpdating}>
              {isUpdating ? "Updating..." : "Save Changes"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <AlertDialog open={Boolean(jobToDelete)} onOpenChange={(open) => !open && setJobToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Job Post</AlertDialogTitle>
            <AlertDialogDescription>
              {`Are you sure you want to delete "${jobToDelete?.title || "this job"}"? This will also remove related applications.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (jobToDelete) {
                  void handleDeleteJob(jobToDelete.id);
                }
              }}
            >
              Confirm Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default RecruiterDashboard;
