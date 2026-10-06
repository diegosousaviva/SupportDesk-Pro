import "dotenv/config";

import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { after, test } from "node:test";
import type { RowDataPacket } from "mysql2";
import pool from "../src/database/mysql.js";

const localHosts = new Set(["localhost", "127.0.0.1", "::1"]);
const dbHost = process.env.DB_HOST?.trim().toLowerCase() ?? "";
const dbName = process.env.DB_NAME?.trim() ?? "";
const dbPort = Number(process.env.DB_PORT || 3306);
const apiAddress = process.env.LOCAL_TEST_API_URL?.trim() ?? "";
let apiUrl: URL | undefined;
try {
  if (apiAddress) apiUrl = new URL(apiAddress);
} catch {
  // The fail-closed check below rejects malformed or missing URLs.
}
const testAdminEmail = process.env.TEST_ADMIN_EMAIL?.trim().toLowerCase() ?? "";
const testAdminPassword = process.env.TEST_ADMIN_PASSWORD;

if (
  process.env.SUPPORTDESK_LOCAL_TESTS !== "1" ||
  process.env.SUPPORTDESK_CATEGORIES_TESTS !== "1" ||
  process.env.DEV_DB_CONFIRM !== "I_UNDERSTAND_LOCAL_DATABASE_ONLY" ||
  process.env.NODE_ENV?.toLowerCase() === "production" ||
  !localHosts.has(dbHost) ||
  dbName !== "supportdesk_pro_categories_test" ||
  !Number.isSafeInteger(dbPort) || dbPort < 1 || dbPort > 65535 ||
  !apiUrl ||
  apiUrl.protocol !== "http:" ||
  apiUrl.hostname !== "127.0.0.1" ||
  !apiUrl.port ||
  Boolean(apiUrl.username || apiUrl.password || apiUrl.search || apiUrl.hash) ||
  !testAdminEmail.endsWith("@supportdesk.test") ||
  !testAdminPassword ||
  testAdminEmail === process.env.DEV_ADMIN_EMAIL?.trim().toLowerCase() ||
  testAdminPassword === process.env.DEV_ADMIN_PASSWORD
) {
  throw new Error("Testes bloqueados: exigem banco dedicado, host/API em loopback, todas as confirmações e credenciais exclusivas de teste.");
}

interface Reply {
  success?: boolean;
  message?: string;
  token?: string;
  user?: { id: number; role: string; status?: string };
  category?: Record<string, unknown>;
  testConfig?: {
    integrationMode?: boolean;
    dbHost?: string;
    dbPort?: number;
    dbName?: string;
    activeDbName?: string;
    activeDbPort?: number;
    apiHost?: string;
    apiPort?: number;
  };
  record?: Record<string, unknown>;
  records?: Array<Record<string, unknown>>;
}

