import { Router, type Request, type Response } from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { findUserById, hasUsersForStore } from "../repositories/userRepository.js";
import { findActiveCategoryByName } from "../services/categoryService.js";
import { CategoryIntegrityLockError, withCategoryIntegrityLock } from "../database/categoryIntegrityLock.js";
import type { PoolConnection } from "mysql2/promise";
import { preserveUnchangedTicketCategory } from "../utils/categoryName.js";
import { withSettingsIntegrityLock, SettingsIntegrityLockError } from "../database/settingsIntegrityLock.js";
import {
  findRecord,
  hasRecordReference,
  insertRecord,
  listRecords,
  removeRecord,
  removeTicketAggregate,
  removeNoteAggregate,
  replaceRecord,
  findRecordOnConnection,
  insertRecordOnConnection,
  listRecordsOnConnection,
  replaceRecordOnConnection,
  type RecordEntity,
} from "../repositories/recordRepository.js";

const router = Router();
const entities = new Set<RecordEntity>([
  "stores", "tickets", "ticket-comments", "ticket-history",
  "inventory", "inventory-history", "notes", "note-attachments", "user-history", "settings",
  "audit-logs", "notifications", "sla-notification-dismissals",
]);

router.use(authMiddleware);

function entityFrom(req: Request, res: Response): RecordEntity | undefined {
  const entity = req.params.entity as RecordEntity;
  if (!entities.has(entity)) {
    res.status(404).json({ success: false, message: "Unknown resource." });
    return undefined;
  }
  return entity;
}

function currentUser(req: Request, res: Response): { id: number; role: string } | undefined {
  const user = res.locals.authUser as { id?: unknown; role?: unknown } | undefined;
  if (!user || typeof user.id !== "number" || typeof user.role !== "string") {
    res.status(401).json({ success: false, message: "Invalid session." });
    return undefined;
  }
  return { id: user.id, role: user.role };
}

function canReadEntity(entity: RecordEntity, role: string): boolean {
  if (role === "Administrador") return true;
  if (entity === "settings") return true;
  if (["tickets", "ticket-comments", "ticket-history", "notes", "note-attachments", "notifications", "sla-notification-dismissals"].includes(entity)) return true;
  if (role === "Solicitante" && entity === "stores") return true;
  return role === "Técnico" && ["stores", "inventory", "inventory-history"].includes(entity);
}

function ticketBelongsToUser(payload: Record<string, unknown>, userId: number): boolean {
  return payload.requesterUserId === userId || payload.assignedTechnicianId === userId;
}

const MAX_ATTACHMENT_BYTES = 20 * 1024 * 1024;
const ALLOWED_ATTACHMENT_EXTENSIONS = new Set([
  "pdf", "doc", "docx", "xls", "xlsx", "csv", "txt", "jpg", "jpeg", "png", "webp",
]);

