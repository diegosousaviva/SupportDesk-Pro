import {
  Router,
  type Request,
  type Response,
} from "express";

import {
  authMiddleware,
} from "../middleware/authMiddleware.js";

import {
  createUserService,
  deleteUserService,
  getUserByIdService,
  listUsersService,
  updateUserService,
} from "../services/userService.js";

import type {
  User,
} from "../types/user.js";

const router =
  Router();

function requireAdministrator(
  req: Request,
  res: Response,
  next: () => void
): void {
  const authUser =
    res.locals.authUser;

  if (
    !authUser ||
    authUser.role !==
      "Administrador"
  ) {
    res.status(403).json({
      success:
        false,

      message:
        "Acesso permitido somente para administradores.",
    });

    return;
  }

  next();
}

/**
 * Remove informações sensíveis antes
 * de enviar um usuário para o frontend.
 *
 * A senha nunca deve ser exposta pela API,
 * nem mesmo na forma de hash.
 */
function sanitizeUser(
  user: User
): Omit<User, "password"> {
  const {
    password: _password,
    ...safeUser
  } = user;

  return safeUser;
}

// ============================================================
// Todas as rotas de usuários exigem autenticação
// ============================================================

router.use(
  authMiddleware
);

router.use(
  requireAdministrator
);

// ============================================================
// GET /api/users
// ============================================================

router.get(
  "/",
  async (
    _req: Request,
    res: Response
  ) => {
    try {
      const users =
        await listUsersService();

      const sanitizedUsers =
        users.map(
          sanitizeUser
        );

      return res.status(200).json({
        success:
          true,

        users:
          sanitizedUsers,
      });
    } catch (error) {
      console.error(
        "Erro ao listar usuários:",
        error
      );

      return res.status(500).json({
        success:
          false,

        message:
          "Não foi possível listar os usuários.",
      });
    }
  }
);

// ============================================================
// GET /api/users/:id
// ============================================================

