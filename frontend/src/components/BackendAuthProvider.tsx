import { useEffect, useState, type ReactNode } from "react";
import { useAuth } from "@clerk/react";
import { BackendAuthContext } from "@/context/backendAuthContext";
import { api } from "@/lib/api";
import { clearBackendSession, setStoredUser, setToken } from "@/lib/auth";

export function BackendAuthProvider({ children }: { children: ReactNode }) {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const [backendReady, setBackendReady] = useState(false);
  const [backendAuthError, setBackendAuthError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded) {
      setBackendReady(false);
      return;
    }

    if (!isSignedIn) {
      clearBackendSession();
      setBackendAuthError(null);
      setBackendReady(true);
      return;
    }

    let cancelled = false;

    (async () => {
      setBackendReady(false);
      setBackendAuthError(null);
      try {
        const clerkJwt = await getToken();
        if (!clerkJwt) {
          clearBackendSession();
          setBackendAuthError("Missing Clerk session token. Please sign in again.");
          return;
        }
        const pending = sessionStorage.getItem("pending_clerk_role");
        const role =
          pending === "candidat" || pending === "recruteur" ? pending : undefined;
        const result = await api.clerkSync(clerkJwt, role ? { role } : {});
        if (cancelled) return;
        if (role) sessionStorage.removeItem("pending_clerk_role");
        setToken(result.token);
        setStoredUser(result.user);
      } catch (error) {
        clearBackendSession();
        setBackendAuthError(
          error instanceof Error ? error.message : "Backend authentication failed."
        );
      } finally {
        if (!cancelled) setBackendReady(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isLoaded, isSignedIn, getToken]);

  return (
    <BackendAuthContext.Provider value={{ backendReady, backendAuthError }}>
      {children}
    </BackendAuthContext.Provider>
  );
}
