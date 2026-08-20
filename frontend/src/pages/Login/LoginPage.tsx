import { useState } from "react";
import { useNavigate } from "react-router-dom";

import type {
  FormEvent,
} from "react";

import {
  Alert,
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

import { useAuth } from "../../contexts/AuthContext";

function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] =
    useState("");
  const [remember, setRemember] =
    useState(true);
  const [showPassword, setShowPassword] =
    useState(false);
  const [loading, setLoading] =
    useState(false);
  const [errorMessage, setErrorMessage] =
    useState("");

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setErrorMessage("");
    setLoading(true);

    try {
      await login({
        email,
        password,
        remember,
      });

      navigate("/dashboard", {
        replace: true,
      });
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage(
          "Não foi possível realizar o login."
        );
      }
    } finally {
      setLoading(false);
    }
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
          p: {
            xs: 3,
            sm: 5,
          },
          borderRadius: 3,
        }}
      >
        <Stack spacing={3}>
          <Stack
            spacing={1}
            alignItems="center"
          >
            <SupportAgentIcon
              color="primary"
              sx={{
                fontSize: 64,
              }}
            />

            <Typography
              variant="h4"
              color="primary"
              fontWeight={700}
            >
              Suporte Droga Viva
            </Typography>

            <Typography
              color="text.secondary"
              textAlign="center"
            >
              Entre com seus dados para acessar o
              sistema
            </Typography>
          </Stack>

          {errorMessage && (
            <Alert severity="error">
              {errorMessage}
            </Alert>
          )}

          <TextField
            label="E-mail"
            type="email"
            required
            fullWidth
            autoFocus
            autoComplete="email"
            value={email}
            disabled={loading}
            onChange={(event) =>
              setEmail(event.target.value)
            }
          />

          <TextField
            label="Senha"
            required
            fullWidth
            autoComplete="current-password"
            type={
              showPassword
                ? "text"
                : "password"
            }
            value={password}
            disabled={loading}
            onChange={(event) =>
              setPassword(event.target.value)
            }
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      type="button"
                      edge="end"
                      aria-label={
                        showPassword
                          ? "Ocultar senha"
                          : "Mostrar senha"
                      }
                      disabled={loading}
                      onClick={() =>
                        setShowPassword(
                          (current) => !current
                        )
                      }
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
            direction={{
              xs: "column",
              sm: "row",
            }}
            justifyContent="space-between"
            alignItems={{
              xs: "flex-start",
              sm: "center",
            }}
          >
            <FormControlLabel
              control={
                <Checkbox
                  checked={remember}
                  disabled={loading}
                  onChange={(event) =>
                    setRemember(
                      event.target.checked
                    )
                  }
                />
              }
              label="Lembrar de mim"
            />

            <Link
              href="#"
              underline="hover"
            >
              Esqueci minha senha
            </Link>
          </Stack>

          <Button
            type="submit"
            variant="contained"
            size="large"
            fullWidth
            disabled={loading}
          >
            {loading
              ? "Entrando..."
              : "Entrar"}
          </Button>

          <Typography
            variant="body2"
            color="text.secondary"
            textAlign="center"
          >
            Acesso exclusivo para usuários
            autorizados
          </Typography>
        </Stack>
      </Paper>
    </Box>
  );
}

export default LoginPage;