async function validateReferences(
  entity: RecordEntity,
  payload: Record<string, unknown>,
  existingPayload?: Record<string, unknown>,
  connection?: PoolConnection,
): Promise<string | undefined> {
  const isValidDateOnly = (value: unknown): value is string => {
    if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const [year, month, day] = value.split("-").map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
  };
  const existingId = async (target: RecordEntity, value: unknown): Promise<boolean> => {
    const id = Number(value);
    return Number.isSafeInteger(id) && id > 0 && Boolean(await findRecord(target, id));
  };
  const validOptionalId = (value: unknown): boolean => value === null || value === undefined || (typeof value === "number" && Number.isSafeInteger(value) && value > 0);

  if (entity === "inventory" || entity === "tickets") {
    if (!validOptionalId(payload.storeId)) return "Invalid store reference.";
    if (payload.storeId != null && !(await existingId("stores", payload.storeId))) return "The selected store does not exist.";
  }
  if (entity === "notes") {
    if (!validOptionalId(payload.storeId)) return "Invalid store reference.";
    if (payload.storeId != null && !(await existingId("stores", payload.storeId))) return "The selected store does not exist.";
    if (payload.amount !== null && payload.amount !== undefined && (typeof payload.amount !== "number" || !Number.isFinite(payload.amount) || payload.amount < 0 || Math.round(payload.amount * 100) !== payload.amount * 100)) return "Note amount must be a non-negative value with at most two decimal places.";
    if (payload.noteDate !== undefined && !isValidDateOnly(payload.noteDate)) return "Note date must be a valid calendar date in YYYY-MM-DD format.";
  }
  if (entity === "inventory") {
    if (!Number.isSafeInteger(Number(payload.storeId)) || Number(payload.storeId) < 1) return "An inventory item requires a valid store.";
    if (!validOptionalId(payload.responsibleUserId)) return "Invalid responsible user reference.";
    if (payload.responsibleUserId != null && !(await findUserById(Number(payload.responsibleUserId)))) return "The responsible user does not exist.";
  }
  if (entity === "tickets") {
    const categoryChange = existingPayload
      ? preserveUnchangedTicketCategory(existingPayload.category, payload.category)
      : { changed: true, value: typeof payload.category === "string" ? payload.category.trim() : "" };
    const categoryName = categoryChange.value;
    if (!categoryName || categoryName.length > 80) return "A ticket category is required and must contain at most 80 characters.";
    // Preserve an existing historical string exactly when only its formatting differs.
    payload.category = categoryName;
    if (categoryChange.changed) {
      const category = await findActiveCategoryByName(categoryName, connection);
      if (!category) return "The selected ticket category does not exist or is inactive.";
      payload.category = category.name;
    }
    if (typeof payload.requesterUserId !== "number" || !Number.isSafeInteger(payload.requesterUserId) || !(await findUserById(payload.requesterUserId))) return "The requester does not exist.";
    if (!validOptionalId(payload.assignedTechnicianId)) return "Invalid technician reference.";
    if (payload.assignedTechnicianId != null) {
      const technician = await findUserById(Number(payload.assignedTechnicianId));
      if (!technician || technician.role !== "Técnico" || technician.status !== "Ativo") return "The assigned user is not an active technician.";
    }
    if (!validOptionalId(payload.inventoryItemId)) return "Invalid inventory reference.";
    if (payload.inventoryItemId != null) {
      const inventory = await findRecord<Record<string, unknown>>("inventory", Number(payload.inventoryItemId));
      if (!inventory) return "The linked inventory item does not exist.";
      if (payload.storeId != null && Number(inventory.payload.storeId) !== Number(payload.storeId)) return "The linked inventory item belongs to another store.";
    }
  }
  if (entity === "ticket-comments" || entity === "ticket-history") {
    if (typeof payload.ticketId !== "number" || !Number.isSafeInteger(payload.ticketId) || !(await findRecord("tickets", payload.ticketId))) return "The target ticket does not exist.";
  }
  if (entity === "ticket-comments") {
    const message = typeof payload.message === "string" ? payload.message.trim() : "";
    if (!message || message.length > 5000) return "Comments must contain 1 to 5,000 characters.";
  }
  if (entity === "ticket-history") {
    const eventTypes = new Set([
      "ticket_created", "title_changed", "description_changed", "category_changed",
      "priority_changed", "status_changed", "technician_changed", "comment_added",
      "equipment_linked", "equipment_unlinked", "equipment_changed", "ticket_closed", "ticket_reopened",
    ]);
    if (typeof payload.eventType !== "string" || !eventTypes.has(payload.eventType)) return "Invalid ticket history event type.";
    if (typeof payload.description !== "string" || !payload.description.trim() || payload.description.length > 2000) return "Ticket history description must contain 1 to 2,000 characters.";
  }
  if (entity === "user-history") {
    const actions = new Set(["created", "updated", "role_changed", "activated", "deactivated", "deleted"]);
    if (!Number.isSafeInteger(payload.userId) || Number(payload.userId) < 1) return "Invalid user history reference.";
    if (typeof payload.action !== "string" || !actions.has(payload.action)) return "Invalid user history action.";
    if (typeof payload.title !== "string" || !payload.title.trim() || payload.title.length > 255) return "A user history title is required and must contain at most 255 characters.";
    if (typeof payload.description !== "string" || !payload.description.trim() || payload.description.length > 2000) return "A user history description is required and must contain at most 2,000 characters.";
  }
  if (entity === "audit-logs") {
    const modules = new Set(["Autenticação", "Chamados", "Inventário", "Usuários", "Lojas", "Notas", "Categorias", "Configurações"]);
    const actions = new Set(["Login", "Logout", "Falha de login", "Bloqueio de login", "Sessão expirada", "Sessão invalidada", "Senha alterada", "Criação", "Edição", "Exclusão", "Alteração de status", "Alteração de responsável", "Vinculação", "Desvinculação", "Upload", "Download", "Impressão"]);
    if (typeof payload.module !== "string" || !modules.has(payload.module)) return "Invalid audit module.";
    if (typeof payload.action !== "string" || !actions.has(payload.action)) return "Invalid audit action.";
    if (typeof payload.description !== "string" || !payload.description.trim() || payload.description.length > 2000) return "An audit description is required and must contain at most 2,000 characters.";
    if (payload.details !== undefined && (typeof payload.details !== "string" || payload.details.length > 5000)) return "Audit details must contain at most 5,000 characters.";
    if (payload.entityId !== null && payload.entityId !== undefined && (!Number.isSafeInteger(payload.entityId) || Number(payload.entityId) < 1)) return "Invalid audit entity reference.";
  }
  if (entity === "notifications") {
    const types = new Set(["ticket_created", "ticket_assigned", "status_changed", "ticket_resolved", "ticket_reopened", "comment_added", "sla_warning", "sla_expired"]);
    const severities = new Set(["info", "success", "warning", "error"]);
    if (typeof payload.title !== "string" || !payload.title.trim() || payload.title.length > 255) return "A notification title is required and must contain at most 255 characters.";
    if (typeof payload.message !== "string" || !payload.message.trim() || payload.message.length > 5000) return "A notification message is required and must contain at most 5,000 characters.";
    if (typeof payload.type !== "string" || !types.has(payload.type)) return "Invalid notification type.";
    if (typeof payload.severity !== "string" || !severities.has(payload.severity)) return "Invalid notification severity.";
    if (typeof payload.read !== "boolean") return "Invalid notification read state.";
    if (!Number.isSafeInteger(payload.userId) || Number(payload.userId) < 1 || !(await findUserById(Number(payload.userId)))) return "The notification recipient does not exist.";
    if (payload.ticketId !== null && payload.ticketId !== undefined) {
      if (!Number.isSafeInteger(payload.ticketId) || Number(payload.ticketId) < 1 || !(await findRecord("tickets", Number(payload.ticketId)))) return "The target ticket does not exist.";
    }
  }
  if (entity === "sla-notification-dismissals") {
    const validTypes = new Set(["sla_warning", "sla_expired"]);
    if (!Number.isSafeInteger(payload.ticketId) || Number(payload.ticketId) < 1 || !(await findRecord("tickets", Number(payload.ticketId)))) return "The target ticket does not exist.";
    if (typeof payload.type !== "string" || !validTypes.has(payload.type)) return "Invalid SLA notification type.";
  }
  if (entity === "settings") {
    const stringFields: Record<string, number> = {
      companyName: 150,
      supportEmail: 254,
      supportPhone: 30,
      website: 255,
    };
    for (const [field, maxLength] of Object.entries(stringFields)) {
      if (typeof payload[field] !== "string" || (payload[field] as string).length > maxLength) {
        return `Invalid setting: ${field}.`;
      }
    }
    const booleanFields = [
      "notifyNewTicket", "notifyStatusChange", "notifyCriticalTicket",
      "notifyAssignedTicket", "notifySlaExpired", "requireStrongPassword", "automaticLogout",
    ];
    if (booleanFields.some((field) => typeof payload[field] !== "boolean")) return "Invalid notification or security setting.";
    for (const field of ["sessionTimeoutMinutes", "maximumSessionDurationMinutes"]) {
      const value = payload[field];
      if (typeof value !== "number" || !Number.isSafeInteger(value) || value < 1 || value > 10080) {
        return `Invalid setting: ${field}.`;
      }
    }
  }
  if (entity === "note-attachments") {
    if (typeof payload.noteId !== "number" || !Number.isSafeInteger(payload.noteId) || payload.noteId < 1 || !(await findRecord("notes", payload.noteId))) return "The target note does not exist.";
    const name = typeof payload.fileName === "string" ? payload.fileName.trim() : "";
    const ext = name.includes(".") ? name.split(".").pop()!.toLowerCase() : "";
    const encoded = payload.contentBase64;
    const declaredSize = payload.fileSize;
    if (!name || name.length > 255 || !ALLOWED_ATTACHMENT_EXTENSIONS.has(ext)) return "Invalid or unsupported attachment filename.";
    if (!Number.isSafeInteger(declaredSize) || Number(declaredSize) < 1 || Number(declaredSize) > MAX_ATTACHMENT_BYTES) return "Attachments must be between 1 byte and 20 MB.";
    if (typeof encoded !== "string" || encoded.length > Math.ceil(MAX_ATTACHMENT_BYTES / 3) * 4 || encoded.length % 4 !== 0 || !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(encoded)) return "Invalid or oversized Base64 attachment content.";
    const decoded = Buffer.from(encoded, "base64");
    if (decoded.length !== declaredSize || decoded.toString("base64") !== encoded) return "Attachment size does not match its Base64 content.";
    if (typeof payload.fileType !== "string" || payload.fileType.length > 150) return "Invalid attachment content type.";
  }
  return undefined;
}

