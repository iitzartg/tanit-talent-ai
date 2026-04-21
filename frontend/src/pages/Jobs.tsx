import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import JobCard from "@/components/JobCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, MapPin, Filter } from "lucide-react";
import type { Job } from "@/data/mockData";
import { useEffect, useState, type ChangeEvent } from "react";
import { api } from "@/lib/api";
import { getStoredUser } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { extractCVText } from "@/lib/cvAnalyzer";

const Jobs = () => {
  const { toast } = useToast();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [myApplications, setMyApplications] = useState<string[]>([]);
  const [applyingJobId, setApplyingJobId] = useState<string | null>(null);
  const [pendingApplyJobId, setPendingApplyJobId] = useState<string | null>(null);
  const [isApplyDialogOpen, setIsApplyDialogOpen] = useState(false);
  const [selectedCvFile, setSelectedCvFile] = useState<File | null>(null);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const user = getStoredUser();
  const isCandidate = user?.role === "candidat";

  useEffect(() => {
    const loadJobs = async () => {
      try {
        const [jobsResult, applicationsResult] = await Promise.all([
          api.getJobs(),
          isCandidate ? api.getMyApplications() : Promise.resolve({ applications: [] }),
        ]);
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
        if (isCandidate) {
          setMyApplications(applicationsResult.applications.map((application) => application.jobId));
        }
      } catch {
        setJobs([]);
      }
    };
    void loadJobs();
  }, [isCandidate]);

  const handleApply = async (jobId: string) => {
    if (!isCandidate) return;
    setPendingApplyJobId(jobId);
    setSelectedCvFile(null);
    setIsApplyDialogOpen(true);
  };

  const handleCvSelected = async (event: ChangeEvent<HTMLInputElement>) => {
    setSelectedCvFile(event.target.files?.[0] || null);
  };

  const submitApplicationWithCv = async () => {
    const jobId = pendingApplyJobId;
    const file = selectedCvFile;
    if (!file || !jobId) return;
    try {
      setApplyingJobId(jobId);
      const cvText = await extractCVText(file);
      await api.applyToJob({
        jobId,
        cvPath: file.name,
        cvText: cvText.slice(0, 100000),
      });
      setMyApplications((prev) => (prev.includes(jobId) ? prev : [...prev, jobId]));
      toast({
        title: "Application sent",
        description: "Your CV was uploaded and your application was submitted successfully.",
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

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(search.toLowerCase()) || job.company.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === "all" || job.type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Search Header */}
          <div className="mb-10">
            <h1 className="font-display font-bold text-3xl md:text-4xl text-foreground mb-2">
              Find Your Next Opportunity
            </h1>
            <p className="text-muted-foreground">Browse {jobs.length} open positions across Tunisia</p>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search jobs or companies..."
                className="pl-10"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Job Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Full-time">Full-time</SelectItem>
                <SelectItem value="Part-time">Part-time</SelectItem>
                <SelectItem value="Contract">Contract</SelectItem>
                <SelectItem value="Remote">Remote</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Results */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredJobs.map(job => (
              <JobCard
                key={job.id}
                job={job}
                onApply={isCandidate ? handleApply : undefined}
                applyDisabled={
                  isCandidate ? applyingJobId === job.id || myApplications.includes(job.id) : false
                }
                applyLabel={
                  isCandidate
                    ? myApplications.includes(job.id)
                      ? "Applied"
                      : applyingJobId === job.id
                        ? "Applying..."
                        : "Apply"
                    : undefined
                }
              />
            ))}
          </div>

          {filteredJobs.length === 0 && (
            <div className="text-center py-20 text-muted-foreground">
              <p className="text-lg font-display">No jobs found</p>
              <p className="text-sm mt-2">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </div>
      <Dialog open={isApplyDialogOpen} onOpenChange={setIsApplyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload CV to apply</DialogTitle>
            <DialogDescription>
              Select your CV file (PDF, DOCX, or TXT) to submit this application.
            </DialogDescription>
          </DialogHeader>
          <input type="file" accept=".pdf,.docx,.txt" onChange={handleCvSelected} />
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
      <Footer />
    </div>
  );
};

export default Jobs;
