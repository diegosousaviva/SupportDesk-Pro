import { useState } from "react";
import { useNavigate } from "react-router-dom";

import type {
  FormEvent,
} from "react";

import {
  Alert,
  Box,
  Button,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

import {
  changePassword,
} from "../../services/authService";

import {
  useAuth,
} from "../../contexts/AuthContext";

const PASSWORD_CHANGED_KEY =
  "supportdesk-password-changed";

function ChangePasswordPage() {
  const navigate = useNavigate();

  const {
    logout,
  } = useAuth();

  const [currentPassword, setCurrentPassword] =
    useState("");

  const [newPassword, setNewPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showCurrentPassword, setShowCurrentPassword] =
    useState(false);

  const [showNewPassword, setShowNewPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
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

    if (!currentPassword) {
      setErrorMessage(
        "Informe sua senha atual."
      );
      return;
    }

    if (!newPassword) {
      setErrorMessage(
        "Informe a nova senha."
      );
      return;
    }

    if (!confirmPassword) {
      setErrorMessage(
        "Confirme a nova senha."
      );
      return;
    }

    if (
      newPassword !==
      confirmPassword
    ) {
      setErrorMessage(
        "A confirmação da nova senha não confere."
      );
      return;
    }

    if (
      currentPassword ===
      newPassword
    ) {
      setErrorMessage(
        "A nova senha deve ser diferente da senha atual."
      );
      return;
    }

    setLoading(true);

    try {
      await changePassword(
        currentPassword,
        newPassword
      );

      /*
       * O backend invalida a sessão depois
       * da alteração da senha.
       *
       * Guardamos o aviso no sessionStorage
       * para garantir que a mensagem de sucesso
       * apareça na tela de login.
       */
      sessionStorage.setItem(
        PASSWORD_CHANGED_KEY,
        "true"
      );

      /*
       * Atualiza o estado do AuthContext para
       * informar imediatamente ao React que
       * o usuário está desconectado.
       */
      logout();

      navigate("/login", {
        replace: true,
      });
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(
          error.message
        );
      } else {
        setErrorMessage(
          "Não foi possível alterar sua senha."
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
              textAlign="center"
            >
              Alterar senha
            </Typography>

            <Typography
              color="text.secondary"
              textAlign="center"
            >
              Por segurança, você precisa alterar
              sua senha antes de continuar.
            </Typography>
          </Stack>

          <Alert severity="info">
            Esta é uma troca obrigatória de senha
            realizada no primeiro acesso.
          </Alert>

          {errorMessage && (
            <Alert severity="error">
              {errorMessage}
            </Alert>
          )}

          <TextField
            label="Senha atual"
            required
            fullWidth
            autoFocus
            autoComplete="current-password"
            type={
              showCurrentPassword
                ? "text"
                : "password"
            }
            value={currentPassword}
            disabled={loading}
            onChange={(event) =>
              setCurrentPassword(
                event.target.value
              )
            }
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      type="button"
                      edge="end"
                      aria-label={
                        showCurrentPassword
                          ? "Ocultar senha atual"
                          : "Mostrar senha atual"
                      }
                      disabled={loading}
                      onClick={() =>
                        setShowCurrentPassword(
                          (current) =>
                            !current
                        )
                      }
                    >
                      {showCurrentPassword ? (
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

          <TextField
            label="Nova senha"
            required
            fullWidth
            autoComplete="new-password"
            type={
              showNewPassword
                ? "text"
                : "password"
            }
            value={newPassword}
            disabled={loading}
            onChange={(event) =>
              setNewPassword(
                event.target.value
              )
            }
            helperText="A senha deve atender aos requisitos de segurança do sistema."
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      type="button"
                      edge="end"
                      aria-label={
                        showNewPassword
                          ? "Ocultar nova senha"
                          : "Mostrar nova senha"
                      }
                      disabled={loading}
                      onClick={() =>
                        setShowNewPassword(
                          (current) =>
                            !current
                        )
                      }
                    >
                      {showNewPassword ? (
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

          <TextField
            label="Confirmar nova senha"
            required
            fullWidth
            autoComplete="new-password"
            type={
              showConfirmPassword
                ? "text"
                : "password"
            }
            value={confirmPassword}
            disabled={loading}
            error={
              confirmPassword.length > 0 &&
              newPassword !==
                confirmPassword
            }
            helperText={
              confirmPassword.length > 0 &&
              newPassword !==
                confirmPassword
                ? "As senhas não conferem."
                : ""
            }
            onChange={(event) =>
              setConfirmPassword(
                event.target.value
              )
            }
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      type="button"
                      edge="end"
                      aria-label={
                        showConfirmPassword
                          ? "Ocultar confirmação"
                          : "Mostrar confirmação"
                      }
                      disabled={loading}
                      onClick={() =>
                        setShowConfirmPassword(
                          (current) =>
                            !current
                        )
                      }
                    >
                      {showConfirmPassword ? (
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

          <Button
            type="submit"
            variant="contained"
            size="large"
            fullWidth
            disabled={loading}
          >
            {loading
              ? "Alterando senha..."
              : "Alterar senha"}
          </Button>

          <Typography
            variant="body2"
            color="text.secondary"
            textAlign="center"
          >
            Após alterar a senha, será necessário
            entrar novamente no sistema.
          </Typography>
        </Stack>
      </Paper>
    </Box>
  );
}

export default ChangePasswordPage;