async function canReadRecord(
  entity: RecordEntity,
  record: { id?: number; ownerUserId: number | null; payload: Record<string, unknown> },
  role: string,
  userId: number,
): Promise<boolean> {
  if (role === "Administrador") return true;
  if (entity === "stores" && role === "Solicitante") {
    const requester = await findUserById(userId);
    return Boolean(requester && requester.storeId === record.id);
  }
  if (entity === "tickets") return ticketBelongsToUser(record.payload, userId);
  if (entity === "notes" || entity === "notifications") return record.ownerUserId === userId;
  if (entity === "sla-notification-dismissals") return record.ownerUserId === userId;
  if (entity === "note-attachments") {
    const noteId = Number(record.payload.noteId);
    if (!Number.isSafeInteger(noteId) || noteId < 1) return false;
    const note = await findRecord<Record<string, unknown>>("notes", noteId);
    return Boolean(note && note.ownerUserId === userId);
  }
  if (entity === "ticket-comments" || entity === "ticket-history") {
    const ticketId = Number(record.payload.ticketId);
    if (!Number.isSafeInteger(ticketId) || ticketId < 1) return false;
    const ticket = await findRecord<Record<string, unknown>>("tickets", ticketId);
    return Boolean(ticket && ticketBelongsToUser(ticket.payload, userId));
  }
  return canReadEntity(entity, role);
}

