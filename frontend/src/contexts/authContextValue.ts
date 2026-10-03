import { createContext } from "react";
import type { AuthUser, LoginData, LogoutReason } from "../services/authService";

export interface AuthContextValue {
  user: AuthUser | null;
  authenticated: boolean;
  login: (loginData: LoginData) => Promise<AuthUser>;
  logout: (reason?: LogoutReason) => void;
  refreshUser: (user: AuthUser) => void;
  storeRevision: number;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
