import { useContext } from "react";
import { NotificationContext } from "../contexts/NotificationContextValue";
import type { NotificationContextValue } from "../contexts/NotificationContextValue";

export function useNotifications(): NotificationContextValue {
  const context = useContext(NotificationContext);
  if (!context) throw new Error("useNotifications deve ser usado dentro de NotificationProvider.");
  return context;
}
