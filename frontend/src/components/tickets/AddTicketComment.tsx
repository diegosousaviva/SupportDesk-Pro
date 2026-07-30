import {
  useState,
} from "react";

import {
  Alert,
  Button,
  Paper,
  Stack,
  TextField,
} from "@mui/material";

interface AddTicketCommentProps {
  onSubmit: (
    message: string
  ) => void;
  disabled?: boolean;
}

export default function AddTicketComment({
  onSubmit,
  disabled = false,
}: AddTicketCommentProps) {
  const [
    message,
    setMessage,
  ] = useState("");

  const [
    error,
    setError,
  ] = useState("");

  function handleSubmit(): void {
    if (disabled) {
      return;
    }

    const trimmedMessage =
      message.trim();

    if (!trimmedMessage) {
      setError(
        "Digite um comentário."
      );

      return;
    }

    onSubmit(trimmedMessage);

    setMessage("");
    setError("");
  }

  return (
    <Paper
      variant="outlined"
      sx={{ p: 2 }}
    >
      <Stack spacing={2}>
        {error && (
          <Alert severity="error">
            {error}
          </Alert>
        )}

        <TextField
          label="Novo comentário"
          multiline
          minRows={4}
          fullWidth
          value={message}
          disabled={disabled}
          onChange={(event) => {
            setMessage(
              event.target.value
            );

            if (error) {
              setError("");
            }
          }}
          helperText={`${message.length}/2000 caracteres`}
          slotProps={{
            htmlInput: {
              maxLength: 2000,
            },
          }}
        />

        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={disabled}
        >
          {disabled
            ? "Adicionando..."
            : "Adicionar comentário"}
        </Button>
      </Stack>
    </Paper>
  );
}