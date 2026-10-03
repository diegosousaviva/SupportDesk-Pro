import {
  useCallback,
  useMemo,
  useState,
  useEffect,
} from "react";

import type {
  ReactNode,
} from "react";
import { AuthContext } from "./authContextValue";
import type { AuthContextValue } from "./authContextValue";

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
import { refreshStores } from "../repositories/storeRepository";
import { refreshTickets } from "../repositories/ticketRepository";
import { refreshTicketComments } from "../repositories/ticketCommentRepository";
import { refreshTicketHistory } from "../repositories/ticketHistoryRepository";
import { refreshInventoryItems } from "../repositories/inventoryRepository";
import { refreshNotes } from "../repositories/noteRepository";
import { refreshUsers } from "../repositories/userRepository";
import { refreshInventoryHistory } from "../repositories/inventoryHistoryRepository";
import { refreshSettings } from "../services/settingsService";

interface AuthProviderProps {
  children: ReactNode;
}

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

  const [storeRevision, setStoreRevision] = useState(0);

  useEffect(() => {
    if (!user) return;
    let active = true;
    void Promise.allSettled([refreshUsers(user), refreshStores(), refreshTickets(), refreshTicketComments(), refreshTicketHistory(), refreshInventoryItems(), refreshInventoryHistory(), refreshNotes(), refreshSettings()])
      .then((results) => {
        for (const result of results) if (result.status === "rejected") console.error("Não foi possível carregar os dados centrais.", result.reason);
        if (active) setStoreRevision((revision) => revision + 1);
      });
    return () => { active = false; };
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const refreshSharedData = async () => {
      const results = await Promise.allSettled([
        refreshUsers(user),
        refreshStores(),
        refreshTickets(),
        refreshTicketComments(),
        refreshTicketHistory(),
        refreshInventoryItems(),
        refreshInventoryHistory(),
        refreshNotes(),
        refreshSettings(),
      ]);
      if (results.some((result) => result.status === "fulfilled")) {
        setStoreRevision((revision) => revision + 1);
      }
      for (const result of results) {
        if (result.status === "rejected") console.error("Não foi possível atualizar os dados compartilhados.", result.reason);
      }
    };
    const interval = window.setInterval(() => { void refreshSharedData(); }, 60_000);
    return () => window.clearInterval(interval);
  }, [user]);

  const login =
    useCallback(
      async (
        loginData: LoginData
      ): Promise<AuthUser> => {
        const authenticatedUser =
          await loginService(
            loginData
          );

        const preload = await Promise.allSettled([refreshUsers(authenticatedUser), refreshStores(), refreshTickets(), refreshTicketComments(), refreshTicketHistory(), refreshInventoryItems(), refreshInventoryHistory(), refreshNotes(), refreshSettings()]);
        for (const result of preload) if (result.status === "rejected") console.error("Não foi possível pré-carregar dados compartilhados.", result.reason);
        setStoreRevision((revision) => revision + 1);

        setUser(
          authenticatedUser
        );

        return authenticatedUser;
      },
      []
    );

  const logout =
    useCallback(
      (
        reason: LogoutReason =
          "manual"
      ): void => {
        logoutService(
          reason
        );

        setUser(
          null
        );
      },
      []
    );

  const refreshUser =
    useCallback(
      (
        refreshedUser: AuthUser
      ): void => {
        updateCurrentSessionUser(
          refreshedUser
        );

        setUser(
          refreshedUser
        );
      },
      []
    );

  const authenticated =
    user !== null;

  const contextValue =
    useMemo<AuthContextValue>(
      () => ({
        user,

        authenticated,

        login,

        logout,

        refreshUser,
        storeRevision,
      }),
      [
        user,
        authenticated,
        login,
        logout,
        refreshUser,
        storeRevision,
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
