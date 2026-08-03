import {
  Grid,
} from "@mui/material";

import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import ComputerOutlinedIcon from "@mui/icons-material/ComputerOutlined";
import WarehouseOutlinedIcon from "@mui/icons-material/WarehouseOutlined";
import BuildCircleOutlinedIcon from "@mui/icons-material/BuildCircleOutlined";

import StatCard from "../dashboard/StatCard";

import type {
  InventoryItem,
} from "../../types/InventoryItem";

interface Props {
  items: InventoryItem[];
}

function InventoryStatistics({
  items,
}: Props) {
  const total =
    items.length;

  const inUse =
    items.filter(
      (item) =>
        item.status ===
        "Em uso"
    ).length;

  const stock =
    items.filter(
      (item) =>
        item.status ===
        "Em estoque"
    ).length;

  const maintenance =
    items.filter(
      (item) =>
        item.status ===
        "Em manutenção"
    ).length;

  return (
    <Grid
      container
      spacing={2}
      sx={{
        mb: 3,
      }}
    >
      <Grid size={{ xs: 12, md: 3 }}>
        <StatCard
          title="Total de equipamentos"
          value={total}
          icon={
            <Inventory2OutlinedIcon />
          }
        />
      </Grid>

      <Grid size={{ xs: 12, md: 3 }}>
        <StatCard
          title="Em uso"
          value={inUse}
          icon={
            <ComputerOutlinedIcon />
          }
        />
      </Grid>

      <Grid size={{ xs: 12, md: 3 }}>
        <StatCard
          title="Em estoque"
          value={stock}
          icon={
            <WarehouseOutlinedIcon />
          }
        />
      </Grid>

      <Grid size={{ xs: 12, md: 3 }}>
        <StatCard
          title="Em manutenção"
          value={maintenance}
          icon={
            <BuildCircleOutlinedIcon />
          }
        />
      </Grid>
    </Grid>
  );
}

export default InventoryStatistics;