import {
  createContext,
  useContext,
  useMemo,
  useState,
} from "react";

import type {
  ReactNode,
} from "react";

import {
  getCurrentUser,
  login as loginService,
  logout as logoutService,
} from "../services/authService";

import type {
  AuthUser,
  LoginData,
} from "../services/authService";

interface AuthContextValue {
  user: AuthUser | null;
  authenticated: boolean;
  login: (
    loginData: LoginData
  ) => Promise<AuthUser>;
  logout: () => void;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext =
  createContext<AuthContextValue | null>(null);

export function AuthProvider({
  children,
}: AuthProviderProps) {
  const [user, setUser] =
    useState<AuthUser | null>(() =>
      getCurrentUser()
    );

  async function login(
    loginData: LoginData
  ): Promise<AuthUser> {
    const authenticatedUser =
      await loginService(loginData);

    setUser(authenticatedUser);

    return authenticatedUser;
  }

  function logout(): void {
    logoutService();
    setUser(null);
  }

  const contextValue =
    useMemo<AuthContextValue>(
      () => ({
        user,
        authenticated: user !== null,
        login,
        logout,
      }),
      [user]
    );

  return (
    <AuthContext.Provider
      value={contextValue}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth deve ser utilizado dentro de AuthProvider."
    );
  }

  return context;
}