import { useEffect, useState } from "react";

import {
  Box,
  Button,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";

import type { User } from "../../types/User";

export interface UserFormData {
  name: string;
  email: string;
  phone: string;
  department: string;
  role: User["role"];
  status: User["status"];
}

interface UserFormProps {
  initialValues?: UserFormData;
  onSubmit: (values: UserFormData) => void;
  submitLabel?: string;
}

const defaultValues: UserFormData = {
  name: "",
  email: "",
  phone: "",
  department: "",
  role: "Solicitante",
  status: "Ativo",
};

function UserForm({
  initialValues,
  onSubmit,
  submitLabel = "Salvar",
}: UserFormProps) {
  const [formData, setFormData] =
    useState<UserFormData>(defaultValues);

  useEffect(() => {
    if (initialValues) {
      setFormData(initialValues);
    }
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
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    onSubmit(formData);
  }

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      noValidate
    >
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            required
            label="Nome"
            value={formData.name}
            onChange={(event) =>
              handleChange("name", event.target.value)
            }
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            required
            type="email"
            label="E-mail"
            value={formData.email}
            onChange={(event) =>
              handleChange("email", event.target.value)
            }
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            label="Telefone"
            value={formData.phone}
            onChange={(event) =>
              handleChange("phone", event.target.value)
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
          <FormControl fullWidth>
            <InputLabel>Perfil</InputLabel>

            <Select
              label="Perfil"
              value={formData.role}
              onChange={(event) =>
                handleChange(
                  "role",
                  event.target.value as User["role"]
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
          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>

            <Select
              label="Status"
              value={formData.status}
              onChange={(event) =>
                handleChange(
                  "status",
                  event.target.value as User["status"]
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