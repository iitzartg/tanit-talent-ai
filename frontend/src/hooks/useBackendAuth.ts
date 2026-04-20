import { useContext } from "react";
import { BackendAuthContext } from "@/context/backendAuthContext";

export function useBackendAuth() {
  return useContext(BackendAuthContext);
}
