import {
  randomBytes,
} from "node:crypto";

import type {
  AuthUser,
} from "./authService.js";

const SESSION_DURATION_MS =
  8 * 60 * 60 * 1000;

interface Session {
  token: string;

  user: AuthUser;

  createdAt: string;

  expiresAt: string;
}

const sessions =
  new Map<
    string,
    Session
  >();

function generateToken(): string {
  return randomBytes(
    32
  ).toString(
    "hex"
  );
}

function isSessionExpired(
  session: Session
): boolean {
  return (
    Date.now() >=
    new Date(
      session.expiresAt
    ).getTime()
  );
}

function removeExpiredSessions(): void {
  for (
    const [
      token,
      session,
    ] of sessions
  ) {
    if (
      isSessionExpired(
        session
      )
    ) {
      sessions.delete(
        token
      );
    }
  }
}

export function createSession(
  user: AuthUser
): {
  token: string;

  expiresAt: string;
} {
  removeExpiredSessions();

  const token =
    generateToken();

  const createdAt =
    new Date();

  const expiresAt =
    new Date(
      createdAt.getTime() +
        SESSION_DURATION_MS
    );

  sessions.set(
    token,
    {
      token,

      user,

      createdAt:
        createdAt.toISOString(),

      expiresAt:
        expiresAt.toISOString(),
    }
  );

  return {
    token,

    expiresAt:
      expiresAt.toISOString(),
  };
}

export function getSession(
  token: string
):
  Session | null {
  removeExpiredSessions();

  const session =
    sessions.get(
      token
    );

  if (!session) {
    return null;
  }

  if (
    isSessionExpired(
      session
    )
  ) {
    sessions.delete(
      token
    );

    return null;
  }

  return session;
}

export function getSessionUser(
  token: string
):
  AuthUser | null {
  const session =
    getSession(
      token
    );

  return (
    session?.user ??
    null
  );
}

export function destroySession(
  token: string
): boolean {
  return sessions.delete(
    token
  );
}

export function destroyUserSessions(
  userId: number
): number {
  let removed =
    0;

  for (
    const [
      token,
      session,
    ] of sessions
  ) {
    if (
      session.user.id ===
      userId
    ) {
      sessions.delete(
        token
      );

      removed +=
        1;
    }
  }

  return removed;
}