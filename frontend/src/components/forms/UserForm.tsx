import {
  useEffect,
  useMemo,
  useState,
} from "react";

import type {
  FormEvent,
} from "react";

import {
  Alert,
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

import {
  validateStrongPassword,
} from "../../utils/password";

import type {
  User,
} from "../../types/User";

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

  onSubmit: (
    values: UserFormData
  ) => void;

  submitLabel?: string;

  isEdit?: boolean;
}

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  phone?: string;
  department?: string;
}

const SETTINGS_STORAGE_KEY =
  "supportdesk-pro-settings";

const MINIMUM_NAME_LENGTH =
  3;

const MAXIMUM_NAME_LENGTH =
  100;

const MAXIMUM_EMAIL_LENGTH =
  150;

const MINIMUM_BASIC_PASSWORD_LENGTH =
  6;

const MAXIMUM_PASSWORD_LENGTH =
  128;

const MAXIMUM_PHONE_LENGTH =
  30;

const MAXIMUM_DEPARTMENT_LENGTH =
  80;

const EMAIL_PATTERN =
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const PHONE_PATTERN =
  /^[0-9()+\-\s.]+$/;

const defaultValues:
  UserFormData = {
    name: "",

    email: "",

    password: "",

    phone: "",

    department: "",

    role:
      "Solicitante",

    status:
      "Ativo",
  };

function isStrongPasswordRequired():
  boolean {
  try {
    const storedSettings =
      localStorage.getItem(
        SETTINGS_STORAGE_KEY
      );

    if (!storedSettings) {
      return true;
    }

    const parsedSettings =
      JSON.parse(
        storedSettings
      ) as {
        requireStrongPassword?:
          unknown;
      };

    return (
      parsedSettings.requireStrongPassword !==
      false
    );
  } catch {
    return true;
  }
}

