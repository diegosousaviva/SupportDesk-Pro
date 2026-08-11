import {
  Alert,
  Box,
  Chip,
  LinearProgress,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

import StoreOutlinedIcon from "@mui/icons-material/StoreOutlined";

import type {
  StoreInventoryChartItem,
} from "../../services/dashboardService";

interface DashboardStoreInventoryProps {
  data:
    StoreInventoryChartItem[];
}

function DashboardStoreInventory({
  data,
}: DashboardStoreInventoryProps) {
  const highestQuantity =
    data.reduce(
      (
        highestValue,
        item
      ) =>
        Math.max(
          highestValue,
          item.quantity
        ),
      0
    );

  return (
    <Paper
      variant="outlined"
      sx={{
        p: {
          xs: 2.5,
          md: 3,
        },
        borderRadius: 3,
      }}
    >
      <Stack spacing={2.5}>
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
        >
          <StoreOutlinedIcon
            color="primary"
          />

          <Box>
            <Typography
              variant="h6"
              fontWeight={700}
            >
              Equipamentos por loja
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
            >
              Distribuição atual dos equipamentos cadastrados por loja.
            </Typography>
          </Box>
        </Stack>

        {data.length ===
        0 ? (
          <Alert severity="info">
            Nenhum equipamento está vinculado a uma loja.
          </Alert>
        ) : (
          <Stack spacing={2}>
            {data.map(
              (item) => {
                const progress =
                  highestQuantity ===
                  0
                    ? 0
                    : Math.round(
                        (
                          item.quantity /
                          highestQuantity
                        ) * 100
                      );

                return (
                  <Box
                    key={
                      item.storeId
                    }
                  >
                    <Stack
                      direction={{
                        xs: "column",
                        sm: "row",
                      }}
                      spacing={1}
                      justifyContent="space-between"
                      alignItems={{
                        xs: "flex-start",
                        sm: "center",
                      }}
                      sx={{
                        mb: 0.75,
                      }}
                    >
                      <Stack
                        direction="row"
                        spacing={1}
                        alignItems="center"
                        sx={{
                          minWidth: 0,
                        }}
                      >
                        <Typography
                          variant="body2"
                          fontWeight={700}
                          noWrap
                        >
                          {item.storeCode} —{" "}
                          {item.storeName}
                        </Typography>

                        {item.storeStatus ===
                          "Inativa" && (
                          <Chip
                            label="Inativa"
                            size="small"
                            color="warning"
                            variant="outlined"
                          />
                        )}
                      </Stack>

                      <Typography
                        variant="body2"
                        fontWeight={700}
                      >
                        {item.quantity}{" "}
                        equipamento
                        {item.quantity ===
                        1
                          ? ""
                          : "s"}
                      </Typography>
                    </Stack>

                    <LinearProgress
                      variant="determinate"
                      value={
                        progress
                      }
                      sx={{
                        height: 8,
                        borderRadius: 999,
                      }}
                    />
                  </Box>
                );
              }
            )}
          </Stack>
        )}
      </Stack>
    </Paper>
  );
}

export default DashboardStoreInventory;