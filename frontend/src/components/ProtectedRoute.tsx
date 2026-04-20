import { Navigate } from "react-router-dom";
import { useAuth } from "@clerk/react";
import { getStoredUser, getToken, type UserRole } from "@/lib/auth";
import { useBackendAuth } from "@/hooks/useBackendAuth";

interface ProtectedRouteProps {
  children: JSX.Element;
  allowedRoles?: UserRole[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { isLoaded, isSignedIn } = useAuth();
  const { backendReady } = useBackendAuth();

  if (!isLoaded || !backendReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground text-sm">Loading…</p>
      </div>
    );
  }

  if (!isSignedIn) {
    return <Navigate to="/auth" replace />;
  }

  const user = getStoredUser();
  const token = getToken();

  if (!user || !token) {
    return <Navigate to="/auth" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/auth" replace />;
  }

  return children;
};

export default ProtectedRoute;