async function addTicketDisplayReferences<T extends Record<string, unknown>>(
  record: T,
): Promise<T & { assignedTechnicianName?: string; storeCode?: string; storeName?: string }> {
  const result = { ...record } as T & { assignedTechnicianName?: string; storeCode?: string; storeName?: string };
  const technicianId = Number(record.assignedTechnicianId);
  if (Number.isSafeInteger(technicianId) && technicianId > 0) {
    const technician = await findUserById(technicianId);
    if (technician) result.assignedTechnicianName = technician.name;
  }
  const storeId = Number(record.storeId);
  if (Number.isSafeInteger(storeId) && storeId > 0) {
    const store = await findRecord<Record<string, unknown>>("stores", storeId);
    if (store) {
      if (typeof store.payload.code === "string") result.storeCode = store.payload.code;
      if (typeof store.payload.name === "string") result.storeName = store.payload.name;
    }
  }
  return result;
}

function requesterStoreSummary(record: Record<string, unknown>): Record<string, unknown> {
  const { id, code, name, status, city, state, createdAt, updatedAt } = record;
  return { id, code, name, status, city, state, createdAt, updatedAt };
}

async function canWriteRecord(
  entity: RecordEntity,
  method: string,
  role: string,
  userId: number,
  payload?: Record<string, unknown>,
  existing?: { ownerUserId: number | null; payload: Record<string, unknown> },
): Promise<boolean> {
  if (entity === "user-history") return method === "POST" && role === "Administrador";
  if (entity === "audit-logs") return method === "POST";
  if (role === "Administrador") return true;
  if (entity === "tickets") {
    if (method === "DELETE") return false;
    if (method === "POST") return role === "Solicitante" && payload?.requesterUserId === userId;
    if (!existing) return false;
    return role === "Solicitante"
      ? existing.payload.requesterUserId === userId && payload?.requesterUserId === userId
      : role === "Técnico" && existing.payload.assignedTechnicianId === userId;
  }
  if (entity === "ticket-comments" || entity === "ticket-history") {
    if (method === "POST") return await canReadRecord(entity, { ownerUserId: null, payload: payload ?? {} }, role, userId);
    return entity === "ticket-comments" && existing?.ownerUserId === userId;
  }
  if (entity === "notes") {
    if (method === "POST") return role !== "Administrador" && payload?.authorUserId === userId;
    return existing !== undefined;
  }
  if (entity === "note-attachments") {
    if (method === "POST") {
      const noteId = Number(payload?.noteId);
      if (!Number.isSafeInteger(noteId) || noteId < 1) return false;
      const note = await findRecord<Record<string, unknown>>("notes", noteId);
      return Boolean(note && (role === "Administrador" || note.ownerUserId === userId));
    }
    return existing !== undefined;
  }
  if (entity === "inventory") return role === "Técnico" && method === "PUT";
  if (entity === "inventory-history") return role === "Técnico" && method === "POST";
  if (entity === "notifications") {
    if (method !== "POST") return existing?.ownerUserId === userId;
    const recipientId = Number(payload?.userId);
    if (recipientId === userId) return true;
    const ticketId = Number(payload?.ticketId);
    if (!Number.isSafeInteger(ticketId) || ticketId < 1) return false;
    const ticket = await findRecord<Record<string, unknown>>("tickets", ticketId);
    if (!ticket || !ticketBelongsToUser(ticket.payload, userId)) return false;
    return recipientId === Number(ticket.payload.requesterUserId)
      || recipientId === Number(ticket.payload.assignedTechnicianId);
  }
  if (entity === "sla-notification-dismissals") return method === "POST" || existing?.ownerUserId === userId;
  return false;
}