function UserForm({
  initialValues,
  onSubmit,
  submitLabel = "Salvar",
  isEdit = false,
}: UserFormProps) {
  const [
    formData,
    setFormData,
  ] =
    useState<UserFormData>(
      defaultValues
    );

  const [
    showPassword,
    setShowPassword,
  ] =
    useState(false);

  const [
    errors,
    setErrors,
  ] =
    useState<FormErrors>(
      {}
    );

  const [
    formError,
    setFormError,
  ] =
    useState("");

  const strongPasswordRequired =
    useMemo(
      () =>
        isStrongPasswordRequired(),
      []
    );

  useEffect(() => {
    if (initialValues) {
      setFormData(
        initialValues
      );

      return;
    }

    setFormData(
      defaultValues
    );
  }, [
    initialValues,
  ]);

  function handleChange<
    K extends keyof UserFormData,
  >(
    field: K,
    value: UserFormData[K]
  ): void {
    setFormData(
      (
        current
      ) => ({
        ...current,

        [field]:
          value,
      })
    );

    if (
      field in errors
    ) {
      setErrors(
        (
          currentErrors
        ) => ({
          ...currentErrors,

          [field]:
            undefined,
        })
      );
    }

    setFormError(
      ""
    );
  }

  function validateForm():
    boolean {
    const newErrors:
      FormErrors = {};

    const normalizedName =
      formData.name.trim();

    const normalizedEmail =
      formData.email
        .trim()
        .toLowerCase();

    const normalizedPhone =
      formData.phone.trim();

    const normalizedDepartment =
      formData.department.trim();

    if (
      !normalizedName
    ) {
      newErrors.name =
        "Informe o nome do usuário.";
    } else if (
      normalizedName.length <
      MINIMUM_NAME_LENGTH
    ) {
      newErrors.name =
        `O nome deve possuir pelo menos ${MINIMUM_NAME_LENGTH} caracteres.`;
    } else if (
      normalizedName.length >
      MAXIMUM_NAME_LENGTH
    ) {
      newErrors.name =
        `O nome deve possuir no máximo ${MAXIMUM_NAME_LENGTH} caracteres.`;
    }

    if (
      !normalizedEmail
    ) {
      newErrors.email =
        "Informe o e-mail do usuário.";
    } else if (
      normalizedEmail.length >
      MAXIMUM_EMAIL_LENGTH
    ) {
      newErrors.email =
        `O e-mail deve possuir no máximo ${MAXIMUM_EMAIL_LENGTH} caracteres.`;
    } else if (
      !EMAIL_PATTERN.test(
        normalizedEmail
      )
    ) {
      newErrors.email =
        "Informe um e-mail válido.";
    }

    const passwordWasInformed =
      formData.password.length >
      0;

    const passwordMustBeValidated =
      !isEdit ||
      passwordWasInformed;

    if (
      passwordMustBeValidated
    ) {
      if (
        !formData.password
      ) {
        newErrors.password =
          "Informe a senha do usuário.";
      } else if (
        formData.password.length >
        MAXIMUM_PASSWORD_LENGTH
      ) {
        newErrors.password =
          `A senha deve possuir no máximo ${MAXIMUM_PASSWORD_LENGTH} caracteres.`;
      } else if (
        strongPasswordRequired
      ) {
        const validation =
          validateStrongPassword(
            formData.password
          );

        if (
          !validation.valid
        ) {
          newErrors.password =
            validation.errors[0] ??
            "A senha não atende aos requisitos de segurança.";
        }
      } else if (
        formData.password.length <
        MINIMUM_BASIC_PASSWORD_LENGTH
      ) {
        newErrors.password =
          `A senha deve possuir pelo menos ${MINIMUM_BASIC_PASSWORD_LENGTH} caracteres.`;
      }
    }

    if (
      normalizedPhone
    ) {
      if (
        normalizedPhone.length >
        MAXIMUM_PHONE_LENGTH
      ) {
        newErrors.phone =
          `O telefone deve possuir no máximo ${MAXIMUM_PHONE_LENGTH} caracteres.`;
      } else if (
        !PHONE_PATTERN.test(
          normalizedPhone
        )
      ) {
        newErrors.phone =
          "Informe um telefone válido.";
      }
    }

    if (
      normalizedDepartment.length >
      MAXIMUM_DEPARTMENT_LENGTH
    ) {
      newErrors.department =
        `O departamento deve possuir no máximo ${MAXIMUM_DEPARTMENT_LENGTH} caracteres.`;
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
      ...formData,

      name:
        formData.name.trim(),

      email:
        formData.email
          .trim()
          .toLowerCase(),

      phone:
        formData.phone.trim(),

      department:
        formData.department.trim(),
    });
  }

  const passwordHelperText =
    errors.password
      ? errors.password
      : isEdit
        ? strongPasswordRequired
          ? "Deixe em branco para manter a senha atual. Uma nova senha deve ter 8 caracteres, maiúscula, minúscula, número e caractere especial."
          : "Deixe em branco para manter a senha atual."
        : strongPasswordRequired
          ? "Mínimo de 8 caracteres, com maiúscula, minúscula, número e caractere especial."
          : `A senha deve possuir pelo menos ${MINIMUM_BASIC_PASSWORD_LENGTH} caracteres.`;

  return (
    <Box
      component="form"
      onSubmit={
        handleSubmit
      }
      noValidate
    >
      <Grid
        container
        spacing={3}
      >
        {formError && (
          <Grid
            size={{
              xs:
                12,
            }}
          >
            <Alert
              severity="warning"
            >
              {formError}
            </Alert>
          </Grid>
        )}

        <Grid
          size={{
            xs:
              12,
            md:
              6,
          }}
        >
          <TextField
            fullWidth
            required
            label="Nome"
            autoComplete="name"
            value={
              formData.name
            }
            onChange={(event) =>
              handleChange(
                "name",
                event.target.value
              )
            }
            error={
              Boolean(
                errors.name
              )
            }
            helperText={
              errors.name ??
              `${formData.name.length}/${MAXIMUM_NAME_LENGTH} caracteres`
            }
            slotProps={{
              htmlInput: {
                maxLength:
                  MAXIMUM_NAME_LENGTH,
              },
            }}
          />
        </Grid>

        <Grid
          size={{
            xs:
              12,
            md:
              6,
          }}
        >
          <TextField
            fullWidth
            required
            type="email"
            label="E-mail"
            autoComplete="email"
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
              errors.email ??
              `${formData.email.length}/${MAXIMUM_EMAIL_LENGTH} caracteres`
            }
            slotProps={{
              htmlInput: {
                maxLength:
                  MAXIMUM_EMAIL_LENGTH,
              },
            }}
          />
        </Grid>

        <Grid
          size={{
            xs:
              12,
            md:
              6,
          }}
        >
          <TextField
            fullWidth
            required={
              !isEdit
            }
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
            autoComplete="new-password"
            value={
              formData.password
            }
            onChange={(event) =>
              handleChange(
                "password",
                event.target.value
              )
            }
            error={
              Boolean(
                errors.password
              )
            }
            helperText={
              passwordHelperText
            }
            slotProps={{
              htmlInput: {
                maxLength:
                  MAXIMUM_PASSWORD_LENGTH,
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
                          (
                            current
                          ) =>
                            !current
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

        <Grid
          size={{
            xs:
              12,
            md:
              6,
          }}
        >
          <TextField
            fullWidth
            label="Telefone"
            autoComplete="tel"
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
              errors.phone ??
              `${formData.phone.length}/${MAXIMUM_PHONE_LENGTH} caracteres`
            }
            slotProps={{
              htmlInput: {
                maxLength:
                  MAXIMUM_PHONE_LENGTH,
              },
            }}
          />
        </Grid>

        <Grid
          size={{
            xs:
              12,
            md:
              6,
          }}
        >
          <TextField
            fullWidth
            label="Departamento"
            value={
              formData.department
            }
            onChange={(event) =>
              handleChange(
                "department",
                event.target.value
              )
            }
            error={
              Boolean(
                errors.department
              )
            }
            helperText={
              errors.department ??
              `${formData.department.length}/${MAXIMUM_DEPARTMENT_LENGTH} caracteres`
            }
            slotProps={{
              htmlInput: {
                maxLength:
                  MAXIMUM_DEPARTMENT_LENGTH,
              },
            }}
          />
        </Grid>

        <Grid
          size={{
            xs:
              12,
            md:
              6,
          }}
        >
          <FormControl
            fullWidth
            required
          >
            <InputLabel id="user-role-label">
              Perfil
            </InputLabel>

            <Select
              labelId="user-role-label"
              label="Perfil"
              value={
                formData.role
              }
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

        <Grid
          size={{
            xs:
              12,
            md:
              6,
          }}
        >
          <FormControl
            fullWidth
            required
          >
            <InputLabel id="user-status-label">
              Status
            </InputLabel>

            <Select
              labelId="user-status-label"
              label="Status"
              value={
                formData.status
              }
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

        <Grid
          size={{
            xs:
              12,
          }}
        >
          <Box
            sx={{
              display:
                "flex",

              justifyContent:
                "flex-end",

              mt:
                2,
            }}
          >
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={
                !formData.name.trim() ||
                !formData.email.trim() ||
                (
                  !isEdit &&
                  !formData.password
                )
              }
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