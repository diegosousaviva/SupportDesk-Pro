import {
  useEffect,
  useState,
} from "react";

import type {
  FormEvent,
} from "react";

import {
  Alert,
  Box,
  Button,
  MenuItem,
  Stack,
  TextField,
} from "@mui/material";

import {
  ArrowBack,
  Save,
} from "@mui/icons-material";

import type {
  StoreStatus,
} from "../../types/Store";

export interface StoreFormData {
  code: string;
  name: string;
  status: StoreStatus;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  email: string;
  manager: string;
  notes: string;
}

interface StoreFormProps {
  initialValues?: StoreFormData;

  onSubmit: (
    values: StoreFormData
  ) => void;

  onCancel: () => void;

  saving?: boolean;

  submitLabel?: string;
}

interface StoreFormErrors {
  code?: string;
  name?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  phone?: string;
  email?: string;
  manager?: string;
  notes?: string;
}

const MAXIMUM_CODE_LENGTH =
  20;

const MINIMUM_NAME_LENGTH =
  3;

const MAXIMUM_NAME_LENGTH =
  100;

const MAXIMUM_ADDRESS_LENGTH =
  200;

const MAXIMUM_CITY_LENGTH =
  100;

const STATE_LENGTH =
  2;

const MAXIMUM_ZIP_CODE_LENGTH =
  9;

const MAXIMUM_PHONE_LENGTH =
  30;

const MAXIMUM_EMAIL_LENGTH =
  150;

const MAXIMUM_MANAGER_LENGTH =
  100;

const MAXIMUM_NOTES_LENGTH =
  2000;

const CODE_PATTERN =
  /^[A-Za-z0-9_-]+$/;

const STATE_PATTERN =
  /^[A-Za-z]{2}$/;

const ZIP_CODE_PATTERN =
  /^\d{5}-?\d{3}$/;

const PHONE_PATTERN =
  /^[0-9()+\-\s.]+$/;

const EMAIL_PATTERN =
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const defaultValues:
  StoreFormData = {
    code: "",
    name: "",
    status: "Ativa",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    phone: "",
    email: "",
    manager: "",
    notes: "",
  };

