import { Router, type NextFunction, type Request, type Response } from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { CategoryIntegrityLockError } from "../database/categoryIntegrityLock.js";
import {
  CategoryServiceError,
  createCategory,
  deleteCategory,
  getCategory,
  listCategories,
  updateCategory,
} from "../services/categoryService.js";

const router = Router();

function requireAdministrator(_req: Request, res: Response, next: NextFunction): void {
  const user = res.locals.authUser as { role?: string } | undefined;
  if (user?.role !== "Administrador") {
    res.status(403).json({ success: false, message: "Acesso permitido somente para administradores." });
    return;
  }
  next();
}

function parseId(value: string | string[] | undefined): number | undefined {
  if (typeof value !== "string") return undefined;
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : undefined;
}

function sendError(res: Response, error: unknown): void {
  if (error instanceof CategoryServiceError) {
    res.status(error.status).json({ success: false, message: error.message });
    return;
  }
  if (error instanceof CategoryIntegrityLockError) {
    res.status(503).json({ success: false, message: error.message });
    return;
  }
  console.error("Erro na API de categorias:", error);
  res.status(500).json({ success: false, message: "Não foi possível concluir a operação de categoria." });
}

router.use(authMiddleware);

router.get("/", async (_req, res) => {
  try {
    return res.json({ success: true, categories: await listCategories() });
  } catch (error) {
    sendError(res, error);
  }
});

router.get("/:id", async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ success: false, message: "ID de categoria inválido." });
  try {
    return res.json({ success: true, category: await getCategory(id) });
  } catch (error) {
    sendError(res, error);
  }
});

router.post("/", requireAdministrator, async (req, res) => {
  try {
    const category = await createCategory(req.body);
    return res.status(201).json({ success: true, category });
  } catch (error) {
    sendError(res, error);
  }
});

router.put("/:id", requireAdministrator, async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ success: false, message: "ID de categoria inválido." });
  try {
    return res.json({ success: true, category: await updateCategory(id, req.body) });
  } catch (error) {
    sendError(res, error);
  }
});

router.delete("/:id", requireAdministrator, async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ success: false, message: "ID de categoria inválido." });
  try {
    await deleteCategory(id);
    return res.json({ success: true });
  } catch (error) {
    sendError(res, error);
  }
});

export default router;