router.get(
  "/:id",
  async (
    req: Request,
    res: Response
  ) => {
    const id =
      Number(
        req.params.id
      );

    if (
      !Number.isInteger(
        id
      ) ||
      id <= 0
    ) {
      return res.status(400).json({
        success:
          false,

        message:
          "ID de usuário inválido.",
      });
    }

    try {
      const user =
        await getUserByIdService(
          id
        );

      return res.status(200).json({
        success:
          true,

        user:
          sanitizeUser(
            user
          ),
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Usuário não encontrado.";

      return res.status(404).json({
        success:
          false,

        message,
      });
    }
  }
);

// ============================================================
// POST /api/users
// ============================================================

router.post(
  "/",
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const body =
        req.body ?? {};

      const {
        name,
        email,
        password,
        phone,
        department,
        role,
        storeId,
        status,
      } = body;

      if (
        typeof name !==
        "string"
      ) {
        return res.status(400).json({
          success:
            false,

          message:
            "Nome é obrigatório.",
        });
      }

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

      if (
        typeof role !==
        "string"
      ) {
        return res.status(400).json({
          success:
            false,

          message:
            "Perfil de acesso é obrigatório.",
        });
      }

      if (
        typeof status !==
        "string"
      ) {
        return res.status(400).json({
          success:
            false,

          message:
            "Status é obrigatório.",
        });
      }

      if (
        phone !==
          undefined &&
        typeof phone !==
          "string"
      ) {
        return res.status(400).json({
          success:
            false,

          message:
            "Telefone inválido.",
        });
      }

      if (
        department !==
          undefined &&
        typeof department !==
          "string"
      ) {
        return res.status(400).json({
          success:
            false,

          message:
            "Departamento inválido.",
        });
      }

      if (
        storeId !==
          undefined &&
        storeId !==
          null &&
        typeof storeId !==
          "number"
      ) {
        return res.status(400).json({
          success:
            false,

          message:
            "Loja inválida.",
        });
      }

      const user =
        await createUserService({
          name,

          email,

          password,

          phone,

          department,

          role:
            role as User["role"],

          storeId,

          status:
            status as User["status"],

          createdAt:
            new Date().toISOString(),
        });

      return res.status(201).json({
        success:
          true,

        message:
          "Usuário criado com sucesso.",

        user:
          sanitizeUser(
            user
          ),
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Não foi possível criar o usuário.";

      return res.status(400).json({
        success:
          false,

        message,
      });
    }
  }
);

// ============================================================
// PUT /api/users/:id
// ============================================================

router.put(
  "/:id",
  async (
    req: Request,
    res: Response
  ) => {
    const id =
      Number(
        req.params.id
      );

    if (
      !Number.isInteger(
        id
      ) ||
      id <= 0
    ) {
      return res.status(400).json({
        success:
          false,

        message:
          "ID de usuário inválido.",
      });
    }

    try {
      const body =
        req.body ?? {};

      const {
        name,
        email,
        password,
        phone,
        department,
        role,
        storeId,
        status,
      } = body;

      if (
        name !==
          undefined &&
        typeof name !==
          "string"
      ) {
        return res.status(400).json({
          success:
            false,

          message:
            "Nome inválido.",
        });
      }

      if (
        email !==
          undefined &&
        typeof email !==
          "string"
      ) {
        return res.status(400).json({
          success:
            false,

          message:
            "E-mail inválido.",
        });
      }

      if (
        password !==
          undefined &&
        typeof password !==
          "string"
      ) {
        return res.status(400).json({
          success:
            false,

          message:
            "Senha inválida.",
        });
      }

      if (
        phone !==
          undefined &&
        typeof phone !==
          "string"
      ) {
        return res.status(400).json({
          success:
            false,

          message:
            "Telefone inválido.",
        });
      }

      if (
        department !==
          undefined &&
        typeof department !==
          "string"
      ) {
        return res.status(400).json({
          success:
            false,

          message:
            "Departamento inválido.",
        });
      }

      if (
        role !==
          undefined &&
        typeof role !==
          "string"
      ) {
        return res.status(400).json({
          success:
            false,

          message:
            "Perfil de acesso inválido.",
        });
      }

      if (
        status !==
          undefined &&
        typeof status !==
          "string"
      ) {
        return res.status(400).json({
          success:
            false,

          message:
            "Status inválido.",
        });
      }

      if (
        storeId !==
          undefined &&
        storeId !==
          null &&
        typeof storeId !==
          "number"
      ) {
        return res.status(400).json({
          success:
            false,

          message:
            "Loja inválida.",
        });
      }

      const user =
        await updateUserService(
          id,
          {
            name,

            email,

            password,

            phone,

            department,

            role:
              role as
                | User["role"]
                | undefined,

            storeId,

            status:
              status as
                | User["status"]
                | undefined,
          }
        );

      return res.status(200).json({
        success:
          true,

        message:
          "Usuário atualizado com sucesso.",

        user:
          sanitizeUser(
            user
          ),
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Não foi possível atualizar o usuário.";

      const statusCode =
        message ===
        "Usuário não encontrado."
          ? 404
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
// DELETE /api/users/:id
// ============================================================

router.delete(
  "/:id",
  async (
    req: Request,
    res: Response
  ) => {
    const id =
      Number(
        req.params.id
      );

    if (
      !Number.isInteger(
        id
      ) ||
      id <= 0
    ) {
      return res.status(400).json({
        success:
          false,

        message:
          "ID de usuário inválido.",
      });
    }

    const authenticatedUser =
      res.locals.authUser;

    if (
      authenticatedUser?.id ===
      id
    ) {
      return res.status(400).json({
        success:
          false,

        message:
          "O administrador não pode excluir o próprio usuário.",
      });
    }

    try {
      await deleteUserService(
        id
      );

      return res.status(200).json({
        success:
          true,

        message:
          "Usuário excluído com sucesso.",
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Não foi possível excluir o usuário.";

      const statusCode =
        message ===
        "Usuário não encontrado."
          ? 404
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

export default router;
