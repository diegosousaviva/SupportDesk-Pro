import { useEffect, useRef, useState } from "react";
import { Button, Tooltip } from "@mui/material";
import VolumeUpOutlinedIcon from "@mui/icons-material/VolumeUpOutlined";
import VolumeOffOutlinedIcon from "@mui/icons-material/VolumeOffOutlined";
import { useAuth } from "../../hooks/useAuth";
import { useSnackbar } from "../../hooks/useSnackbar";
import { getTicketAlerts } from "../../services/dataApi";

function playChime(context: AudioContext): void {
  const start = context.currentTime;
  for (const [offset, frequency] of [[0, 784], [0.22, 1046]]) {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0, start + offset);
    gain.gain.linearRampToValueAtTime(0.15, start + offset + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, start + offset + 0.4);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(start + offset);
    oscillator.stop(start + offset + 0.42);
    oscillator.onended = () => {
      oscillator.disconnect();
      gain.disconnect();
    };
  }
}

export default function TicketSoundAlert() {
  const { user } = useAuth();
  const { showSnackbar, showError } = useSnackbar();
  const userId = user?.id;
  const audio = useRef<AudioContext | null>(null);
  const [enabledFor, setEnabledFor] = useState<number | null>(null);
  const enabled = enabledFor === userId;
  const soundEnabled = useRef(false);
  const canReceive = user?.role === "Administrador" || user?.role === "Técnico";

  useEffect(() => {
    soundEnabled.current = enabled;
  }, [enabled]);

  useEffect(() => {
    if (!canReceive || userId === undefined) return;
    let cancelled = false;
    let cursor: number | undefined;
    let timeout: number;
    async function poll() {
      try {
        const result = await getTicketAlerts(cursor ?? 0);
        if (cancelled) return;
        if (cursor !== undefined && result.count > 0) {
          showSnackbar(
            result.count === 1 ? "Uma loja abriu um novo chamado." : `As lojas abriram ${result.count} novos chamados.`,
            { severity: "info" },
          );
          if (soundEnabled.current && audio.current?.state === "running") playChime(audio.current);
        }
        cursor = result.latestId;
      } catch (error) {
        if (!cancelled) console.error("Não foi possível atualizar os alertas de chamados.", error);
      } finally {
        if (!cancelled) timeout = window.setTimeout(() => { void poll(); }, 15_000);
      }
    }
    void poll();
    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [canReceive, userId, showSnackbar]);

  useEffect(() => {
    return () => {
      const context = audio.current;
      audio.current = null;
      if (context) void context.close();
    };
  }, [user?.id]);

  async function toggleSound() {
    if (enabled) {
      setEnabledFor(null);
      return;
    }
    try {
      audio.current ??= new AudioContext();
      await audio.current.resume();
      playChime(audio.current);
      setEnabledFor(user?.id ?? null);
    } catch {
      showError("Não foi possível ativar o som. Verifique as permissões de áudio do navegador.");
    }
  }

  if (!canReceive) return null;
  return (
    <Tooltip title="Alerta de novos chamados das lojas enquanto o sistema estiver aberto. Consulta a cada 15 segundos.">
      <Button
        variant="contained"
        size="small"
        startIcon={enabled ? <VolumeUpOutlinedIcon /> : <VolumeOffOutlinedIcon />}
        onClick={() => { void toggleSound(); }}
        aria-pressed={enabled}
        sx={{ position: "fixed", bottom: 16, right: 16, zIndex: (theme) => theme.zIndex.appBar + 1 }}
      >
        {enabled ? "Desativar som" : "Ativar som"}
      </Button>
    </Tooltip>
  );
}
