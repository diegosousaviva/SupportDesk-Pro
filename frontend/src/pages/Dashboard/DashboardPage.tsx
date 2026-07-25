import {
  Card,
  CardContent,
  Container,
  Grid,
  Typography,
} from "@mui/material";

import MainLayout from "../../components/layout/MainLayout";

function DashboardPage() {
  const cards = [
    { title: "Chamados abertos", value: 24 },
    { title: "Em atendimento", value: 8 },
    { title: "Resolvidos", value: 156 },
    { title: "SLA dentro do prazo", value: "96%" },
  ];

  return (
    <MainLayout title="Dashboard">
      <Container maxWidth="xl" disableGutters>
        <Typography variant="h4" gutterBottom>
          Visão geral
        </Typography>

        <Typography color="text.secondary" sx={{ mb: 4 }}>
          Acompanhe os principais indicadores do suporte.
        </Typography>

        <Grid container spacing={3}>
          {cards.map((card) => (
            <Grid key={card.title} size={{ xs: 12, sm: 6, md: 3 }}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary">
                    {card.title}
                  </Typography>

                  <Typography variant="h4" sx={{ mt: 1 }}>
                    {card.value}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </MainLayout>
  );
}

export default DashboardPage;