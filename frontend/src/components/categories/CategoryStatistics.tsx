import {
  Grid,
} from "@mui/material";

import StatCard from "../dashboard/StatCard";

import type {
  Category,
} from "../../types/Category";

interface CategoryStatisticsProps {
  categories: Category[];
}

function CategoryStatistics({
  categories,
}: CategoryStatisticsProps) {
  const total = categories.length;

  const active = categories.filter(
    (category) => category.active
  ).length;

  const inactive =
    total - active;

  return (
    <Grid
      container
      spacing={2}
      sx={{ mb: 3 }}
    >
      <Grid size={{ xs: 12, md: 4 }}>
        <StatCard
          title="Total"
          value={total}
        />
      </Grid>

      <Grid size={{ xs: 12, md: 4 }}>
        <StatCard
          title="Ativas"
          value={active}
        />
      </Grid>

      <Grid size={{ xs: 12, md: 4 }}>
        <StatCard
          title="Inativas"
          value={inactive}
        />
      </Grid>
    </Grid>
  );
}

export default CategoryStatistics;