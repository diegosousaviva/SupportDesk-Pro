import {
  useEffect,
  useState,
} from "react";

import {
  Box,
  Button,
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

const defaultValues: CategoryFormData = {
  name: "",
  description: "",
  color: "#1976d2",
  active: true,
};

function CategoryForm({
  initialValues,
  submitLabel = "Salvar",
  isEdit = false,
  onSubmit,
}: CategoryFormProps) {
  const [values, setValues] =
    useState<CategoryFormData>(
      initialValues ?? defaultValues
    );

  useEffect(() => {
    if (initialValues) {
      setValues(initialValues);
    }
  }, [initialValues]);

  function handleChange(
    field: keyof CategoryFormData,
    value: string | boolean
  ) {
    setValues((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    await onSubmit(values);
  }

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
    >
      <TextField
        fullWidth
        required
        label="Nome"
        margin="normal"
        value={values.name}
        onChange={(event) =>
          handleChange(
            "name",
            event.target.value
          )
        }
      />

      <TextField
        fullWidth
        multiline
        rows={3}
        label="Descrição"
        margin="normal"
        value={values.description}
        onChange={(event) =>
          handleChange(
            "description",
            event.target.value
          )
        }
      />

      <TextField
        fullWidth
        type="color"
        label="Cor"
        margin="normal"
        value={values.color}
        onChange={(event) =>
          handleChange(
            "color",
            event.target.value
          )
        }
        InputLabelProps={{
          shrink: true,
        }}
      />

      {isEdit && (
        <FormControlLabel
          control={
            <Switch
              checked={values.active}
              onChange={(event) =>
                handleChange(
                  "active",
                  event.target.checked
                )
              }
            />
          }
          label="Categoria ativa"
          sx={{ mt: 2 }}
        />
      )}

      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          mt: 3,
        }}
      >
        <Button
          type="submit"
          variant="contained"
        >
          {submitLabel}
        </Button>
      </Box>
    </Box>
  );
}

export default CategoryForm;