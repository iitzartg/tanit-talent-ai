export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: "Full-time" | "Part-time" | "Contract" | "Remote";
  salary: string;
  description: string;
  requirements: string[];
  postedAt: string;
  applicants: number;
  status: "active" | "closed" | "draft";
}

export interface Candidate {
  id: string;
  name: string;
  email: string;
  title: string;
  location: string;
  skills: string[];
  experience: number;
  aiScore: number;
  appliedAt: string;
  status: "pending" | "reviewed" | "shortlisted" | "rejected";
  avatar?: string;
}

export interface Application {
  id: string;
  jobId: string;
  jobTitle: string;
  company: string;
  appliedAt: string;
  status: "pending" | "reviewed" | "shortlisted" | "rejected";
  aiScore: number;
}

export const mockJobs: Job[] = [
  {
    id: "1",
    title: "Senior Full-Stack Developer",
    company: "TechVision Tunisia",
    location: "Tunis, Tunisia",
    type: "Full-time",
    salary: "3,500 - 5,000 TND",
    description: "We are looking for a senior full-stack developer to join our growing team. You will work on cutting-edge web applications using React and Node.js.",
    requirements: ["React", "Node.js", "TypeScript", "PostgreSQL", "Docker"],
    postedAt: "2024-03-20",
    applicants: 47,
    status: "active",
  },
  {
    id: "2",
    title: "Data Scientist",
    company: "DataFlow Analytics",
    location: "Sfax, Tunisia",
    type: "Remote",
    salary: "4,000 - 6,000 TND",
    description: "Join our data science team to build ML models and data pipelines for enterprise clients.",
    requirements: ["Python", "TensorFlow", "SQL", "Statistics", "NLP"],
    postedAt: "2024-03-18",
    applicants: 32,
    status: "active",
  },
  {
    id: "3",
    title: "UX/UI Designer",
    company: "DesignLab Sousse",
    location: "Sousse, Tunisia",
    type: "Full-time",
    salary: "2,500 - 3,500 TND",
    description: "We need a creative UX/UI designer to craft beautiful and intuitive user experiences.",
    requirements: ["Figma", "Adobe XD", "Prototyping", "User Research", "Design Systems"],
    postedAt: "2024-03-15",
    applicants: 28,
    status: "active",
  },
  {
    id: "4",
    title: "DevOps Engineer",
    company: "CloudNet Solutions",
    location: "Tunis, Tunisia",
    type: "Contract",
    salary: "4,500 - 6,500 TND",
    description: "Looking for an experienced DevOps engineer to manage our cloud infrastructure and CI/CD pipelines.",
    requirements: ["AWS", "Docker", "Kubernetes", "Terraform", "CI/CD"],
    postedAt: "2024-03-12",
    applicants: 19,
    status: "active",
  },
  {
    id: "5",
    title: "Mobile Developer (React Native)",
    company: "AppForge",
    location: "Monastir, Tunisia",
    type: "Full-time",
    salary: "3,000 - 4,500 TND",
    description: "Build cross-platform mobile applications for our diverse client portfolio.",
    requirements: ["React Native", "TypeScript", "Redux", "REST APIs", "Git"],
    postedAt: "2024-03-10",
    applicants: 35,
    status: "active",
  },
];

export const mockCandidates: Candidate[] = [
  { id: "1", name: "Ahmed Ben Ali", email: "ahmed@email.com", title: "Full-Stack Developer", location: "Tunis", skills: ["React", "Node.js", "TypeScript", "MongoDB"], experience: 5, aiScore: 0.94, appliedAt: "2024-03-21", status: "shortlisted" },
  { id: "2", name: "Fatma Bouazizi", email: "fatma@email.com", title: "Frontend Developer", location: "Sfax", skills: ["React", "Vue.js", "CSS", "TypeScript"], experience: 3, aiScore: 0.87, appliedAt: "2024-03-20", status: "reviewed" },
  { id: "3", name: "Mohamed Trabelsi", email: "mohamed@email.com", title: "Backend Developer", location: "Sousse", skills: ["Python", "Django", "PostgreSQL", "Docker"], experience: 4, aiScore: 0.76, appliedAt: "2024-03-19", status: "pending" },
  { id: "4", name: "Ines Gharbi", email: "ines@email.com", title: "Data Engineer", location: "Tunis", skills: ["Python", "Spark", "SQL", "AWS"], experience: 6, aiScore: 0.82, appliedAt: "2024-03-18", status: "reviewed" },
  { id: "5", name: "Youssef Mansouri", email: "youssef@email.com", title: "DevOps Engineer", location: "Bizerte", skills: ["Docker", "Kubernetes", "AWS", "Terraform"], experience: 4, aiScore: 0.71, appliedAt: "2024-03-17", status: "pending" },
  { id: "6", name: "Amira Khelifi", email: "amira@email.com", title: "UI/UX Designer", location: "Tunis", skills: ["Figma", "Adobe XD", "CSS", "Prototyping"], experience: 2, aiScore: 0.65, appliedAt: "2024-03-16", status: "rejected" },
];

export const mockApplications: Application[] = [
  { id: "1", jobId: "1", jobTitle: "Senior Full-Stack Developer", company: "TechVision Tunisia", appliedAt: "2024-03-21", status: "shortlisted", aiScore: 0.94 },
  { id: "2", jobId: "2", jobTitle: "Data Scientist", company: "DataFlow Analytics", appliedAt: "2024-03-19", status: "reviewed", aiScore: 0.72 },
  { id: "3", jobId: "4", jobTitle: "DevOps Engineer", company: "CloudNet Solutions", appliedAt: "2024-03-15", status: "pending", aiScore: 0.68 },
];

export const analyticsData = {
  totalJobs: 156,
  totalCandidates: 2847,
  totalApplications: 8934,
  avgAiScore: 0.73,
  conversionRate: 12.4,
  monthlyViews: [
    { month: "Oct", views: 4200, applications: 520 },
    { month: "Nov", views: 5100, applications: 640 },
    { month: "Dec", views: 3800, applications: 410 },
    { month: "Jan", views: 6200, applications: 780 },
    { month: "Feb", views: 7100, applications: 890 },
    { month: "Mar", views: 8400, applications: 1050 },
  ],
  topSkills: [
    { skill: "React", count: 1245 },
    { skill: "Python", count: 1089 },
    { skill: "TypeScript", count: 967 },
    { skill: "Node.js", count: 834 },
    { skill: "Docker", count: 612 },
  ],
  jobsByCategory: [
    { category: "Engineering", count: 67 },
    { category: "Data Science", count: 34 },
    { category: "Design", count: 23 },
    { category: "DevOps", count: 18 },
    { category: "Marketing", count: 14 },
  ],
};
