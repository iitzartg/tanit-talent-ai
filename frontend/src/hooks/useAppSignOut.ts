import { useCallback } from "react";
import { useClerk } from "@clerk/react";
import { clearBackendSession } from "@/lib/auth";

export function useAppSignOut() {
  const { signOut } = useClerk();

  return useCallback(async () => {
    clearBackendSession();
    await signOut({ redirectUrl: "/auth" });
  }, [signOut]);
}
