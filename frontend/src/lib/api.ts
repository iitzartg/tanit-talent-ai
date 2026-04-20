import { getToken, type AuthUser, type UserRole } from "@/lib/auth";

export interface ApiProfile {
  userId: string;
  bio: string;
  skills: string[];
  cvPath: string;
  updatedAt: string;
}

export interface ApiJob {
  id: string;
  recruiterId: string;
  title: string;
  company: string;
  location: string;
  type: "Full-time" | "Part-time" | "Contract" | "Remote";
  salary: string;
  description: string;
  requirements: string[];
  status: "active" | "closed" | "draft";
  postedAt: string;
  applicants: number;
}

export interface ApiApplication {
  id: string;
  jobId: string;
  candidateId: string;
  status: "pending" | "reviewed" | "shortlisted" | "rejected";
  aiScore: number;
  appliedAt: string;
  job: ApiJob | null;
  candidate?: AuthUser | null;
  profile?: ApiProfile | null;
}

export interface UserCrudPayload {
  name: string;
  email: string;
  role: UserRole;
  bio?: string;
  skills?: string[];
  cvPath?: string;
}

interface ApiRequestOptions extends RequestInit {
  auth?: boolean;
}

const API_URL = (import.meta.env.VITE_API_URL as string | undefined) || "http://localhost:5001";

async function request<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");

  if (options.auth) {
    const token = getToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  const response = await fetch(`${API_URL}${path}`, { ...options, headers });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const detailedValidationError =
      Array.isArray(data?.errors) && data.errors.length > 0
        ? data.errors[0]?.msg || data.errors[0]?.message
        : null;
    throw new Error(detailedValidationError || data?.message || "Request failed.");
  }

  return data as T;
}

export const api = {
  health: () => request<{ status: string; message: string }>("/api/health"),

  register: (payload: { name: string; email: string; password: string; role: UserRole }) =>
    request<{ message: string; token: string; user: AuthUser }>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  login: (payload: { email: string; password: string }) =>
    request<{ message: string; token: string; user: AuthUser }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  clerkSync: (clerkSessionJwt: string, body: { role?: UserRole } = {}) =>
    request<{ message: string; token: string; user: AuthUser }>("/api/auth/clerk-sync", {
      method: "POST",
      body: JSON.stringify(body),
      headers: { Authorization: `Bearer ${clerkSessionJwt}` },
    }),

  getMe: () => request<{ user: AuthUser; profile: ApiProfile | null }>("/api/users/me", { auth: true }),

  updateMe: (payload: { name?: string; bio?: string; skills?: string[]; cvPath?: string }) =>
    request<{ message: string; user: AuthUser; profile: ApiProfile | null }>("/api/users/me", {
      method: "PUT",
      auth: true,
      body: JSON.stringify(payload),
    }),

  getJobs: () => request<{ jobs: ApiJob[] }>("/api/jobs"),

  getMyJobs: () => request<{ jobs: ApiJob[] }>("/api/jobs/mine", { auth: true }),

  createJob: (payload: {
    title: string;
    company: string;
    location: string;
    type: ApiJob["type"];
    salary: string;
    description: string;
    requirements?: string[];
    status?: ApiJob["status"];
  }) =>
    request<{ message: string; job: ApiJob }>("/api/jobs", {
      method: "POST",
      auth: true,
      body: JSON.stringify(payload),
    }),

  applyToJob: (jobId: string) =>
    request<{ message: string; application: ApiApplication }>("/api/applications", {
      method: "POST",
      auth: true,
      body: JSON.stringify({ jobId }),
    }),

  getMyApplications: () =>
    request<{ applications: ApiApplication[] }>("/api/applications/me", {
      auth: true,
    }),

  getRecruiterApplications: () =>
    request<{ applications: ApiApplication[] }>("/api/applications/recruiter", {
      auth: true,
    }),

  getUsers: () => request<{ users: Array<AuthUser & { profile: ApiProfile | null }> }>("/api/users", { auth: true }),
  getUserById: (id: string) =>
    request<{ user: AuthUser; profile: ApiProfile | null }>(`/api/users/${id}`, {
      auth: true,
    }),
  createUser: (payload: UserCrudPayload) =>
    request<{ message: string; user: AuthUser; profile: ApiProfile | null }>("/api/users", {
      method: "POST",
      auth: true,
      body: JSON.stringify(payload),
    }),
  updateUser: (id: string, payload: Partial<UserCrudPayload>) =>
    request<{ message: string; user: AuthUser; profile: ApiProfile | null }>(`/api/users/${id}`, {
      method: "PUT",
      auth: true,
      body: JSON.stringify(payload),
    }),

  deleteUser: (id: string) =>
    request<{ message: string }>(`/api/users/${id}`, {
      method: "DELETE",
      auth: true,
    }),
};
