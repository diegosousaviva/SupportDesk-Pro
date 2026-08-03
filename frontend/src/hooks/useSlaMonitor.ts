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
    function checkSla(): void {
      const result =
        runSlaMonitor();

      const notificationsCreated =
        result.warningNotificationsCreated +
        result.expiredNotificationsCreated;

      if (
        notificationsCreated >
        0
      ) {
        refreshNotifications();
      }
    }

    checkSla();

    const intervalId =
      window.setInterval(
        checkSla,
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