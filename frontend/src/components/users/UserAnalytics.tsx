import {
  Box,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

import {
  BarChart,
  PieChart,
} from "@mui/x-charts";

import { useMemo } from "react";

import type {
  User,
} from "../../types/User";

interface UserAnalyticsProps {
  users: User[];
}

interface MonthlyRegistration {
  key: string;
  label: string;
  total: number;
}

function buildMonthlyRegistrations(
  users: User[]
): MonthlyRegistration[] {
  const registrationMap =
    new Map<string, MonthlyRegistration>();

  users.forEach((user) => {
    const date = new Date(
      user.createdAt
    );

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return;
    }

    const year =
      date.getFullYear();

    const month =
      date.getMonth();

    const key =
      `${year}-${String(
        month + 1
      ).padStart(2, "0")}`;

    const label =
      new Intl.DateTimeFormat(
        "pt-BR",
        {
          month: "short",
          year: "2-digit",
        }
      ).format(date);

    const current =
      registrationMap.get(key);

    registrationMap.set(key, {
      key,
      label,
      total:
        (current?.total ?? 0) +
        1,
    });
  });

  return Array.from(
    registrationMap.values()
  )
    .sort((first, second) =>
      first.key.localeCompare(
        second.key
      )
    )
    .slice(-12);
}

export default function UserAnalytics({
  users,
}: UserAnalyticsProps) {
  const analytics =
    useMemo(() => {
      const byRole = [
        {
          id: 0,
          label: "Administradores",
          value: users.filter(
            (user) =>
              user.role ===
              "Administrador"
          ).length,
        },
        {
          id: 1,
          label: "Técnicos",
          value: users.filter(
            (user) =>
              user.role ===
              "Técnico"
          ).length,
        },
        {
          id: 2,
          label: "Solicitantes",
          value: users.filter(
            (user) =>
              user.role ===
              "Solicitante"
          ).length,
        },
      ];

      const byStatus = [
        {
          id: 0,
          label: "Ativos",
          value: users.filter(
            (user) =>
              user.status ===
              "Ativo"
          ).length,
        },
        {
          id: 1,
          label: "Inativos",
          value: users.filter(
            (user) =>
              user.status ===
              "Inativo"
          ).length,
        },
      ];

      const departmentMap =
        new Map<string, number>();

      users.forEach((user) => {
        const department =
          user.department.trim() ||
          "Não informado";

        departmentMap.set(
          department,
          (departmentMap.get(
            department
          ) ?? 0) + 1
        );
      });

      const byDepartment =
        Array.from(
          departmentMap.entries()
        )
          .map(
            ([
              department,
              total,
            ]) => ({
              department,
              total,
            })
          )
          .sort(
            (
              first,
              second
            ) =>
              second.total -
              first.total
          )
          .slice(0, 10);

      const monthly =
        buildMonthlyRegistrations(
          users
        );

      return {
        byRole,
        byStatus,
        byDepartment,
        monthly,
      };
    }, [users]);

  if (users.length === 0) {
    return (
      <Paper
        variant="outlined"
        sx={{ p: 3 }}
      >
        <Typography
          color="text.secondary"
          align="center"
        >
          Não há usuários suficientes
          para gerar os gráficos.
        </Typography>
      </Paper>
    );
  }

  return (
    <Stack spacing={3}>
      <Box>
        <Typography
          variant="h6"
          fontWeight={800}
        >
          Análise de usuários
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          mt={0.5}
        >
          Visualize a distribuição dos
          usuários por perfil, status,
          departamento e período de
          cadastro.
        </Typography>
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            lg: "repeat(2, minmax(0, 1fr))",
          },
          gap: 3,
        }}
      >
        <Paper
          variant="outlined"
          sx={{ p: 2 }}
        >
          <Typography
            variant="subtitle1"
            fontWeight={700}
            mb={2}
          >
            Usuários por perfil
          </Typography>

          <PieChart
            height={300}
            series={[
              {
                data:
                  analytics.byRole,
                innerRadius: 45,
                outerRadius: 100,
                paddingAngle: 3,
                cornerRadius: 4,
              },
            ]}
          />
        </Paper>

        <Paper
          variant="outlined"
          sx={{ p: 2 }}
        >
          <Typography
            variant="subtitle1"
            fontWeight={700}
            mb={2}
          >
            Ativos x inativos
          </Typography>

          <PieChart
            height={300}
            series={[
              {
                data:
                  analytics.byStatus,
                innerRadius: 45,
                outerRadius: 100,
                paddingAngle: 3,
                cornerRadius: 4,
              },
            ]}
          />
        </Paper>

        <Paper
          variant="outlined"
          sx={{ p: 2 }}
        >
          <Typography
            variant="subtitle1"
            fontWeight={700}
            mb={2}
          >
            Usuários por departamento
          </Typography>

          <BarChart
            height={320}
            xAxis={[
              {
                scaleType: "band",
                data:
                  analytics.byDepartment.map(
                    (item) =>
                      item.department
                  ),
              },
            ]}
            series={[
              {
                data:
                  analytics.byDepartment.map(
                    (item) =>
                      item.total
                  ),
                label: "Usuários",
              },
            ]}
          />
        </Paper>

        <Paper
          variant="outlined"
          sx={{ p: 2 }}
        >
          <Typography
            variant="subtitle1"
            fontWeight={700}
            mb={2}
          >
            Cadastros por mês
          </Typography>

          <BarChart
            height={320}
            xAxis={[
              {
                scaleType: "band",
                data:
                  analytics.monthly.map(
                    (item) =>
                      item.label
                  ),
              },
            ]}
            series={[
              {
                data:
                  analytics.monthly.map(
                    (item) =>
                      item.total
                  ),
                label: "Cadastros",
              },
            ]}
          />
        </Paper>
      </Box>
    </Stack>
  );
}