router.get("/:entity", async (req, res) => {
  try {
    const entity = entityFrom(req, res);
    const user = currentUser(req, res);
    if (!entity || !user) return;
    if (!canReadEntity(entity, user.role)) return res.status(403).json({ success: false, message: "Insufficient permission." });
    const allRecords = await listRecords<Record<string, unknown>>(entity);
    const records = [];
    for (const record of allRecords) {
      if (await canReadRecord(entity, record, user.role, user.id)) records.push(record);
    }
    const serializedRecords = await Promise.all(records.map(async (record) => {
      const { contentBase64: _contentBase64, ...metadata } = entity === "note-attachments" ? record.payload : {};
      const serialized = { id: record.id, ...(entity === "note-attachments" ? metadata : record.payload), createdAt: record.createdAt, updatedAt: record.updatedAt };
      if (entity === "tickets") return addTicketDisplayReferences(serialized);
      if (entity === "stores" && user.role === "Solicitante") return requesterStoreSummary(serialized);
      return serialized;
    }));
    return res.json({ success: true, records: serializedRecords });
  } catch (error) {
    console.error("Failed to list records", error);
    return res.status(500).json({ success: false, message: "Unable to load records." });
  }
});

router.get("/:entity/:id", async (req, res) => {
  try {
    const entity = entityFrom(req, res);
    const user = currentUser(req, res);
    const id = Number(req.params.id);
    if (!entity || !user) return;
    if (!Number.isSafeInteger(id) || id < 1) return res.status(400).json({ success: false, message: "Invalid record ID." });
    const record = await findRecord<Record<string, unknown>>(entity, id);
    if (!record || !(await canReadRecord(entity, record, user.role, user.id))) {
      return res.status(404).json({ success: false, message: "Record not found." });
    }
    const serialized = { id: record.id, ...record.payload, createdAt: record.createdAt, updatedAt: record.updatedAt };
    if (entity === "tickets") return res.json({ success: true, record: await addTicketDisplayReferences(serialized) });
    if (entity === "stores" && user.role === "Solicitante") return res.json({ success: true, record: requesterStoreSummary(serialized) });
    return res.json({ success: true, record: serialized });
  } catch (error) {
    console.error("Failed to read record", error);
    return res.status(500).json({ success: false, message: "Unable to load record." });
  }
});

