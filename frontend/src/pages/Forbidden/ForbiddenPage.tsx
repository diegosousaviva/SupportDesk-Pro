import LockOutlinedIcon from "@mui/icons-material/LockOutlined";

import {
  Box,
  Button,
  Paper,
  Typography,
} from "@mui/material";

import { useNavigate } from "react-router-dom";

function ForbiddenPage() {
  const navigate = useNavigate();

  function handleNavigateToDashboard() {
    navigate("/dashboard", {
      replace: true,
    });
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 3,
        backgroundColor: "background.default",
      }}
    >
      <Paper
        elevation={3}
        sx={{
          width: "100%",
          maxWidth: 520,
          padding: {
            xs: 3,
            sm: 5,
          },
          textAlign: "center",
          borderRadius: 3,
        }}
      >
        <LockOutlinedIcon
          color="error"
          sx={{
            fontSize: 72,
            marginBottom: 2,
          }}
        />

        <Typography
          variant="h2"
          component="h1"
          fontWeight={700}
          gutterBottom
        >
          403
        </Typography>

        <Typography
          variant="h5"
          component="h2"
          fontWeight={600}
          gutterBottom
        >
          Acesso negado
        </Typography>

        <Typography
          color="text.secondary"
          sx={{
            marginBottom: 4,
          }}
        >
          Você não possui permissão para acessar esta página.
        </Typography>

        <Button
          variant="contained"
          onClick={handleNavigateToDashboard}
        >
          Voltar ao Dashboard
        </Button>
      </Paper>
    </Box>
  );
}

export default ForbiddenPage;