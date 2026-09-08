import cors from "cors";
import dotenv from "dotenv";
import express, {
  type ErrorRequestHandler,
  type Request,
  type Response,
} from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import authRoutes from "./routes/authRoutes.js";

dotenv.config();

const app =
  express();

const PORT =
  Number(
    process.env.PORT
  ) || 3000;

const FRONTEND_URL =
  process.env.FRONTEND_URL ||
  "http://localhost:5173";

// ============================================================
// Segurança
// ============================================================

app.disable(
  "x-powered-by"
);

app.use(
  helmet()
);

const apiRateLimiter =
  rateLimit({
    windowMs:
      15 * 60 * 1000,

    limit:
      100,

    standardHeaders:
      "draft-8",

    legacyHeaders:
      false,

    message: {
      success:
        false,

      message:
        "Muitas requisições foram realizadas. Tente novamente mais tarde.",
    },
  });

app.use(
  "/api",
  apiRateLimiter
);

// ============================================================
// CORS
// ============================================================

app.use(
  cors({
    origin:
      FRONTEND_URL,

    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS",
    ],

    allowedHeaders: [
      "Content-Type",
      "Authorization",
    ],
  })
);

// ============================================================
// Body Parser
// ============================================================

app.use(
  express.json({
    limit:
      "1mb",
  })
);

// ============================================================
// Rota principal
// ============================================================

app.get(
  "/",
  (
    _req: Request,
    res: Response
  ) => {
    res.status(200).json({
      name:
        "SupportDesk Pro API",

      version:
        "1.0.0",

      status:
        "online",
    });
  }
);

// ============================================================
// Health Check
// ============================================================

app.get(
  "/api/health",
  (
    _req: Request,
    res: Response
  ) => {
    res.status(200).json({
      success:
        true,

      message:
        "SupportDesk Pro API está funcionando.",

      timestamp:
        new Date().toISOString(),
    });
  }
);

// ============================================================
// Autenticação
// ============================================================

app.use(
  "/api/auth",
  authRoutes
);

// ============================================================
// Rota 404
// ============================================================

app.use(
  (
    _req: Request,
    res: Response
  ) => {
    res.status(404).json({
      success:
        false,

      message:
        "Rota não encontrada.",
    });
  }
);

// ============================================================
// Tratamento centralizado de erros
// ============================================================

const errorHandler:
  ErrorRequestHandler =
  (
    error,
    _req,
    res,
    _next
  ) => {
    console.error(
      "Erro interno da API:",
      error
    );

    res.status(500).json({
      success:
        false,

      message:
        "Erro interno do servidor.",
    });
  };

app.use(
  errorHandler
);

// ============================================================
// Inicialização
// ============================================================

app.listen(
  PORT,
  () => {
    console.log(
      `SupportDesk Pro API rodando em http://localhost:${PORT}`
    );
  }
);