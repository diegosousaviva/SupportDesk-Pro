import {
  Router,
  type Request,
  type Response,
} from "express";

import {
  findAllUsers,
} from "../repositories/userRepository.js";

import {
  authenticateUser,
} from "../services/authService.js";

import {
  authMiddleware,
} from "../middleware/authMiddleware.js";

const router =
  Router();

// ============================================================
// POST /api/auth/login
// ============================================================

router.post(
  "/login",
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const {
        email,
        password,
      } = req.body ?? {};

      if (
        typeof email !==
        "string"
      ) {
        return res.status(400).json({
          success:
            false,

          message:
            "E-mail é obrigatório.",
        });
      }

      if (
        typeof password !==
        "string"
      ) {
        return res.status(400).json({
          success:
            false,

          message:
            "Senha é obrigatória.",
        });
      }

      const users =
        findAllUsers();

      const result =
        await authenticateUser(
          users,
          {
            email,
            password,
          }
        );

      return res.status(200).json({
        success:
          true,

        message:
          "Login realizado com sucesso.",

        token:
          result.token,

        expiresAt:
          result.expiresAt,

        user:
          result.user,
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "E-mail ou senha inválidos.";

      return res.status(401).json({
        success:
          false,

        message,
      });
    }
  }
);

// ============================================================
// GET /api/auth/me
// ============================================================

router.get(
  "/me",
  authMiddleware,
  (
    _req: Request,
    res: Response
  ) => {
    return res.status(200).json({
      success:
        true,

      user:
        res.locals.authUser,
    });
  }
);

export default router;