import type {
  NextFunction,
  Request,
  Response,
} from "express";

import {
  getSessionUser,
} from "../services/sessionService.js";

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const authorization =
    req.headers.authorization;

  if (
    typeof authorization !==
    "string"
  ) {
    res.status(401).json({
      success:
        false,

      message:
        "Token de autenticação não informado.",
    });

    return;
  }

  const [
    scheme,
    token,
  ] =
    authorization.trim().split(
      /\s+/
    );

  if (
    scheme?.toLowerCase() !==
      "bearer" ||
    !token
  ) {
    res.status(401).json({
      success:
        false,

      message:
        "Token de autenticação inválido.",
    });

    return;
  }

  const user =
    getSessionUser(
      token
    );

  if (!user) {
    res.status(401).json({
      success:
        false,

      message:
        "Sessão inválida ou expirada. Faça login novamente.",
    });

    return;
  }

  res.locals.authUser =
    user;

  next();
}