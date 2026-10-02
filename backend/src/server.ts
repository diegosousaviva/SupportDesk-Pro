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
import type { RowDataPacket } from "mysql2";
import pool from "./database/mysql.js";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import dataRoutes from "./routes/dataRoutes.js";

const app = express();

const PORT =
  Number(process.env.PORT) || 3000;

const categoryIntegrationMode = process.env.SUPPORTDESK_CATEGORIES_TESTS === "1";

function assertCategoryIntegrationApi(): void {
  if (!categoryIntegrationMode) return;
  const apiAddress = process.env.LOCAL_TEST_API_URL?.trim();
  if (!apiAddress) throw new Error("Modo de integração exige LOCAL_TEST_API_URL explícita em loopback.");
  let url: URL;
  try {
    url = new URL(apiAddress);
  } catch {
    throw new Error("LOCAL_TEST_API_URL inválida para o modo de integração.");
  }
  const apiPort = url.port ? Number(url.port) : url.protocol === "http:" ? 80 : 443;
  if (url.protocol !== "http:"
    || url.hostname !== "127.0.0.1"
    || !url.port
    || Boolean(url.username || url.password || url.search || url.hash)
    || apiPort !== PORT) {
    throw new Error("Modo de integração exige LOCAL_TEST_API_URL=http://127.0.0.1 na mesma porta PORT, sem credenciais.");
  }
}

assertCategoryIntegrationApi();

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
app.use(express.json({ limit: "32mb" }));

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

if (categoryIntegrationMode) {
  // Local-only and enabled solely in the dedicated integration mode. No credentials are exposed.
  app.get("/api/test-config", async (_req, res) => {
    try {
      const [rows] = await pool.query<RowDataPacket[]>("SELECT DATABASE() AS activeDbName, @@port AS activeDbPort");
      const configuredDbName = process.env.DB_NAME?.trim();
      const configuredDbPort = Number(process.env.DB_PORT || 3306);
      const activeDbName = String(rows[0]?.activeDbName ?? "");
      const activeDbPort = Number(rows[0]?.activeDbPort);
      if (activeDbName !== configuredDbName || activeDbPort !== configuredDbPort) {
        return res.status(503).json({ success: false, message: "A conexão do backend não corresponde ao banco dedicado configurado." });
      }
      return res.json({
        testConfig: {
          integrationMode: true,
          dbHost: process.env.DB_HOST?.trim().toLowerCase(),
          dbPort: configuredDbPort,
          dbName: configuredDbName,
          activeDbName,
          activeDbPort,
          apiHost: "127.0.0.1",
          apiPort: PORT,
        },
      });
    } catch {
      return res.status(503).json({ success: false, message: "Não foi possível confirmar a conexão local do backend." });
    }
  });
}

app.use(
  "/api/categories",
  categoryRoutes
);

app.use(
  "/api/data",
  dataRoutes
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
    const statusCode =
      typeof error === "object" &&
      error !== null &&
      "status" in error &&
      typeof error.status === "number"
        ? error.status
        : 500;
    if (statusCode === 413) {
      return res.status(413).json({
        success: false,
        message: "A requisição excede o limite permitido. Anexos podem ter no máximo 20 MB.",
      });
    }
    if (statusCode === 400) {
      return res.status(400).json({
        success: false,
        message: "O corpo JSON da requisição é inválido.",
      });
    }
    console.error(
      "Erro interno da API:",
      error
    );

    res.status(statusCode).json({
      success: false,
      message:
        "Erro interno do servidor.",
    });
  }
);

/*
 * Inicialização
 */
const onListen = () => {
  console.log(`SupportDesk Pro API rodando em http://127.0.0.1:${PORT}`);
};

if (categoryIntegrationMode) {
  app.listen(PORT, "127.0.0.1", onListen);
} else {
  app.listen(PORT, onListen);
}
