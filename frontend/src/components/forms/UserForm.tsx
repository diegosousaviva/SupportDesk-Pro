import {
  useEffect,
  useState,
} from "react";

import type {
  FormEvent,
} from "react";

import {
  Box,
  Button,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";

import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

import type { User } from "../../types/User";

export interface UserFormData {
  name: string;
  email: string;
  password: string;
  phone: string;
  department: string;
  role: User["role"];
  status: User["status"];
}

interface UserFormProps {
  initialValues?: UserFormData;
  onSubmit: (values: UserFormData) => void;
  submitLabel?: string;
  isEdit?: boolean;
}

const defaultValues: UserFormData = {
  name: "",
  email: "",
  password: "",
  phone: "",
  department: "",
  role: "Solicitante",
  status: "Ativo",
};

function UserForm({
  initialValues,
  onSubmit,
  submitLabel = "Salvar",
  isEdit = false,
}: UserFormProps) {
  const [formData, setFormData] =
    useState<UserFormData>(defaultValues);

  const [showPassword, setShowPassword] =
    useState(false);

  useEffect(() => {
    if (initialValues) {
      setFormData(initialValues);
      return;
    }

    setFormData(defaultValues);
  }, [initialValues]);

  function handleChange<K extends keyof UserFormData>(
    field: K,
    value: UserFormData[K]
  ) {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    onSubmit({
      ...formData,
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      department: formData.department.trim(),
    });
  }

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      noValidate={false}
    >
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            required
            label="Nome"
            autoComplete="name"
            value={formData.name}
            onChange={(event) =>
              handleChange(
                "name",
                event.target.value
              )
            }
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            required
            type="email"
            label="E-mail"
            autoComplete="email"
            value={formData.email}
            onChange={(event) =>
              handleChange(
                "email",
                event.target.value
              )
            }
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            required={!isEdit}
            label={
              isEdit
                ? "Nova senha"
                : "Senha"
            }
            type={
              showPassword
                ? "text"
                : "password"
            }
            autoComplete={
              isEdit
                ? "new-password"
                : "new-password"
            }
            value={formData.password}
            onChange={(event) =>
              handleChange(
                "password",
                event.target.value
              )
            }
            helperText={
              isEdit
                ? "Deixe em branco para manter a senha atual."
                : "A senha deve possuir pelo menos 6 caracteres."
            }
            slotProps={{
              htmlInput: {
                minLength: 6,
              },
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
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            label="Telefone"
            autoComplete="tel"
            value={formData.phone}
            onChange={(event) =>
              handleChange(
                "phone",
                event.target.value
              )
            }
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            label="Departamento"
            value={formData.department}
            onChange={(event) =>
              handleChange(
                "department",
                event.target.value
              )
            }
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <FormControl fullWidth required>
            <InputLabel id="user-role-label">
              Perfil
            </InputLabel>

            <Select
              labelId="user-role-label"
              label="Perfil"
              value={formData.role}
              onChange={(event) =>
                handleChange(
                  "role",
                  event.target
                    .value as User["role"]
                )
              }
            >
              <MenuItem value="Administrador">
                Administrador
              </MenuItem>

              <MenuItem value="Técnico">
                Técnico
              </MenuItem>

              <MenuItem value="Solicitante">
                Solicitante
              </MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <FormControl fullWidth required>
            <InputLabel id="user-status-label">
              Status
            </InputLabel>

            <Select
              labelId="user-status-label"
              label="Status"
              value={formData.status}
              onChange={(event) =>
                handleChange(
                  "status",
                  event.target
                    .value as User["status"]
                )
              }
            >
              <MenuItem value="Ativo">
                Ativo
              </MenuItem>

              <MenuItem value="Inativo">
                Inativo
              </MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              mt: 2,
            }}
          >
            <Button
              type="submit"
              variant="contained"
              size="large"
            >
              {submitLabel}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}

export default UserForm;