router.post("/:entity", async (req, res) => {
  try {
    const entity = entityFrom(req, res);
    const user = currentUser(req, res);
    if (!entity || !user) return;
    if (entity === "settings") return res.status(405).json({ success: false, message: "Use the shared settings endpoint." });
    if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) return res.status(400).json({ success: false, message: "A record object is required." });
    const payload = { ...req.body } as Record<string, unknown>;
    delete payload.id;
    delete payload.createdAt;
    delete payload.updatedAt;
    if (entity === "notes" || entity === "note-attachments") payload.authorUserId = user.id;
    if (entity === "notes" && payload.noteDate === undefined) payload.noteDate = new Date().toISOString().slice(0, 10);
    if (entity === "tickets" && user.role === "Solicitante") {
      payload.requesterUserId = user.id;
      payload.assignedTechnicianId = null;
      payload.status = "Aberto";
      payload.closedAt = null;
    }
    if (entity === "note-attachments") {
      payload.authorUserId = user.id;
      payload.uploadedByUserId = user.id;
    }
    if (entity === "inventory-history") {
      const itemId = Number(payload.inventoryItemId);
      if (!Number.isSafeInteger(itemId) || itemId < 1 || !(await findRecord("inventory", itemId))) {
        return res.status(400).json({ success: false, message: "A valid inventory item is required." });
      }
      payload.performedByUserId = user.id;
    }
    if (entity === "user-history") {
      const authenticatedUser = res.locals.authUser as { name?: unknown } | undefined;
      payload.performedBy = typeof authenticatedUser?.name === "string" ? authenticatedUser.name : "Administrador";
    }
    if (entity === "audit-logs") {
      const authenticatedUser = res.locals.authUser as { name?: unknown } | undefined;
      payload.userId = user.id;
      payload.userName = typeof authenticatedUser?.name === "string" ? authenticatedUser.name : "Usuário autenticado";
    }
    if (entity === "notifications") {
      payload.userId = payload.userId === null || payload.userId === undefined ? user.id : Number(payload.userId);
      payload.read = false;
    }
    if (!(await canWriteRecord(entity, "POST", user.role, user.id, payload))) return res.status(403).json({ success: false, message: "Insufficient permission." });
    const ownerUserId = entity === "notes"
      ? Number(payload.authorUserId)
      : ["note-attachments", "ticket-comments", "sla-notification-dismissals"].includes(entity)
        ? user.id
        : entity === "notifications" ? Number(payload.userId)
        : entity === "tickets" ? Number(payload.requesterUserId) : null;
    let referenceErrorMessage: string | undefined;
    const persist = async (connection?: PoolConnection) => {
      const referenceError = await validateReferences(entity, payload, undefined, connection);
      if (referenceError) {
        referenceErrorMessage = referenceError;
        return undefined;
      }
      if (entity === "notes" && user.role === "Solicitante" && payload.storeId != null) {
        const requester = await findUserById(user.id);
        if (!requester || Number(requester.storeId) !== Number(payload.storeId)) {
          referenceErrorMessage = "A nota do solicitante só pode ser vinculada à sua própria loja.";
          return undefined;
        }
      }
      return connection
        ? await insertRecordOnConnection<Record<string, unknown>>(connection, entity, payload, ownerUserId)
        : await insertRecord<Record<string, unknown>>(entity, payload, ownerUserId);
    };
    const record = entity === "tickets"
      ? await withCategoryIntegrityLock((connection) => persist(connection))
      : await persist();
    if (!record) return res.status(400).json({ success: false, message: referenceErrorMessage ?? "Invalid references." });
    const { contentBase64: _contentBase64, ...attachmentMetadata } = entity === "note-attachments" ? record.payload : {};
    const responsePayload = entity === "note-attachments" ? attachmentMetadata : record.payload;
    return res.status(201).json({ success: true, record: { id: record.id, ...responsePayload, createdAt: record.createdAt, updatedAt: record.updatedAt } });
  } catch (error) {
    if (error instanceof CategoryIntegrityLockError) return res.status(503).json({ success: false, message: error.message });
    console.error("Failed to create record", error);
    return res.status(500).json({ success: false, message: "Unable to create record." });
  }
});

