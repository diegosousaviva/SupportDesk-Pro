import {
  AddCircleOutline,
  AssignmentOutlined,
  BuildOutlined,
  BusinessOutlined,
  EditOutlined,
  LinkOffOutlined,
  LocalPrintshopOutlined,
  NoteAddOutlined,
  PersonOutline,
  PostAddOutlined,
  SwapHorizOutlined,
  SyncAltOutlined,
  UpdateOutlined,
} from "@mui/icons-material";

import {
  getUserById,
} from "../../services/userService";

import type {
  TimelineEvent,
  TimelineFilterOption,
} from "../timeline";

import type {
  InventoryHistoryEvent,
  InventoryHistoryEventType,
} from "../../types/InventoryHistory";

function getEventIcon(
  type: InventoryHistoryEventType
) {
  switch (type) {
    case "Cadastro":
      return AddCircleOutline;

    case "Edição":
      return EditOutlined;

    case "Mudança de situação":
      return SyncAltOutlined;

    case "Mudança de responsável":
      return PersonOutline;

    case "Mudança de loja":
      return BusinessOutlined;

    case "Mudança de estado físico":
      return SwapHorizOutlined;

    case "Impressão de etiqueta":
      return LocalPrintshopOutlined;

    case "Chamado criado":
      return PostAddOutlined;

    case "Chamado vinculado":
      return AssignmentOutlined;

    case "Chamado desvinculado":
      return LinkOffOutlined;

    case "Chamado atualizado":
      return UpdateOutlined;

    case "Manutenção":
      return BuildOutlined;

    case "Observação":
      return NoteAddOutlined;

    default:
      return AssignmentOutlined;
  }
}

function getEventColor(
  type: InventoryHistoryEventType
): TimelineEvent["color"] {
  switch (type) {
    case "Cadastro":
      return "success";

    case "Edição":
      return "info";

    case "Mudança de situação":
      return "warning";

    case "Mudança de responsável":
      return "secondary";

    case "Mudança de loja":
      return "primary";

    case "Mudança de estado físico":
      return "warning";

    case "Impressão de etiqueta":
      return "info";

    case "Chamado criado":
      return "success";

    case "Chamado vinculado":
      return "primary";

    case "Chamado desvinculado":
      return "warning";

    case "Chamado atualizado":
      return "info";

    case "Manutenção":
      return "error";

    case "Observação":
      return "default";

    default:
      return "default";
  }
}

function getEventCategory(
  type: InventoryHistoryEventType
): string {
  switch (type) {
    case "Cadastro":
      return "Cadastro";

    case "Impressão de etiqueta":
      return "Impressões";

    case "Chamado criado":
    case "Chamado vinculado":
    case "Chamado desvinculado":
    case "Chamado atualizado":
      return "Chamados";

    case "Manutenção":
      return "Manutenção";

    case "Observação":
      return "Observações";

    default:
      return "Alterações";
  }
}

export function mapInventoryHistoryToTimeline(
  events: InventoryHistoryEvent[]
): TimelineEvent[] {
  return events.map(
    (event) => {
      const user =
        event.performedByUserId ===
        null
          ? null
          : getUserById(
              event.performedByUserId
            );

      return {
        id:
          event.id,

        title:
          event.title,

        description:
          event.description,

        category:
          getEventCategory(
            event.type
          ),

        performedBy:
          user?.name ??
          "Sistema",

        performedByRole:
          user?.role ??
          "Ação automática",

        performedAt:
          event.createdAt,

        icon:
          getEventIcon(
            event.type
          ),

        color:
          getEventColor(
            event.type
          ),
      };
    }
  );
}

export const inventoryTimelineFilters:
  TimelineFilterOption[] = [
    {
      value: "Cadastro",
      label: "Cadastro",
    },

    {
      value: "Alterações",
      label: "Alterações",
    },

    {
      value: "Impressões",
      label: "Impressões",
    },

    {
      value: "Chamados",
      label: "Chamados",
    },

    {
      value: "Manutenção",
      label: "Manutenção",
    },

    {
      value: "Observações",
      label: "Observações",
    },
  ];