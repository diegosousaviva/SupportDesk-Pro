import "dotenv/config";

import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import type {
  NextFunction,
  Request,
  Response,
} from "express";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";

const app = express();

const PORT =
  Number(process.env.PORT) || 3000;

const FRONTEND_URL =
  process.env.FRONTEND_URL ||
  "http://localhost:5173";

/*
 * Segurança HTTP
 */
app.use(
  helmet()
);

/*
 * CORS
 */
app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
  })
);

/*
 * JSON
 */
app.use(
  express.json()
);

/*
 * Rate limit global da API
 *
 * O limite global protege as demais rotas
 * contra excesso de requisições.
 *
 * A rota /health fica fora desse limite.
 * As rotas de autenticação possuem um
 * limite próprio mais adequado.
 */
const apiRateLimiter =
  rateLimit({
    windowMs:
      15 * 60 * 1000,

    limit: 300,

    standardHeaders:
      "draft-8",

    legacyHeaders:
      false,

    skip: (req) => {
      return req.path === "/health";
    },

    message: {
      success: false,
      message:
        "Muitas requisições. Tente novamente em alguns minutos.",
    },
  });

/*
 * Rate limit específico para autenticação.
 *
 * O /api/auth/me é consultado automaticamente
 * pelo frontend para validar a sessão.
 *
 * Como essa verificação ocorre a cada 30 segundos,
 * precisamos de um limite maior que o usado para
 * tentativas de login, mas ainda suficiente para
 * proteger a API contra abuso.
 */
const authRateLimiter =
  rateLimit({
    windowMs:
      15 * 60 * 1000,

    limit: 60,

    standardHeaders:
      "draft-8",

    legacyHeaders:
      false,

    message: {
      success: false,
      message:
        "Muitas requisições de autenticação. Tente novamente em alguns minutos.",
    },
  });

/*
 * Rate limit da API.
 *
 * O /health é ignorado pelo próprio limiter.
 */
app.use(
  "/api",
  apiRateLimiter
);

/*
 * Autenticação
 *
 * O rate limit específico é aplicado
 * antes das rotas de autenticação.
 */
app.use(
  "/api/auth",
  authRateLimiter,
  authRoutes
);

/*
 * Usuários
 */
app.use(
  "/api/users",
  userRoutes
);

/*
 * Rota principal
 */
app.get(
  "/",
  (
    _req: Request,
    res: Response
  ) => {
    res.json({
      success: true,
      message:
        "SupportDesk Pro API está funcionando.",
    });
  }
);

/*
 * Health check
 *
 * Esta rota não consome o rate limit global.
 */
app.get(
  "/api/health",
  (
    _req: Request,
    res: Response
  ) => {
    res.status(200).json({
      success: true,
      message:
        "SupportDesk Pro API está saudável.",
      timestamp:
        new Date().toISOString(),
    });
  }
);

/*
 * Rota não encontrada
 */
app.use(
  (
    _req: Request,
    res: Response
  ) => {
    res.status(404).json({
      success: false,
      message:
        "Rota não encontrada.",
    });
  }
);

/*
 * Tratamento central de erros
 */
app.use(
  (
    error: unknown,
    _req: Request,
    res: Response,
    _next: NextFunction
  ) => {
    console.error(
      "Erro interno da API:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Erro interno do servidor.",
    });
  }
);

/*
 * Inicialização
 */
app.listen(
  PORT,
  () => {
    console.log(
      `SupportDesk Pro API rodando em http://localhost:${PORT}`
    );
  }
);