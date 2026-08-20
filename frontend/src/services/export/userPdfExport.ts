import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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

  return `usuarios_${year}-${month}-${day}_${hour}-${minute}.pdf`;
}

export function exportUsersToPdf(
  users: User[]
): void {
  const pdf = new jsPDF();

  pdf.setFontSize(18);

  pdf.text(
    "Suporte Droga Viva",
    14,
    18
  );

  pdf.setFontSize(11);

  pdf.text(
    `Gerado em ${formatDate(
      new Date().toISOString()
    )}`,
    14,
    26
  );

  autoTable(pdf, {
    startY: 34,

    head: [[
      "Nome",
      "E-mail",
      "Departamento",
      "Perfil",
      "Status",
    ]],

    body: users.map((user) => [
      user.name,
      user.email,
      user.department,
      user.role,
      user.status,
    ]),
  });

  pdf.save(
    getFileName()
  );
}