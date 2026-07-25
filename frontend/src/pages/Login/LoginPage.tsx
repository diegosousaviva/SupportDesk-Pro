import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Link,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

function LoginPage() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    navigate("/dashboard");
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: 2,
        py: 4,
        background:
          "linear-gradient(135deg, #0d47a1 0%, #1565c0 50%, #42a5f5 100%)",
      }}
    >
      <Paper
        component="form"
        onSubmit={handleSubmit}
        elevation={12}
        sx={{
          width: "100%",
          maxWidth: 440,
          p: { xs: 3, sm: 5 },
          borderRadius: 3,
        }}
      >
        <Stack spacing={3}>
          <Stack alignItems="center" spacing={1}>
            <SupportAgentIcon color="primary" sx={{ fontSize: 64 }} />

            <Typography variant="h4" color="primary">
              SupportDesk Pro
            </Typography>

            <Typography color="text.secondary" textAlign="center">
              Entre com seus dados para acessar o sistema
            </Typography>
          </Stack>

          <TextField
            label="E-mail"
            type="email"
            name="email"
            autoComplete="email"
            fullWidth
            required
          />

          <TextField
            label="Senha"
            type={showPassword ? "text" : "password"}
            name="password"
            autoComplete="current-password"
            fullWidth
            required
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label={
                        showPassword ? "Ocultar senha" : "Mostrar senha"
                      }
                      onClick={() => setShowPassword((current) => !current)}
                      edge="end"
                    >
                      {showPassword ? (
                        <VisibilityOffIcon />
                      ) : (
                        <VisibilityIcon />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />

          <Stack
            direction={{ xs: "column", sm: "row" }}
            alignItems={{ xs: "flex-start", sm: "center" }}
            justifyContent="space-between"
          >
            <FormControlLabel
              control={<Checkbox />}
              label="Lembrar de mim"
            />

            <Link href="#" underline="hover">
              Esqueci minha senha
            </Link>
          </Stack>

          <Button type="submit" variant="contained" size="large" fullWidth>
            Entrar
          </Button>

          <Typography
            variant="body2"
            color="text.secondary"
            textAlign="center"
          >
            Acesso exclusivo para usuários autorizados
          </Typography>
        </Stack>
      </Paper>
    </Box>
  );
}

export default LoginPage;