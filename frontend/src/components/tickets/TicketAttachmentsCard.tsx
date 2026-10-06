import { useState } from "react";
import { Alert, Button, Divider, Paper, Stack, Typography } from "@mui/material";
import AttachFileOutlinedIcon from "@mui/icons-material/AttachFileOutlined";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import { useSnackbar } from "../../hooks/useSnackbar";
import { downloadTicketAttachment } from "../../services/ticketAttachmentService";
import type { TicketAttachment } from "../../types/TicketAttachment";

interface Props {
  attachments: TicketAttachment[];
  loading: boolean;
  error: string;
}

function formatFileSize(size: number): string {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`;
  return `${(size / (1024 * 1024)).toFixed(2)} MB`;
}

export default function TicketAttachmentsCard({ attachments, loading, error }: Props) {
  const { showSnackbar } = useSnackbar();
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  async function handleDownload(attachment: TicketAttachment): Promise<void> {
    if (downloadingId) return;
    setDownloadingId(attachment.id);
    try {
      await downloadTicketAttachment(attachment.id);
    } catch (error) {
      showSnackbar(error instanceof Error ? error.message : "Não foi possível baixar o anexo.", { severity: "error" });
    } finally {
      setDownloadingId(null);
    }
  }

  return (
    <Paper sx={{ p: { xs: 2.5, md: 4 } }}>
      <Stack direction="row" spacing={1} alignItems="center">
        <AttachFileOutlinedIcon color="primary" />
        <Typography variant="h6" fontWeight={700}>Anexos</Typography>
      </Stack>
      <Divider sx={{ my: 2 }} />
      {error ? (
        <Alert severity="error">{error}</Alert>
      ) : loading ? (
        <Typography color="text.secondary">Carregando anexos...</Typography>
      ) : attachments.length === 0 ? (
        <Alert severity="info">Este chamado não possui anexos.</Alert>
      ) : (
        <Stack spacing={1}>
          {attachments.map((attachment) => (
            <Paper key={attachment.id} variant="outlined" sx={{ p: 1.5 }}>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1} justifyContent="space-between" alignItems={{ xs: "stretch", sm: "center" }}>
                <BoxText name={attachment.fileName} size={attachment.fileSize} />
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<DownloadOutlinedIcon />}
                  loading={downloadingId === attachment.id}
                  disabled={downloadingId !== null}
                  onClick={() => void handleDownload(attachment)}
                >Baixar</Button>
              </Stack>
            </Paper>
          ))}
        </Stack>
      )}
    </Paper>
  );
}

function BoxText({ name, size }: { name: string; size: number }) {
  return (
    <Stack sx={{ minWidth: 0 }}>
      <Typography variant="body2" fontWeight={600} sx={{ overflowWrap: "anywhere" }}>{name}</Typography>
      <Typography variant="caption" color="text.secondary">{formatFileSize(size)}</Typography>
    </Stack>
  );
}