// Settings are one shared record. A MySQL advisory lock prevents concurrent first saves
// from creating multiple records, and the transaction covers selection and write.
router.put("/settings", async (req, res) => {
  try {
    const user = currentUser(req, res);
    if (!user) return;
    if (user.role !== "Administrador") return res.status(403).json({ success: false, message: "Insufficient permission." });
    if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
      return res.status(400).json({ success: false, message: "A settings object is required." });
    }
    const payload = { ...req.body } as Record<string, unknown>;
    delete payload.id;
    delete payload.createdAt;
    delete payload.updatedAt;
    const sharedSettingFields = [
      "companyName", "supportEmail", "supportPhone", "website",
      "notifyNewTicket", "notifyStatusChange", "notifyCriticalTicket",
      "notifyAssignedTicket", "notifySlaExpired", "sessionTimeoutMinutes",
      "maximumSessionDurationMinutes", "requireStrongPassword", "automaticLogout",
    ];
    const sharedPayload = Object.fromEntries(
      sharedSettingFields.map((field) => [field, payload[field]]),
    );
    const validationError = await validateReferences("settings", sharedPayload);
    if (validationError) return res.status(400).json({ success: false, message: validationError });

    const record = await withSettingsIntegrityLock(async (connection) => {
      const existing = await listRecordsOnConnection<Record<string, unknown>>(connection, "settings");
      return existing[0]
        ? await replaceRecordOnConnection(connection, "settings", existing[0].id, sharedPayload)
        : await insertRecordOnConnection(connection, "settings", sharedPayload, null);
    });
    if (!record) return res.status(500).json({ success: false, message: "Unable to save settings." });
    return res.json({ success: true, record: { id: record.id, ...record.payload, createdAt: record.createdAt, updatedAt: record.updatedAt } });
  } catch (error) {
    if (error instanceof SettingsIntegrityLockError) return res.status(503).json({ success: false, message: error.message });
    console.error("Failed to save shared settings", error);
    return res.status(500).json({ success: false, message: "Unable to save settings." });
  }
});

// Ticket updates must read, validate and write while holding the same lock as category CRUD.
router.put("/tickets/:id", async (req, res) => {
  try {
    const user = currentUser(req, res);
    const id = Number(req.params.id);
    if (!user) return;
    if (!Number.isSafeInteger(id) || id < 1) return res.status(400).json({ success: false, message: "Invalid record ID." });
    if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) return res.status(400).json({ success: false, message: "A record object is required." });
    const record = await withCategoryIntegrityLock(async (connection) => {
      const existing = await findRecordOnConnection<Record<string, unknown>>(connection, "tickets", id);
      if (!existing || !(await canReadRecord("tickets", existing, user.role, user.id))) {
        res.status(404).json({ success: false, message: "Record not found." });
        return undefined;
      }
      const payload = { ...existing.payload, ...req.body, id: undefined } as Record<string, unknown>;
      delete payload.id;
      delete payload.createdAt;
      delete payload.updatedAt;
      if (user.role === "Técnico") {
        payload.requesterUserId = existing.payload.requesterUserId;
        payload.assignedTechnicianId = user.id;
      }
      if (user.role === "Solicitante") {
        payload.status = existing.payload.status;
        payload.assignedTechnicianId = existing.payload.assignedTechnicianId;
        payload.closedAt = existing.payload.closedAt;
      }
      if (!(await canWriteRecord("tickets", "PUT", user.role, user.id, payload, existing))) {
        res.status(403).json({ success: false, message: "Insufficient permission." });
        return undefined;
      }
      const referenceError = await validateReferences("tickets", payload, existing.payload, connection);
      if (referenceError) {
        res.status(400).json({ success: false, message: referenceError });
        return undefined;
      }
      const record = await replaceRecordOnConnection<Record<string, unknown>>(connection, "tickets", id, payload);
      if (!record) {
        res.status(404).json({ success: false, message: "Record not found." });
        return undefined;
      }
      return record;
    });
    if (!record) return;
    return res.json({ success: true, record: { id: record.id, ...record.payload, createdAt: record.createdAt, updatedAt: record.updatedAt } });
  } catch (error) {
    if (error instanceof CategoryIntegrityLockError) return res.status(503).json({ success: false, message: error.message });
    console.error("Failed to update ticket", error);
    return res.status(500).json({ success: false, message: "Unable to update ticket." });
  }
});

