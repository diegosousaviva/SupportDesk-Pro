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
  CircularProgress,
  FormControlLabel,
  Switch,
  TextField,
} from "@mui/material";

export interface CategoryFormData {
  name: string;
  description: string;
  color: string;
  active: boolean;
}

interface CategoryFormProps {
  initialValues?: CategoryFormData;

  submitLabel?: string;

  isEdit?: boolean;

  onSubmit: (
    values: CategoryFormData
  ) => void | Promise<void>;
}

interface CategoryFormErrors {
  name?: string;
  description?: string;
  color?: string;
}

const MINIMUM_NAME_LENGTH =
  3;

const MAXIMUM_NAME_LENGTH =
  80;

const MAXIMUM_DESCRIPTION_LENGTH =
  500;

const COLOR_PATTERN =
  /^#[0-9A-Fa-f]{6}$/;

const defaultValues:
  CategoryFormData = {
    name:
      "",

    description:
      "",

    color:
      "#1976d2",

    active:
      true,
  };

function CategoryForm({
  initialValues,
  submitLabel = "Salvar",
  isEdit = false,
  onSubmit,
}: CategoryFormProps) {
  const [
    values,
    setValues,
  ] =
    useState<CategoryFormData>(
      initialValues ??
        defaultValues
    );

  const [
    errors,
    setErrors,
  ] =
    useState<CategoryFormErrors>(
      {}
    );

  const [
    formError,
    setFormError,
  ] =
    useState("");

  const [
    isSubmitting,
    setIsSubmitting,
  ] =
    useState(false);

  useEffect(() => {
    setValues(
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
    K extends keyof CategoryFormData,
  >(
    field: K,
    value: CategoryFormData[K]
  ): void {
    setValues(
      (
        previous
      ) => ({
        ...previous,

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
      CategoryFormErrors = {};

    const normalizedName =
      values.name.trim();

    const normalizedDescription =
      values.description.trim();

    if (
      !normalizedName
    ) {
      newErrors.name =
        "Informe o nome da categoria.";
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
      normalizedDescription.length >
      MAXIMUM_DESCRIPTION_LENGTH
    ) {
      newErrors.description =
        `A descrição deve possuir no máximo ${MAXIMUM_DESCRIPTION_LENGTH} caracteres.`;
    }

    if (
      !COLOR_PATTERN.test(
        values.color
      )
    ) {
      newErrors.color =
        "Informe uma cor hexadecimal válida.";
    }

    setErrors(
      newErrors
    );

    const valid =
      Object.keys(
        newErrors
      ).length ===
      0;

    if (
      !valid
    ) {
      setFormError(
        "Revise os campos destacados antes de continuar."
      );
    }

    return valid;
  }

  async function handleSubmit(
    event:
      FormEvent<HTMLFormElement>
  ): Promise<void> {
    event.preventDefault();

    if (
      isSubmitting
    ) {
      return;
    }

    setFormError(
      ""
    );

    if (
      !validateForm()
    ) {
      return;
    }

    try {
      setIsSubmitting(
        true
      );

      await onSubmit({
        name:
          values.name.trim(),

        description:
          values.description.trim(),

        color:
          values.color,

        active:
          values.active,
      });
    } finally {
      setIsSubmitting(
        false
      );
    }
  }

  const normalizedName =
    values.name.trim();

  const canSubmit =
    normalizedName.length >=
      MINIMUM_NAME_LENGTH &&
    !isSubmitting;

  return (
    <Box
      component="form"
      onSubmit={
        handleSubmit
      }
      noValidate
    >
      {formError && (
        <Alert
          severity="warning"
          sx={{
            mb:
              2,
          }}
        >
          {formError}
        </Alert>
      )}

      <TextField
        fullWidth
        required
        label="Nome"
        margin="normal"
        value={
          values.name
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
          `${values.name.length}/${MAXIMUM_NAME_LENGTH} caracteres`
        }
        disabled={
          isSubmitting
        }
        slotProps={{
          htmlInput: {
            maxLength:
              MAXIMUM_NAME_LENGTH,
          },
        }}
      />

      <TextField
        fullWidth
        multiline
        rows={3}
        label="Descrição"
        margin="normal"
        value={
          values.description
        }
        onChange={(event) =>
          handleChange(
            "description",
            event.target.value
          )
        }
        error={
          Boolean(
            errors.description
          )
        }
        helperText={
          errors.description ??
          `${values.description.length}/${MAXIMUM_DESCRIPTION_LENGTH} caracteres`
        }
        disabled={
          isSubmitting
        }
        slotProps={{
          htmlInput: {
            maxLength:
              MAXIMUM_DESCRIPTION_LENGTH,
          },
        }}
      />

      <TextField
        fullWidth
        type="color"
        label="Cor"
        margin="normal"
        value={
          values.color
        }
        onChange={(event) =>
          handleChange(
            "color",
            event.target.value
          )
        }
        error={
          Boolean(
            errors.color
          )
        }
        helperText={
          errors.color ??
          "Escolha a cor utilizada para identificar a categoria."
        }
        disabled={
          isSubmitting
        }
        slotProps={{
          inputLabel: {
            shrink:
              true,
          },
        }}
      />

      {isEdit && (
        <FormControlLabel
          control={
            <Switch
              checked={
                values.active
              }
              onChange={(event) =>
                handleChange(
                  "active",
                  event.target.checked
                )
              }
              disabled={
                isSubmitting
              }
            />
          }
          label="Categoria ativa"
          sx={{
            mt:
              2,
          }}
        />
      )}

      <Box
        sx={{
          display:
            "flex",

          justifyContent:
            "flex-end",

          mt:
            3,
        }}
      >
        <Button
          type="submit"
          variant="contained"
          disabled={
            !canSubmit
          }
          startIcon={
            isSubmitting
              ? (
                <CircularProgress
                  size={18}
                  color="inherit"
                />
              )
              : undefined
          }
        >
          {isSubmitting
            ? "Salvando..."
            : submitLabel}
        </Button>
      </Box>
    </Box>
  );
}

export default CategoryForm;