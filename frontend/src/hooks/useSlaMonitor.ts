import {
  useEffect,
} from "react";

import {
  useNotifications,
} from "../contexts/NotificationContext";

import {
  runSlaMonitor,
} from "../monitoring/slaMonitor";

const SLA_MONITOR_INTERVAL =
  60 * 1000;

export function useSlaMonitor(): void {
  const {
    refreshNotifications,
  } = useNotifications();

  useEffect(() => {
    let checking = false;
    async function checkSla(): Promise<void> {
      if (checking) return;
      checking = true;
      try {
        const result = await runSlaMonitor();

        const notificationsCreated =
          result.warningNotificationsCreated +
          result.expiredNotificationsCreated;

        if (notificationsCreated > 0) {
          await refreshNotifications();
        }
      } catch (error) {
        console.error("Não foi possível atualizar as notificações de SLA.", error);
      } finally {
        checking = false;
      }
    }

    void checkSla();

    const intervalId =
      window.setInterval(
        () => { void checkSla(); },
        SLA_MONITOR_INTERVAL
      );

    return () => {
      window.clearInterval(
        intervalId
      );
    };
  }, [
    refreshNotifications,
  ]);
}