async function callApi(
  path: string,
  token?: string,
  method = "GET",
  body?: unknown,
): Promise<{ status: number; body: Reply }> {
  const response = await fetch(new URL(path, apiUrl), {
    method,
    headers: {
      ...(body === undefined ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  const responseBody = await response.json().catch(() => ({})) as Reply;
  return { status: response.status, body: responseBody };
}

function expectStatus(
  response: { status: number; body: Reply },
  expected: number,
): Reply {
  assert.equal(
    response.status,
    expected,
    `Expected HTTP ${expected}; received ${response.status}: ${response.body.message ?? "no message"}`,
  );
  return response.body;
}

function recordId(reply: Reply): number {
  const id = Number(reply.record?.id);
  assert.ok(Number.isSafeInteger(id) && id > 0, "API did not return a valid record ID.");
  return id;
}

const createdUserIds: number[] = [];
const createdTicketIds: number[] = [];
const createdCategoryIds: number[] = [];
const createdNoteIds: number[] = [];
const createdAttachmentIds: number[] = [];
const createdInventoryHistoryIds: number[] = [];
const createdInventoryIds: number[] = [];
const createdStoreIds: number[] = [];
let adminToken = "";

after(async () => {
  if (adminToken) {
    const deleteRecord = async (entity: string, id: number) => {
      await callApi(`/api/data/${entity}/${id}`, adminToken, "DELETE").catch(() => undefined);
    };
    for (const id of createdTicketIds.reverse()) await deleteRecord("tickets", id);
    for (const id of createdCategoryIds.reverse()) {
      await callApi(`/api/categories/${id}`, adminToken, "DELETE").catch(() => undefined);
    }
    for (const id of createdNoteIds.reverse()) await deleteRecord("notes", id);
    for (const id of createdAttachmentIds.reverse()) await deleteRecord("note-attachments", id);
    for (const id of createdInventoryHistoryIds.reverse()) await deleteRecord("inventory-history", id);
    for (const id of createdInventoryIds.reverse()) await deleteRecord("inventory", id);
    for (const id of createdStoreIds.reverse()) await deleteRecord("stores", id);
    for (const id of createdUserIds.reverse()) {
      await callApi(`/api/users/${id}`, adminToken, "DELETE").catch(() => undefined);
    }
  }
  await pool.end();
});

test("dev schema preflight and authenticated CRUD/permission flow", async () => {
  // Verify the separately started API's effective non-secret settings before this test opens its DB pool.
  const apiConfigReply = expectStatus(await callApi("/api/test-config"), 200);
  assert.deepEqual(apiConfigReply.testConfig, {
    integrationMode: true,
    dbHost,
    dbPort,
    dbName,
    activeDbName: dbName,
    activeDbPort: dbPort,
    apiHost: "127.0.0.1",
    apiPort: Number(apiUrl.port),
  }, "The local API and test runner must use identical dedicated DB and API endpoint settings.");

  const [dbRows] = await pool.query("SELECT DATABASE() AS databaseName, @@port AS serverPort");
  assert.equal((dbRows as RowDataPacket[])[0]?.databaseName, dbName);
  assert.equal(Number((dbRows as RowDataPacket[])[0]?.serverPort), dbPort);
  const [tableRows] = await pool.query(
    "SELECT COUNT(*) AS tableCount FROM information_schema.tables WHERE table_schema = DATABASE()",
  );
  assert.equal(Number((tableRows as RowDataPacket[])[0]?.tableCount), 2, "Use only the fresh two-table schema before running integration tests.");
  const [engineRows] = await pool.query(
    "SELECT ENGINE AS engine FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'supportdesk_records'",
  );
  assert.equal((engineRows as RowDataPacket[])[0]?.engine, "InnoDB", "Category/ticket integrity tests require supportdesk_records to use InnoDB.");
  const [roleRows] = await pool.query(
    "SELECT COLUMN_TYPE AS roleType FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'users' AND column_name = 'role'",
  );
  assert.equal(
    (roleRows as RowDataPacket[])[0]?.roleType,
    "enum('Administrador','Técnico','Solicitante')",
    "The local users.role enum does not match the application schema. Correct the development schema before running write tests.",
  );

  const [userRows] = await pool.query(
    "SELECT COUNT(*) AS userCount, SUM(email = ? AND role = 'Administrador' AND status = 'Ativo') AS testAdminCount FROM users",
    [testAdminEmail],
  );
  assert.equal(Number((userRows as RowDataPacket[])[0]?.userCount), 1, "The dedicated test database must contain only its test administrator before the suite starts.");
  assert.equal(Number((userRows as RowDataPacket[])[0]?.testAdminCount), 1, "The only user must be the active test administrator.");
  const [recordRows] = await pool.query("SELECT COUNT(*) AS recordCount FROM supportdesk_records");
  assert.equal(Number((recordRows as RowDataPacket[])[0]?.recordCount), 0, "The dedicated test database must have no application records before the suite starts.");

  const adminLogin = expectStatus(await callApi("/api/auth/login", undefined, "POST", {
    email: testAdminEmail,
    password: testAdminPassword,
  }), 200);
  assert.ok(adminLogin.token);
  assert.equal(adminLogin.user?.role, "Administrador");
  adminToken = adminLogin.token!;

  const categoryInput = { name: "Categoria local de teste", description: "Categoria criada pelo teste", color: "#336699", active: true };
  const categoryReply = expectStatus(await callApi("/api/categories", adminToken, "POST", categoryInput), 201);
  const categoryId = Number(categoryReply.category?.id);
  const categoryDiagnostic = {
    id: categoryReply.category?.id,
    name: categoryReply.category?.name,
    active: categoryReply.category?.active,
  };
  assert.ok(
    Number.isSafeInteger(categoryId) && categoryId > 0,
    `Created category must have a valid positive ID. Received: ${JSON.stringify(categoryDiagnostic)}`,
  );
  assert.equal(
    categoryDiagnostic.name,
    categoryInput.name,
    `Created category name does not match the request. Received: ${JSON.stringify(categoryDiagnostic)}`,
  );
  assert.equal(
    categoryDiagnostic.active,
    true,
    `Created category must be active. Received: ${JSON.stringify(categoryDiagnostic)}`,
  );
  createdCategoryIds.push(categoryId);
  expectStatus(await callApi("/api/categories", adminToken, "POST", {
    ...categoryInput,
    name: "  CATEGORIA\tLOCAL\nDE TESTE  ",
  }), 409);

  const suffix = `${Date.now().toString(36)}-${randomBytes(4).toString("hex")}`;
  const newPassword = `Local-${randomBytes(8).toString("hex")}aA!7`;
  const createUser = async (role: "Técnico" | "Solicitante", label: string) => {
    const reply = expectStatus(await callApi("/api/users", adminToken, "POST", {
      name: `Teste local ${label}`,
      email: `${label}-${suffix}@example.test`,
      password: newPassword,
      phone: "",
      department: "Testes locais",
      role,
      storeId: null,
      status: "Ativo",
    }), 201);
    const id = Number(reply.user?.id);
    assert.ok(id > 0);
    createdUserIds.push(id);
    assert.equal(reply.user?.role, role, "The users API must preserve the requested role.");
    assert.equal(reply.user?.status, "Ativo", "The users API must preserve the active status.");
    return { id, email: `${label}-${suffix}@example.test` };
  };

  const technician = await createUser("Técnico", "tecnico");
  const requester = await createUser("Solicitante", "solicitante");
  const outsider = await createUser("Solicitante", "externo");
  expectStatus(await callApi(`/api/users/${technician.id}`, adminToken, "PUT", {
    department: "Suporte local validado",
  }), 200);

  const technicianLogin = expectStatus(await callApi("/api/auth/login", undefined, "POST", {
    email: technician.email,
    password: newPassword,
  }), 200);
  const requesterLogin = expectStatus(await callApi("/api/auth/login", undefined, "POST", {
    email: requester.email,
    password: newPassword,
  }), 200);
  const outsiderLogin = expectStatus(await callApi("/api/auth/login", undefined, "POST", {
    email: outsider.email,
    password: newPassword,
  }), 200);

  const storeReply = expectStatus(await callApi("/api/data/stores", adminToken, "POST", {
    code: `DEV-${suffix}`,
    name: "Loja de teste local",
    status: "Ativa",
    address: "Rua Local, 1",
    city: "São Paulo",
    state: "SP",
    zipCode: "00000-000",
    phone: "",
    email: "loja@example.test",
    manager: "Teste",
    notes: "",
  }), 201);
  const storeId = recordId(storeReply);
  createdStoreIds.push(storeId);
  expectStatus(await callApi(`/api/users/${requester.id}`, adminToken, "PUT", { storeId }), 200);
  const requesterStores = expectStatus(await callApi("/api/data/stores", requesterLogin.token), 200);
  assert.equal(requesterStores.records?.length, 1, "A requester must only see their assigned store.");
  assert.equal(requesterStores.records?.[0]?.id, storeId);
  assert.equal(requesterStores.records?.[0]?.name, "Loja de teste local");
  assert.equal("address" in (requesterStores.records?.[0] ?? {}), false, "Requester store responses must omit unrelated contact/address fields.");
  assert.equal("email" in (requesterStores.records?.[0] ?? {}), false);
  assert.equal((expectStatus(await callApi("/api/data/stores", outsiderLogin.token), 200).records ?? []).length, 0);
  const updatedStore = expectStatus(await callApi(`/api/data/stores/${storeId}`, adminToken, "PUT", {
    notes: "Loja de desenvolvimento",
  }), 200);
  assert.equal(updatedStore.record?.notes, "Loja de desenvolvimento");

  const inventoryReply = expectStatus(await callApi("/api/data/inventory", adminToken, "POST", {
    tag: "",
    tagMode: "Automática",
    assetNumber: `ASSET-${suffix}`,
    storeId,
    category: "Equipamento",
    description: "Item exclusivo de teste local",
    manufacturer: "Local",
    model: "DEV",
    serialNumber: suffix,
    location: "Laboratório",
    value: 1,
    acquisitionDate: "2026-01-01",
    warrantyUntil: "",
    responsibleUserId: technician.id,
    status: "Em estoque",
    condition: "Bom",
    notes: "",
  }), 201);
  const inventoryId = recordId(inventoryReply);
  createdInventoryIds.push(inventoryId);
  assert.match(String(inventoryReply.record?.tag), /^TI-\d{6,}$/);
  expectStatus(await callApi(`/api/data/inventory/${inventoryId}`, adminToken, "PUT", {
    location: "Bancada de testes",
  }), 200);

  const historyReply = expectStatus(await callApi("/api/data/inventory-history", adminToken, "POST", {
    inventoryItemId: inventoryId,
    action: "Entrada",
    description: "Movimentação criada pelo teste local",
  }), 201);
  const inventoryHistoryId = recordId(historyReply);
  createdInventoryHistoryIds.push(inventoryHistoryId);

  const ticketReply = expectStatus(await callApi("/api/data/tickets", adminToken, "POST", {
    title: "Chamado de integração local",
    description: "Registro temporário para validar operações de API.",
    category: categoryInput.name,
    priority: "Baixa",
    status: "Aberto",
    requesterUserId: requester.id,
    storeId,
    assignedTechnicianId: technician.id,
    inventoryItemId: inventoryId,
    closedAt: null,
  }), 201);
  const ticketId = recordId(ticketReply);
  createdTicketIds.push(ticketId);
  const requesterTicket = expectStatus(await callApi(`/api/data/tickets/${ticketId}`, requesterLogin.token), 200);
  assert.equal(requesterTicket.record?.assignedTechnicianName, "Teste local tecnico");
  assert.equal(requesterTicket.record?.storeCode, storeReply.record?.code);
  assert.equal(requesterTicket.record?.storeName, "Loja de teste local");
  const requesterTickets = expectStatus(await callApi("/api/data/tickets", requesterLogin.token), 200);
  assert.equal(requesterTickets.records?.find((record) => record.id === ticketId)?.assignedTechnicianName, "Teste local tecnico");
  expectStatus(await callApi(`/api/categories/${categoryId}`, adminToken, "PUT", {
    ...categoryInput,
    name: "Categoria renomeada enquanto vinculada",
  }), 409);
  expectStatus(await callApi(`/api/categories/${categoryId}`, adminToken, "DELETE"), 409);
  const whitespaceHistoricalCategory = "  CATEGORIA\tLOCAL\r\nDE TESTE  ";
  await pool.execute(
    "UPDATE supportdesk_records SET payload = JSON_SET(payload, '$.category', ?) WHERE entity_type = 'tickets' AND id = ?",
    [whitespaceHistoricalCategory, ticketId],
  );
  expectStatus(await callApi(`/api/categories/${categoryId}`, adminToken, "DELETE"), 409);
  expectStatus(await callApi(`/api/categories/${categoryId}`, adminToken, "PUT", {
    ...categoryInput,
    name: "Categoria renomeada enquanto vinculada",
  }), 409);
  expectStatus(await callApi(`/api/categories/${categoryId}`, adminToken, "PUT", {
    ...categoryInput,
    active: false,
  }), 200);
  const inactiveHistoricalUpdate = expectStatus(await callApi(`/api/data/tickets/${ticketId}`, adminToken, "PUT", {
    title: "Chamado histórico com categoria inativa",
    description: "A categoria inativa continua preservada.",
  }), 200);
  assert.equal(inactiveHistoricalUpdate.record?.category, whitespaceHistoricalCategory);
  const missingHistoricalCategory = "Categoria removida do cadastro";
  await pool.execute(
    "UPDATE supportdesk_records SET payload = JSON_SET(payload, '$.category', ?) WHERE entity_type = 'tickets' AND id = ?",
    [missingHistoricalCategory, ticketId],
  );
  const missingHistoricalUpdate = expectStatus(await callApi(`/api/data/tickets/${ticketId}`, adminToken, "PUT", {
    title: "Chamado histórico com categoria ausente",
    description: "A categoria histórica ausente continua preservada.",
  }), 200);
  assert.equal(missingHistoricalUpdate.record?.category, missingHistoricalCategory);

  const duplicateRace = await Promise.all([
    callApi("/api/categories", adminToken, "POST", { ...categoryInput, name: "Concorrencia categoria" }),
    callApi("/api/categories", adminToken, "POST", { ...categoryInput, name: "  CONCORRENCIA\tCATEGORIA\n " }),
  ]);
  assert.deepEqual(duplicateRace.map((result) => result.status).sort(), [201, 409]);
  const winningDuplicate = duplicateRace.find((result) => result.status === 201)!;
  const duplicateRaceId = Number(winningDuplicate.body.category?.id);
  assert.ok(duplicateRaceId > 0);
  createdCategoryIds.push(duplicateRaceId);
  expectStatus(await callApi(`/api/categories/${duplicateRaceId}`, adminToken, "DELETE"), 200);
  createdCategoryIds.splice(createdCategoryIds.indexOf(duplicateRaceId), 1);

  const deletionRaceCategory = expectStatus(await callApi("/api/categories", adminToken, "POST", {
    ...categoryInput,
    name: "Corrida categoria chamado",
  }), 201);
  const deletionRaceCategoryId = Number(deletionRaceCategory.category?.id);
  assert.ok(deletionRaceCategoryId > 0);
  createdCategoryIds.push(deletionRaceCategoryId);
  const deletionRace = await Promise.all([
    callApi("/api/data/tickets", adminToken, "POST", {
      title: "Corrida de exclusao",
      description: "O chamado e a exclusao da categoria concorrem pelo lock.",
      category: "Corrida categoria chamado",
      priority: "Baixa",
      status: "Aberto",
      requesterUserId: requester.id,
      storeId: null,
      assignedTechnicianId: null,
      inventoryItemId: null,
      closedAt: null,
    }),
    callApi(`/api/categories/${deletionRaceCategoryId}`, adminToken, "DELETE"),
  ]);
  if (deletionRace[0].status === 201) {
    const racedTicketId = recordId(deletionRace[0].body);
    createdTicketIds.push(racedTicketId);
    expectStatus(deletionRace[1], 409);
    expectStatus(await callApi(`/api/data/tickets/${racedTicketId}`, adminToken, "DELETE"), 200);
    createdTicketIds.splice(createdTicketIds.indexOf(racedTicketId), 1);
    expectStatus(await callApi(`/api/categories/${deletionRaceCategoryId}`, adminToken, "DELETE"), 200);
  } else {
    expectStatus(deletionRace[0], 400);
    expectStatus(deletionRace[1], 200);
  }
  createdCategoryIds.splice(createdCategoryIds.indexOf(deletionRaceCategoryId), 1);
  assert.equal(expectStatus(await callApi(`/api/data/tickets/${ticketId}`, technicianLogin.token, "GET"), 200).record?.id, ticketId);
  expectStatus(await callApi(`/api/data/tickets/${ticketId}`, outsiderLogin.token, "GET"), 404);
  expectStatus(await callApi(`/api/data/tickets/${ticketId}`, technicianLogin.token, "DELETE"), 403);

  const commentReply = expectStatus(await callApi("/api/data/ticket-comments", technicianLogin.token, "POST", {
    ticketId,
    authorId: technician.id,
    authorName: "Teste técnico local",
    message: "Comentário de integração.",
  }), 201);
  const commentId = recordId(commentReply);
  expectStatus(await callApi(`/api/data/ticket-comments/${commentId}`, outsiderLogin.token, "GET"), 404);
  expectStatus(await callApi(`/api/data/ticket-comments/${commentId}`, technicianLogin.token, "PUT", {
    message: "Comentário atualizado.",
    ticketId: 999999,
    authorId: outsider.id,
  }), 200);

  expectStatus(await callApi(`/api/data/stores/${storeId}`, adminToken, "DELETE"), 409);
  expectStatus(await callApi(`/api/data/inventory/${inventoryId}`, adminToken, "DELETE"), 409);

  const ownTicketCategoryInput = {
    name: `Categoria ativa para chamado proprio ${suffix}`,
    description: "Categoria exclusiva para o chamado do solicitante.",
    color: "#336699",
    active: true,
  };
  const ownTicketCategoryReply = expectStatus(
    await callApi("/api/categories", adminToken, "POST", ownTicketCategoryInput),
    201,
  );
  const ownTicketCategoryId = Number(ownTicketCategoryReply.category?.id);
  const ownTicketCategoryDiagnostic = {
    id: ownTicketCategoryReply.category?.id,
    name: ownTicketCategoryReply.category?.name,
    active: ownTicketCategoryReply.category?.active,
  };
  assert.ok(
    Number.isSafeInteger(ownTicketCategoryId) && ownTicketCategoryId > 0,
    `Created own-ticket category must have a valid positive ID. Received: ${JSON.stringify(ownTicketCategoryDiagnostic)}`,
  );
  createdCategoryIds.push(ownTicketCategoryId);
  assert.equal(
    ownTicketCategoryDiagnostic.name,
    ownTicketCategoryInput.name,
    `Created own-ticket category name does not match the request. Received: ${JSON.stringify(ownTicketCategoryDiagnostic)}`,
  );
  assert.equal(
    ownTicketCategoryDiagnostic.active,
    true,
    `Created own-ticket category must be active. Received: ${JSON.stringify(ownTicketCategoryDiagnostic)}`,
  );

  const ownTicketReply = expectStatus(await callApi("/api/data/tickets", requesterLogin.token, "POST", {
    title: "Chamado próprio local",
    description: "Chamado criado pelo solicitante de teste.",
    category: ownTicketCategoryInput.name,
    priority: "Baixa",
    status: "Resolvido",
    requesterUserId: outsider.id,
    assignedTechnicianId: technician.id,
    storeId: null,
    inventoryItemId: null,
    closedAt: new Date().toISOString(),
  }), 201);
  const ownTicketId = recordId(ownTicketReply);
  createdTicketIds.push(ownTicketId);
  assert.equal(ownTicketReply.record?.requesterUserId, requester.id);
  assert.equal(ownTicketReply.record?.assignedTechnicianId, null);
  assert.equal(ownTicketReply.record?.status, "Aberto");
  expectStatus(await callApi(`/api/data/tickets/${ownTicketId}`, outsiderLogin.token, "GET"), 404);
  const protectedTicket = expectStatus(await callApi(`/api/data/tickets/${ownTicketId}`, requesterLogin.token, "PUT", {
    status: "Resolvido",
    assignedTechnicianId: technician.id,
  }), 200);
  assert.equal(protectedTicket.record?.status, "Aberto");
  assert.equal(protectedTicket.record?.assignedTechnicianId, null);
  expectStatus(await callApi(`/api/data/tickets/${ownTicketId}`, requesterLogin.token, "DELETE"), 403);

  const noteReply = expectStatus(await callApi("/api/data/notes", adminToken, "POST", {
    title: "Nota de teste local",
    description: "Nota temporária para validação de anexos.",
    category: "Geral",
    authorUserId: outsider.id,
  }), 201);
  const noteId = recordId(noteReply);
  createdNoteIds.push(noteId);
  assert.equal(noteReply.record?.authorUserId, adminLogin.user?.id);
  expectStatus(await callApi(`/api/data/notes/${noteId}`, requesterLogin.token, "GET"), 404);

  const encoded = Buffer.from("dev").toString("base64");
  const attachmentPayload = {
    noteId,
    fileName: "anexo-local.txt",
    fileType: "text/plain",
    fileSize: 3,
    uploadedByUserId: outsider.id,
    contentBase64: encoded,
  };
  const attachmentReply = expectStatus(await callApi("/api/data/note-attachments", adminToken, "POST", attachmentPayload), 201);
  const attachmentId = recordId(attachmentReply);
  createdAttachmentIds.push(attachmentId);
  assert.equal("contentBase64" in (attachmentReply.record ?? {}), false);
  const attachmentList = expectStatus(await callApi("/api/data/note-attachments", adminToken, "GET"), 200);
  assert.equal("contentBase64" in (attachmentList.records?.find((entry) => entry.id === attachmentId) ?? {}), false);
  const attachmentFile = expectStatus(await callApi(`/api/data/note-attachments/${attachmentId}`, adminToken, "GET"), 200);
  assert.equal(attachmentFile.record?.contentBase64, encoded);
  expectStatus(await callApi(`/api/data/note-attachments/${attachmentId}`, requesterLogin.token, "GET"), 404);
  expectStatus(await callApi("/api/data/note-attachments", adminToken, "POST", {
    ...attachmentPayload,
    fileName: "invalid.txt",
    contentBase64: "not-base64!",
  }), 400);
  expectStatus(await callApi(`/api/data/notes/${noteId}`, adminToken, "PUT", {
    description: "Nota local editada para validar a operação.",
  }), 200);
  expectStatus(await callApi(`/api/data/note-attachments/${attachmentId}`, adminToken, "DELETE"), 200);
  createdAttachmentIds.pop();
  expectStatus(await callApi(`/api/data/notes/${noteId}`, adminToken, "DELETE"), 200);
  createdNoteIds.pop();

  expectStatus(await callApi(`/api/data/tickets/${ticketId}`, adminToken, "DELETE"), 200);
  createdTicketIds.splice(createdTicketIds.indexOf(ticketId), 1);
  expectStatus(await callApi(`/api/data/ticket-comments/${commentId}`, adminToken, "GET"), 404);
  expectStatus(await callApi(`/api/data/inventory/${inventoryId}`, adminToken, "DELETE"), 200);
  createdInventoryIds.pop();
  createdInventoryHistoryIds.pop();
  expectStatus(await callApi(`/api/data/stores/${storeId}`, adminToken, "DELETE"), 200);
  createdStoreIds.pop();

  expectStatus(await callApi(`/api/data/tickets/${ownTicketId}`, adminToken, "DELETE"), 200);
  createdTicketIds.pop();
  for (const id of [technician.id, requester.id, outsider.id]) {
    expectStatus(await callApi(`/api/users/${id}`, adminToken, "DELETE"), 200);
    createdUserIds.splice(createdUserIds.indexOf(id), 1);
  }
});
