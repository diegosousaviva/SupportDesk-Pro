import { useCallback, useEffect, useRef, useState } from "react";
import { Button, Stack, Tooltip } from "@mui/material";
import VolumeUpOutlinedIcon from "@mui/icons-material/VolumeUpOutlined";
import VolumeOffOutlinedIcon from "@mui/icons-material/VolumeOffOutlined";
import { useAuth } from "../../hooks/useAuth";
import { useSnackbar } from "../../hooks/useSnackbar";
import { getTicketAlerts, streamTicketAlerts } from "../../services/dataApi";

export default function TicketSoundAlert() {
  const { user } = useAuth();
  const { showSnackbar, showError } = useSnackbar();
  const userId = user?.id;
  const canReceive = user?.role === "Administrador" || user?.role === "Técnico";
  const audio = useRef<HTMLAudioElement | null>(null);
  const soundEnabled = useRef(false);
  const [enabledFor, setEnabledFor] = useState<number | null>(null);
  const [alarmFor, setAlarmFor] = useState<number | null>(null);
  const enabled = enabledFor === userId;
  const ringing = alarmFor === userId;

  const silence = useCallback(() => {
    const element = audio.current;
    if (element) {
      element.pause();
      element.currentTime = 0;
      element.loop = false;
    }
    setAlarmFor(null);
  }, []);

  useEffect(() => {
    if (!canReceive || userId === undefined) return;
    const element = new Audio(import.meta.env.BASE_URL + "audio/chamada-crescente.wav");
    element.preload = "auto";
    element.volume = 1;
    audio.current = element;
    soundEnabled.current = false;

    function acknowledgeOnReturn() {
      if (document.visibilityState === "visible" && document.hasFocus()) silence();
    }
    window.addEventListener("focus", acknowledgeOnReturn);
    document.addEventListener("visibilitychange", acknowledgeOnReturn);
    return () => {
      window.removeEventListener("focus", acknowledgeOnReturn);
      document.removeEventListener("visibilitychange", acknowledgeOnReturn);
      soundEnabled.current = false;
      element.pause();
      element.removeAttribute("src");
      element.load();
      audio.current = null;
      setEnabledFor(null);
      setAlarmFor(null);
    };
  }, [canReceive, userId, silence]);

  useEffect(() => {
    if (!canReceive || userId === undefined) return;
    const controller = new AbortController();
    let cursor: number | undefined;
    let timeout: number;

    function receiveAlert(result: { latestId: number; count: number }) {
      if (controller.signal.aborted) return;
      const hasNewTickets = cursor !== undefined && result.latestId > cursor && result.count > 0;
      cursor = result.latestId;
      if (!hasNewTickets) return;
      showSnackbar(
        result.count === 1 ? "Uma loja abriu um novo chamado." : "As lojas abriram " + result.count + " novos chamados.",
        { severity: "info" },
      );
      const element = audio.current;
      if (!soundEnabled.current || !element) return;
      setAlarmFor(userId ?? null);
      if (!element.loop) element.currentTime = 0;
      element.loop = true;
      void element.play().catch(() => {
        if (controller.signal.aborted || audio.current !== element || !element.loop) return;
        soundEnabled.current = false;
        setEnabledFor(null);
        silence();
        showError("O navegador bloqueou o som. Clique em Ativar som para liberar o alerta.");
      });
    }

    async function connect() {
      try {
        // The server checks for new tickets even when browser timers are throttled.
        await streamTicketAlerts(cursor ?? 0, controller.signal, receiveAlert);
      } catch (error) {
        if (controller.signal.aborted) return;
        console.error("Não foi possível manter a conexão de alertas.", error);
        try {
          receiveAlert(await getTicketAlerts(cursor ?? 0));
        } catch (fallbackError) {
          if (!controller.signal.aborted) console.error("Não foi possível consultar os alertas.", fallbackError);
        }
      } finally {
        if (!controller.signal.aborted) timeout = window.setTimeout(() => { void connect(); }, 15_000);
      }
    }
    void connect();
    return () => {
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [canReceive, userId, showSnackbar, showError, silence]);

  async function toggleSound() {
    if (enabled) {
      soundEnabled.current = false;
      setEnabledFor(null);
      silence();
      return;
    }
    const element = audio.current;
    if (!element) return;
    try {
      element.loop = false;
      element.currentTime = 0;
      await element.play();
      if (audio.current !== element) return;
      soundEnabled.current = true;
      setEnabledFor(userId ?? null);
    } catch {
      if (audio.current === element) showError("Não foi possível ativar o som. Verifique as permissões de áudio do navegador.");
    }
  }

  if (!canReceive) return null;
  return (
    <Stack direction="row" spacing={1} sx={{ position: "fixed", bottom: 16, right: 16, zIndex: (theme) => theme.zIndex.appBar + 1 }}>
      {ringing && (
        <Button variant="contained" color="warning" onClick={silence}>
          Silenciar alerta
        </Button>
      )}
      <Tooltip title="Chamada crescente. O alerta repete até você voltar à aba ou clicar em Silenciar alerta. Ao ativar, ouça o teste de 6 segundos.">
        <Button
          variant="contained"
          size="small"
          startIcon={enabled ? <VolumeUpOutlinedIcon /> : <VolumeOffOutlinedIcon />}
          onClick={() => { void toggleSound(); }}
          aria-pressed={enabled}
        >
          {enabled ? "Desativar som" : "Ativar som"}
        </Button>
      </Tooltip>
    </Stack>
  );
}