router.put("/:entity/:id", async (req, res) => {
  try {
    const entity = entityFrom(req, res);
    const user = currentUser(req, res);
    const id = Number(req.params.id);
    if (!entity || !user) return;
    if (entity === "settings") return res.status(405).json({ success: false, message: "Use the shared settings endpoint." });
    if (!Number.isSafeInteger(id) || id < 1) return res.status(400).json({ success: false, message: "Invalid record ID." });
    const existing = await findRecord<Record<string, unknown>>(entity, id);
    if (!existing || !(await canReadRecord(entity, existing, user.role, user.id))) return res.status(404).json({ success: false, message: "Record not found." });
    if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) return res.status(400).json({ success: false, message: "A record object is required." });
    const payload = { ...existing.payload, ...req.body, id: undefined } as Record<string, unknown>;
    delete payload.id;
    delete payload.createdAt;
    delete payload.updatedAt;
    if (entity === "tickets" && user.role === "Técnico") {
      payload.requesterUserId = existing.payload.requesterUserId;
      payload.assignedTechnicianId = user.id;
    }
    if (entity === "tickets" && user.role === "Solicitante") {
      payload.status = existing.payload.status;
      payload.assignedTechnicianId = existing.payload.assignedTechnicianId;
      payload.closedAt = existing.payload.closedAt;
    }
    if (entity === "notes") payload.authorUserId = existing.payload.authorUserId;
    if (entity === "ticket-comments") {
      payload.ticketId = existing.payload.ticketId;
      payload.authorId = existing.payload.authorId;
      payload.authorName = existing.payload.authorName;
    }
    if (entity === "note-attachments") return res.status(405).json({ success: false, message: "Attachments cannot be edited." });
    if (!(await canWriteRecord(entity, "PUT", user.role, user.id, payload, existing))) return res.status(403).json({ success: false, message: "Insufficient permission." });
    const referenceError = await validateReferences(entity, payload, existing.payload);
    if (referenceError) return res.status(400).json({ success: false, message: referenceError });
    if (entity === "notes" && user.role === "Solicitante" && payload.storeId != null) {
      const requester = await findUserById(user.id);
      if (!requester || Number(requester.storeId) !== Number(payload.storeId)) return res.status(403).json({ success: false, message: "A nota do solicitante só pode ser vinculada à sua própria loja." });
    }
    const record = await replaceRecord<Record<string, unknown>>(entity, id, payload);
    if (!record) return res.status(404).json({ success: false, message: "Record not found." });
    return res.json({ success: true, record: { id: record.id, ...record.payload, createdAt: record.createdAt, updatedAt: record.updatedAt } });
  } catch (error) {
    console.error("Failed to update record", error);
    return res.status(500).json({ success: false, message: "Unable to update record." });
  }
});

router.delete("/:entity/:id", async (req, res) => {
  try {
    const entity = entityFrom(req, res);
    const user = currentUser(req, res);
    const id = Number(req.params.id);
    if (!entity || !user) return;
    if (entity === "settings") return res.status(405).json({ success: false, message: "Shared settings cannot be deleted." });
    if (!Number.isSafeInteger(id) || id < 1) return res.status(400).json({ success: false, message: "Invalid record ID." });
    const existing = await findRecord<Record<string, unknown>>(entity, id);
    if (!existing || !(await canReadRecord(entity, existing, user.role, user.id))) return res.status(404).json({ success: false, message: "Record not found." });
    if (!(await canWriteRecord(entity, "DELETE", user.role, user.id, undefined, existing))) return res.status(403).json({ success: false, message: "Insufficient permission." });
    const references: Partial<Record<RecordEntity, Array<[RecordEntity, string]>>> = {
      stores: [["tickets", "storeId"], ["inventory", "storeId"]],
      inventory: [["tickets", "inventoryItemId"], ["inventory-history", "inventoryItemId"]],
    };
    for (const [referencingEntity, field] of references[entity] ?? []) {
      if (await hasRecordReference(referencingEntity, field, id)) {
        return res.status(409).json({ success: false, message: "This record is referenced by other records and cannot be deleted." });
      }
    }
    if (entity === "stores" && await hasUsersForStore(id)) {
      return res.status(409).json({ success: false, message: "This store is assigned to users and cannot be deleted." });
    }
    const deleted = entity === "tickets"
      ? await removeTicketAggregate(id)
      : entity === "notes"
        ? await removeNoteAggregate(id)
        : await removeRecord(entity, id);
    if (!deleted) return res.status(404).json({ success: false, message: "Record not found." });
    return res.json({ success: true });
  } catch (error) {
    console.error("Failed to delete record", error);
    return res.status(500).json({ success: false, message: "Unable to delete record." });
  }
});

export default router;
