import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import Jobs from "./pages/Jobs.tsx";
import Auth from "./pages/Auth.tsx";
import CandidateDashboard from "./pages/CandidateDashboard.tsx";
import RecruiterDashboard from "./pages/RecruiterDashboard.tsx";
import AdminDashboard from "./pages/AdminDashboard.tsx";
import AdminUsersList from "./pages/AdminUsersList.tsx";
import AdminCreateUser from "./pages/AdminCreateUser.tsx";
import AdminEditUser from "./pages/AdminEditUser.tsx";
import AdminViewUser from "./pages/AdminViewUser.tsx";
import NotFound from "./pages/NotFound.tsx";
import ProtectedRoute from "./components/ProtectedRoute.tsx";
import { BackendAuthProvider } from "./components/BackendAuthProvider.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BackendAuthProvider>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/auth" element={<Auth />} />
          <Route
            path="/candidate"
            element={
              <ProtectedRoute allowedRoles={["candidat"]}>
                <CandidateDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/recruiter"
            element={
              <ProtectedRoute allowedRoles={["recruteur"]}>
                <RecruiterDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminUsersList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users/new"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminCreateUser />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users/:id"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminViewUser />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users/:id/edit"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminEditUser />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
    </BackendAuthProvider>
  </QueryClientProvider>
);

export default App;
