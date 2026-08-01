import * as XLSX from "xlsx";

import type { User } from "../../types/User";

function formatDate(date: string): string {
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(parsedDate);
}

function getFileName(): string {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  const hour = String(now.getHours()).padStart(2, "0");
  const minute = String(now.getMinutes()).padStart(2, "0");

  return `usuarios_${year}-${month}-${day}_${hour}-${minute}.xlsx`;
}

export function exportUsersToExcel(
  users: User[]
): void {
  const worksheetData = users.map((user) => ({
    Nome: user.name,
    Email: user.email,
    Telefone: user.phone,
    Departamento: user.department,
    Perfil: user.role,
    Status: user.status,
    "Data de Cadastro": formatDate(user.createdAt),
  }));

  const worksheet =
    XLSX.utils.json_to_sheet(worksheetData);

  const workbook =
    XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(
    workbook,
    worksheet,
    "Usuários"
  );

  XLSX.writeFile(
    workbook,
    getFileName()
  );
}