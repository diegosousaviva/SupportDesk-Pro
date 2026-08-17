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
  LogoutReason,
} from "../services/authService";

import {
  updateCurrentSessionUser,
} from "../services/sessionService";

interface AuthContextValue {
  user: AuthUser | null;

  authenticated: boolean;

  login: (
    loginData: LoginData
  ) => Promise<AuthUser>;

  logout: (
    reason?: LogoutReason
  ) => void;

  refreshUser: (
    user: AuthUser
  ) => void;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext =
  createContext<AuthContextValue | null>(
    null
  );

export function AuthProvider({
  children,
}: AuthProviderProps) {
  const [
    user,
    setUser,
  ] =
    useState<AuthUser | null>(
      () =>
        getCurrentUser()
    );

  async function login(
    loginData: LoginData
  ): Promise<AuthUser> {
    const authenticatedUser =
      await loginService(
        loginData
      );

    setUser(
      authenticatedUser
    );

    return authenticatedUser;
  }

  function logout(
    reason: LogoutReason =
      "manual"
  ): void {
    logoutService(
      reason
    );

    setUser(
      null
    );
  }

  function refreshUser(
    refreshedUser: AuthUser
  ): void {
    updateCurrentSessionUser(
      refreshedUser
    );

    setUser(
      refreshedUser
    );
  }

  const contextValue =
    useMemo<AuthContextValue>(
      () => ({
        user,

        authenticated:
          user !==
          null,

        login,

        logout,

        refreshUser,
      }),
      [
        user,
      ]
    );

  return (
    <AuthContext.Provider
      value={
        contextValue
      }
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth():
  AuthContextValue {
  const context =
    useContext(
      AuthContext
    );

  if (!context) {
    throw new Error(
      "useAuth deve ser utilizado dentro de AuthProvider."
    );
  }

  return context;
}