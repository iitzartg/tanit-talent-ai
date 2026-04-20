import { useEffect, useState } from "react";
import { Show, SignInButton, SignUpButton } from "@clerk/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Brain, Building2, User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/react";
import { getStoredUser } from "@/lib/auth";
import { useBackendAuth } from "@/hooks/useBackendAuth";

const PENDING_ROLE_KEY = "pending_clerk_role";

const getDashboardPath = (userRole: string) => {
  if (userRole === "admin") return "/admin";
  if (userRole === "recruteur") return "/recruiter";
  return "/jobs";
};

const Auth = () => {
  const [role, setRole] = useState<"candidat" | "recruteur">("candidat");
  const navigate = useNavigate();
  const { isLoaded, isSignedIn } = useAuth();
  const { backendReady, backendAuthError } = useBackendAuth();

  useEffect(() => {
    if (!isLoaded || !backendReady || !isSignedIn) return;
    const user = getStoredUser();
    if (user) navigate(getDashboardPath(user.role), { replace: true });
  }, [isLoaded, backendReady, isSignedIn, navigate]);

  const applyRoleBeforeClerk = (next: "candidat" | "recruteur") => {
    setRole(next);
    sessionStorage.setItem(PENDING_ROLE_KEY, next);
  };

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 animate-scale-in">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-lg gradient-hero flex items-center justify-center">
              <Brain className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-xl text-foreground">Tanit-Talent</span>
          </Link>
          <h1 className="font-display font-bold text-2xl text-foreground">Welcome</h1>
          <p className="text-sm text-muted-foreground mt-1">Sign in or create an account</p>
        </div>

        <div className="flex gap-3 mb-6">
          <button
            type="button"
            onClick={() => applyRoleBeforeClerk("candidat")}
            className={`flex-1 p-3 rounded-lg border-2 text-center transition-all ${role === "candidat" ? "border-primary bg-primary/5" : "border-border"}`}
          >
            <User className={`w-5 h-5 mx-auto mb-1 ${role === "candidat" ? "text-primary" : "text-muted-foreground"}`} />
            <span className={`text-sm font-medium ${role === "candidat" ? "text-primary" : "text-muted-foreground"}`}>
              Candidate
            </span>
          </button>
          <button
            type="button"
            onClick={() => applyRoleBeforeClerk("recruteur")}
            className={`flex-1 p-3 rounded-lg border-2 text-center transition-all ${role === "recruteur" ? "border-primary bg-primary/5" : "border-border"}`}
          >
            <Building2 className={`w-5 h-5 mx-auto mb-1 ${role === "recruteur" ? "text-primary" : "text-muted-foreground"}`} />
            <span className={`text-sm font-medium ${role === "recruteur" ? "text-primary" : "text-muted-foreground"}`}>
              Recruiter
            </span>
          </button>
        </div>

        <p className="text-xs text-muted-foreground text-center mb-4">
          New accounts use this choice for your role (Candidate or Recruiter).
        </p>

        <Show when="signed-out">
          <div className="flex flex-col gap-3">
            <SignInButton mode="modal">
              <Button className="w-full" size="lg" type="button">
                Sign in
              </Button>
            </SignInButton>
            <SignUpButton mode="modal">
              <Button className="w-full" size="lg" variant="outline" type="button">
                Sign up
              </Button>
            </SignUpButton>
          </div>
        </Show>

        <Show when="signed-in">
          <div className="space-y-3">
            {!backendReady && (
              <p className="text-center text-sm text-muted-foreground">Finishing sign-in…</p>
            )}
            {backendReady && backendAuthError && (
              <div className="text-center space-y-2">
                <p className="text-sm text-destructive">
                  Backend sign-in failed: {backendAuthError}
                </p>
                <p className="text-xs text-muted-foreground">
                  Set a valid Clerk secret key (`sk_...`) in `backend/.env` then restart backend.
                </p>
              </div>
            )}
          </div>
        </Show>
      </Card>
    </div>
  );
};

export default Auth;
