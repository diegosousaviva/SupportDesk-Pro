import {
  AccessTimeOutlined,
  AssignmentLateOutlined,
  GroupsOutlined,
  PercentOutlined,
  PersonSearchOutlined,
  SpeedOutlined,
} from "@mui/icons-material";

import {
  Box,
} from "@mui/material";

import StatCard from "./StatCard";

import type {
  DashboardExecutiveMetrics,
} from "../../services/dashboardService";

interface ExecutiveKpiCardsProps {
  metrics: DashboardExecutiveMetrics;
}

export default function ExecutiveKpiCards({
  metrics,
}: ExecutiveKpiCardsProps) {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          sm: "repeat(2, minmax(0, 1fr))",
          lg: "repeat(3, minmax(0, 1fr))",
          xl: "repeat(6, minmax(0, 1fr))",
        },
        gap: 2,
      }}
    >
      <StatCard
        title="Total de usuários"
        value={
          metrics.totalUsers
        }
        color="#1565c0"
        icon={
          <GroupsOutlined />
        }
      />

      <StatCard
        title="Técnicos ativos"
        value={
          metrics.activeTechnicians
        }
        color="#00838f"
        icon={
          <PersonSearchOutlined />
        }
      />

      <StatCard
        title="Chamados críticos"
        value={
          metrics.criticalTickets
        }
        color="#d32f2f"
        icon={
          <AssignmentLateOutlined />
        }
      />

      <StatCard
        title="Sem responsável"
        value={
          metrics.unassignedTickets
        }
        color="#ed6c02"
        icon={
          <AccessTimeOutlined />
        }
      />

      <StatCard
        title="Taxa de resolução"
        value={
          metrics.resolutionRate
        }
        suffix="%"
        color="#2e7d32"
        icon={
          <PercentOutlined />
        }
      />

      <StatCard
        title="Média de resolução"
        value={
          metrics.averageResolutionTime
        }
        suffix=" h"
        color="#7b1fa2"
        icon={
          <SpeedOutlined />
        }
      />
    </Box>
  );
}
