import {
  ArchiveOutlined,
  BuildOutlined,
  DeleteForeverOutlined,
  HandshakeOutlined,
  Inventory2Outlined,
  LaptopMacOutlined,
  BookmarkBorderOutlined,
  WarehouseOutlined,
} from "@mui/icons-material";

import {
  Grid,
} from "@mui/material";

import StatCard from "./StatCard";

import type {
  DashboardInventoryMetrics,
} from "../../services/dashboardService";

interface DashboardInventoryCardsProps {
  metrics: DashboardInventoryMetrics;
}

export default function DashboardInventoryCards({
  metrics,
}: DashboardInventoryCardsProps) {
  return (
    <Grid
      container
      spacing={2}
    >
      <Grid
        size={{
          xs: 12,
          sm: 6,
          md: 3,
        }}
      >
        <StatCard
          title="Total de equipamentos"
          value={
            metrics.totalItems
          }
          color="#1976d2"
          icon={
            <Inventory2Outlined />
          }
        />
      </Grid>

      <Grid
        size={{
          xs: 12,
          sm: 6,
          md: 3,
        }}
      >
        <StatCard
          title="Em uso"
          value={
            metrics.inUseItems
          }
          color="#2e7d32"
          icon={
            <LaptopMacOutlined />
          }
        />
      </Grid>

      <Grid
        size={{
          xs: 12,
          sm: 6,
          md: 3,
        }}
      >
        <StatCard
          title="Em estoque"
          value={
            metrics.inStockItems
          }
          color="#0288d1"
          icon={
            <WarehouseOutlined />
          }
        />
      </Grid>

      <Grid
        size={{
          xs: 12,
          sm: 6,
          md: 3,
        }}
      >
        <StatCard
          title="Em manutenção"
          value={
            metrics.maintenanceItems
          }
          color="#ed6c02"
          icon={
            <BuildOutlined />
          }
        />
      </Grid>

      <Grid
        size={{
          xs: 12,
          sm: 6,
          md: 3,
        }}
      >
        <StatCard
          title="Emprestados"
          value={
            metrics.loanedItems
          }
          color="#7b1fa2"
          icon={
            <HandshakeOutlined />
          }
        />
      </Grid>

      <Grid
        size={{
          xs: 12,
          sm: 6,
          md: 3,
        }}
      >
        <StatCard
          title="Reserva"
          value={
            metrics.reservedItems
          }
          color="#1565c0"
          icon={
            <BookmarkBorderOutlined />
          }
        />
      </Grid>

      <Grid
        size={{
          xs: 12,
          sm: 6,
          md: 3,
        }}
      >
        <StatCard
          title="Descartados"
          value={
            metrics.discardedItems
          }
          color="#616161"
          icon={
            <DeleteForeverOutlined />
          }
        />
      </Grid>

      <Grid
        size={{
          xs: 12,
          sm: 6,
          md: 3,
        }}
      >
        <StatCard
          title="Baixados"
          value={
            metrics.decommissionedItems
          }
          color="#c62828"
          icon={
            <ArchiveOutlined />
          }
        />
      </Grid>
    </Grid>
  );
}