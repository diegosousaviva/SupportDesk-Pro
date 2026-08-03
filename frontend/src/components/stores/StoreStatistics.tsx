import {
  BusinessOutlined,
  CheckCircleOutline,
  HighlightOffOutlined,
  LocationCityOutlined,
} from "@mui/icons-material";

import {
  Grid,
} from "@mui/material";

import StatCard from "../dashboard/StatCard";

import type {
  Store,
} from "../../types/Store";

interface StoreStatisticsProps {
  stores: Store[];
}

function StoreStatistics({
  stores,
}: StoreStatisticsProps) {
  const totalStores =
    stores.length;

  const activeStores =
    stores.filter(
      (store) =>
        store.status ===
        "Ativa"
    ).length;

  const inactiveStores =
    stores.filter(
      (store) =>
        store.status ===
        "Inativa"
    ).length;

  const cities =
    new Set(
      stores
        .map(
          (store) =>
            store.city
              .trim()
              .toLocaleLowerCase(
                "pt-BR"
              )
        )
        .filter(Boolean)
    ).size;

  return (
    <Grid
      container
      spacing={2}
      sx={{
        mb: 3,
      }}
    >
      <Grid
        size={{
          xs: 12,
          sm: 6,
          lg: 3,
        }}
      >
        <StatCard
          title="Total de lojas"
          value={totalStores}
          color="#1565c0"
          icon={
            <BusinessOutlined />
          }
        />
      </Grid>

      <Grid
        size={{
          xs: 12,
          sm: 6,
          lg: 3,
        }}
      >
        <StatCard
          title="Lojas ativas"
          value={activeStores}
          color="#2e7d32"
          icon={
            <CheckCircleOutline />
          }
        />
      </Grid>

      <Grid
        size={{
          xs: 12,
          sm: 6,
          lg: 3,
        }}
      >
        <StatCard
          title="Lojas inativas"
          value={inactiveStores}
          color="#d32f2f"
          icon={
            <HighlightOffOutlined />
          }
        />
      </Grid>

      <Grid
        size={{
          xs: 12,
          sm: 6,
          lg: 3,
        }}
      >
        <StatCard
          title="Cidades"
          value={cities}
          color="#0288d1"
          icon={
            <LocationCityOutlined />
          }
        />
      </Grid>
    </Grid>
  );
}

export default StoreStatistics;