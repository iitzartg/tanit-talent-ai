import { createContext } from "react";

export type BackendAuthContextValue = {
  backendReady: boolean;
  backendAuthError: string | null;
};

export const BackendAuthContext = createContext<BackendAuthContextValue>({
  backendReady: false,
  backendAuthError: null,
});