function StoreForm({
  initialValues,
  onSubmit,
  onCancel,
  saving = false,
  submitLabel = "Salvar loja",
}: StoreFormProps) {
  const [
    formData,
    setFormData,
  ] =
    useState<StoreFormData>(
      initialValues ??
        defaultValues
    );

  const [
    errors,
    setErrors,
  ] =
    useState<StoreFormErrors>(
      {}
    );

  const [
    formError,
    setFormError,
  ] = useState("");

  useEffect(() => {
    setFormData(
      initialValues ??
        defaultValues
    );

    setErrors(
      {}
    );

    setFormError(
      ""
    );
  }, [
    initialValues,
  ]);

  function handleChange<
    K extends keyof StoreFormData,
  >(
    field: K,
    value: StoreFormData[K]
  ): void {
    setFormData(
      (
        currentData
      ) => ({
        ...currentData,

        [field]:
          value,
      })
    );

    setErrors(
      (
        currentErrors
      ) => ({
        ...currentErrors,

        [field]:
          undefined,
      })
    );

    setFormError(
      ""
    );
  }

  function validateForm():
    boolean {
    const newErrors:
      StoreFormErrors = {};

    const code =
      formData.code.trim();

    const name =
      formData.name.trim();

    const address =
      formData.address.trim();

    const city =
      formData.city.trim();

    const state =
      formData.state.trim();

    const zipCode =
      formData.zipCode.trim();

    const phone =
      formData.phone.trim();

    const email =
      formData.email.trim();

    const manager =
      formData.manager.trim();

    const notes =
      formData.notes.trim();

    if (!code) {
      newErrors.code =
        "Informe o código da loja.";
    } else if (
      code.length >
      MAXIMUM_CODE_LENGTH
    ) {
      newErrors.code =
        `O código deve possuir no máximo ${MAXIMUM_CODE_LENGTH} caracteres.`;
    } else if (
      !CODE_PATTERN.test(
        code
      )
    ) {
      newErrors.code =
        "Use apenas letras, números, hífen e sublinhado.";
    }

    if (!name) {
      newErrors.name =
        "Informe o nome da loja.";
    } else if (
      name.length <
      MINIMUM_NAME_LENGTH
    ) {
      newErrors.name =
        `O nome deve possuir pelo menos ${MINIMUM_NAME_LENGTH} caracteres.`;
    } else if (
      name.length >
      MAXIMUM_NAME_LENGTH
    ) {
      newErrors.name =
        `O nome deve possuir no máximo ${MAXIMUM_NAME_LENGTH} caracteres.`;
    }

    if (
      address.length >
      MAXIMUM_ADDRESS_LENGTH
    ) {
      newErrors.address =
        `O endereço deve possuir no máximo ${MAXIMUM_ADDRESS_LENGTH} caracteres.`;
    }

    if (
      city.length >
      MAXIMUM_CITY_LENGTH
    ) {
      newErrors.city =
        `A cidade deve possuir no máximo ${MAXIMUM_CITY_LENGTH} caracteres.`;
    }

    if (
      state &&
      !STATE_PATTERN.test(
        state
      )
    ) {
      newErrors.state =
        "Informe a sigla do estado com 2 letras. Exemplo: SP.";
    }

    if (
      zipCode &&
      !ZIP_CODE_PATTERN.test(
        zipCode
      )
    ) {
      newErrors.zipCode =
        "Informe um CEP válido. Exemplo: 01001-000.";
    }

    if (
      phone
    ) {
      if (
        phone.length >
        MAXIMUM_PHONE_LENGTH
      ) {
        newErrors.phone =
          `O telefone deve possuir no máximo ${MAXIMUM_PHONE_LENGTH} caracteres.`;
      } else if (
        !PHONE_PATTERN.test(
          phone
        )
      ) {
        newErrors.phone =
          "Informe um telefone válido.";
      }
    }

    if (
      email
    ) {
      if (
        email.length >
        MAXIMUM_EMAIL_LENGTH
      ) {
        newErrors.email =
          `O e-mail deve possuir no máximo ${MAXIMUM_EMAIL_LENGTH} caracteres.`;
      } else if (
        !EMAIL_PATTERN.test(
          email
        )
      ) {
        newErrors.email =
          "Informe um e-mail válido.";
      }
    }

    if (
      manager.length >
      MAXIMUM_MANAGER_LENGTH
    ) {
      newErrors.manager =
        `O gerente deve possuir no máximo ${MAXIMUM_MANAGER_LENGTH} caracteres.`;
    }

    if (
      notes.length >
      MAXIMUM_NOTES_LENGTH
    ) {
      newErrors.notes =
        `As observações devem possuir no máximo ${MAXIMUM_NOTES_LENGTH} caracteres.`;
    }

    setErrors(
      newErrors
    );

    const valid =
      Object.keys(
        newErrors
      ).length ===
      0;

    if (!valid) {
      setFormError(
        "Revise os campos destacados antes de continuar."
      );
    }

    return valid;
  }

  function handleSubmit(
    event:
      FormEvent<HTMLFormElement>
  ): void {
    event.preventDefault();

    setFormError(
      ""
    );

    if (
      !validateForm()
    ) {
      return;
    }

    onSubmit({
      code:
        formData.code
          .trim()
          .toUpperCase(),

      name:
        formData.name.trim(),

      status:
        formData.status,

      address:
        formData.address.trim(),

      city:
        formData.city.trim(),

      state:
        formData.state
          .trim()
          .toUpperCase(),

      zipCode:
        formData.zipCode.trim(),

      phone:
        formData.phone.trim(),

      email:
        formData.email
          .trim()
          .toLowerCase(),

      manager:
        formData.manager.trim(),

      notes:
        formData.notes.trim(),
    });
  }

  return (
    <Box
      component="form"
      onSubmit={
        handleSubmit
      }
      noValidate
    >
      <Stack spacing={3}>
        {formError && (
          <Alert severity="warning">
            {formError}
          </Alert>
        )}

        <Stack
          direction={{
            xs: "column",
            md: "row",
          }}
          spacing={2}
        >
          <TextField
            label="Código da loja"
            value={
              formData.code
            }
            onChange={(event) =>
              handleChange(
                "code",
                event.target.value
              )
            }
            helperText={
              errors.code ??
              "Exemplo: LJ001"
            }
            error={
              Boolean(
                errors.code
              )
            }
            fullWidth
            required
            disabled={
              saving
            }
            slotProps={{
              htmlInput: {
                maxLength:
                  MAXIMUM_CODE_LENGTH,
              },
            }}
          />

          <TextField
            label="Nome da loja"
            value={
              formData.name
            }
            onChange={(event) =>
              handleChange(
                "name",
                event.target.value
              )
            }
            helperText={
              errors.name
            }
            error={
              Boolean(
                errors.name
              )
            }
            fullWidth
            required
            disabled={
              saving
            }
            slotProps={{
              htmlInput: {
                maxLength:
                  MAXIMUM_NAME_LENGTH,
              },
            }}
          />

          <TextField
            select
            label="Status"
            value={
              formData.status
            }
            onChange={(event) =>
              handleChange(
                "status",
                event.target
                  .value as StoreStatus
              )
            }
            fullWidth
            disabled={
              saving
            }
          >
            <MenuItem value="Ativa">
              Ativa
            </MenuItem>

            <MenuItem value="Inativa">
              Inativa
            </MenuItem>
          </TextField>
        </Stack>

        <TextField
          label="Endereço"
          value={
            formData.address
          }
          onChange={(event) =>
            handleChange(
              "address",
              event.target.value
            )
          }
          error={
            Boolean(
              errors.address
            )
          }
          helperText={
            errors.address
          }
          fullWidth
          disabled={
            saving
          }
          slotProps={{
            htmlInput: {
              maxLength:
                MAXIMUM_ADDRESS_LENGTH,
            },
          }}
        />

        <Stack
          direction={{
            xs: "column",
            md: "row",
          }}
          spacing={2}
        >
          <TextField
            label="Cidade"
            value={
              formData.city
            }
            onChange={(event) =>
              handleChange(
                "city",
                event.target.value
              )
            }
            error={
              Boolean(
                errors.city
              )
            }
            helperText={
              errors.city
            }
            fullWidth
            disabled={
              saving
            }
            slotProps={{
              htmlInput: {
                maxLength:
                  MAXIMUM_CITY_LENGTH,
              },
            }}
          />

          <TextField
            label="Estado"
            value={
              formData.state
            }
            onChange={(event) =>
              handleChange(
                "state",
                event.target.value
              )
            }
            placeholder="SP"
            error={
              Boolean(
                errors.state
              )
            }
            helperText={
              errors.state
            }
            fullWidth
            disabled={
              saving
            }
            slotProps={{
              htmlInput: {
                maxLength:
                  STATE_LENGTH,
              },
            }}
          />

          <TextField
            label="CEP"
            value={
              formData.zipCode
            }
            onChange={(event) =>
              handleChange(
                "zipCode",
                event.target.value
              )
            }
            placeholder="01001-000"
            error={
              Boolean(
                errors.zipCode
              )
            }
            helperText={
              errors.zipCode
            }
            fullWidth
            disabled={
              saving
            }
            slotProps={{
              htmlInput: {
                maxLength:
                  MAXIMUM_ZIP_CODE_LENGTH,
              },
            }}
          />
        </Stack>

        <Stack
          direction={{
            xs: "column",
            md: "row",
          }}
          spacing={2}
        >
          <TextField
            label="Telefone"
            value={
              formData.phone
            }
            onChange={(event) =>
              handleChange(
                "phone",
                event.target.value
              )
            }
            error={
              Boolean(
                errors.phone
              )
            }
            helperText={
              errors.phone
            }
            fullWidth
            disabled={
              saving
            }
            slotProps={{
              htmlInput: {
                maxLength:
                  MAXIMUM_PHONE_LENGTH,
              },
            }}
          />

          <TextField
            label="E-mail"
            type="email"
            value={
              formData.email
            }
            onChange={(event) =>
              handleChange(
                "email",
                event.target.value
              )
            }
            error={
              Boolean(
                errors.email
              )
            }
            helperText={
              errors.email
            }
            fullWidth
            disabled={
              saving
            }
            slotProps={{
              htmlInput: {
                maxLength:
                  MAXIMUM_EMAIL_LENGTH,
              },
            }}
          />
        </Stack>

        <TextField
          label="Gerente responsável"
          value={
            formData.manager
          }
          onChange={(event) =>
            handleChange(
              "manager",
              event.target.value
            )
          }
          error={
            Boolean(
              errors.manager
            )
          }
          helperText={
            errors.manager
          }
          fullWidth
          disabled={
            saving
          }
          slotProps={{
            htmlInput: {
              maxLength:
                MAXIMUM_MANAGER_LENGTH,
            },
          }}
        />

        <TextField
          label="Observações"
          value={
            formData.notes
          }
          onChange={(event) =>
            handleChange(
              "notes",
              event.target.value
            )
          }
          error={
            Boolean(
              errors.notes
            )
          }
          helperText={
            errors.notes ??
            `${formData.notes.length}/${MAXIMUM_NOTES_LENGTH} caracteres`
          }
          multiline
          rows={5}
          fullWidth
          disabled={
            saving
          }
          slotProps={{
            htmlInput: {
              maxLength:
                MAXIMUM_NOTES_LENGTH,
            },
          }}
        />

        <Stack
          direction={{
            xs: "column",
            sm: "row",
          }}
          spacing={2}
          justifyContent="flex-end"
        >
          <Button
            type="button"
            variant="outlined"
            startIcon={
              <ArrowBack />
            }
            onClick={
              onCancel
            }
            disabled={
              saving
            }
          >
            Cancelar
          </Button>

          <Button
            type="submit"
            variant="contained"
            startIcon={
              <Save />
            }
            loading={
              saving
            }
            disabled={
              saving ||
              !formData.code.trim() ||
              !formData.name.trim()
            }
          >
            {saving
              ? "Salvando..."
              : submitLabel}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}

export default StoreForm;