import {
  Router,
  type Request,
  type Response,
  type NextFunction,
} from "express";

import {
  findAllUsers,
} from "../repositories/userRepository.js";

import {
  authenticateUser,
} from "../services/authService.js";

import {
  changeOwnPasswordService,
} from "../services/userService.js";

import {
  authMiddleware,
} from "../middleware/authMiddleware.js";

const router =
  Router();

// ============================================================
// Segurança de cache
// ============================================================
//
// As respostas de autenticação não devem ser armazenadas
// pelo navegador, proxy ou qualquer cache intermediário.
//
// Isso é especialmente importante para:
// - tokens de sessão;
// - dados do usuário autenticado;
// - validação de sessão em /api/auth/me;
// - alteração de senha.
//
// ============================================================

router.use(
  (
    _req: Request,
    res: Response,
    next: NextFunction
  ) => {
    res.setHeader(
      "Cache-Control",
      "no-store"
    );

    next();
  }
);

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
// POST /api/auth/change-password
// ============================================================
//
// Permite que o próprio usuário altere sua senha.
//
// Esta rota NÃO exige perfil de administrador.
// O ID do usuário é obtido através da sessão autenticada,
// nunca através do corpo da requisição.
// ============================================================

router.post(
  "/change-password",
  authMiddleware,
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const authenticatedUser =
        res.locals.authUser;

      if (
        !authenticatedUser
      ) {
        return res.status(401).json({
          success:
            false,

          message:
            "Usuário não autenticado.",
        });
      }

      const {
        currentPassword,
        newPassword,
      } =
        req.body ?? {};

      if (
        typeof currentPassword !==
        "string"
      ) {
        return res.status(400).json({
          success:
            false,

          message:
            "A senha atual é obrigatória.",
        });
      }

      if (
        typeof newPassword !==
        "string"
      ) {
        return res.status(400).json({
          success:
            false,

          message:
            "A nova senha é obrigatória.",
        });
      }

      const updatedUser =
        await changeOwnPasswordService(
          authenticatedUser.id,
          currentPassword,
          newPassword
        );

      return res.status(200).json({
        success:
          true,

        message:
          "Senha alterada com sucesso.",

        user: {
          id:
            updatedUser.id,

          name:
            updatedUser.name,

          email:
            updatedUser.email,

          phone:
            updatedUser.phone,

          department:
            updatedUser.department,

          role:
            updatedUser.role,

          storeId:
            updatedUser.storeId,

          status:
            updatedUser.status,

          createdAt:
            updatedUser.createdAt,

          mustChangePassword:
            updatedUser.mustChangePassword,
        },
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Não foi possível alterar a senha.";

      const statusCode =
        message ===
          "Usuário não encontrado."
          ? 404
          : message ===
              "A senha atual está incorreta."
            ? 400
            : 400;

      return res.status(
        statusCode
      ).json({
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