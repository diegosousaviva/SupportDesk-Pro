import {
  Component,
} from "react";

import type {
  ErrorInfo,
  ReactNode,
} from "react";

import {
  ErrorOutlineOutlined,
  HomeOutlined,
  RefreshOutlined,
} from "@mui/icons-material";

import {
  Box,
  Button,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

interface GlobalErrorBoundaryProps {
  children: ReactNode;
}

interface GlobalErrorBoundaryState {
  hasError: boolean;
}

class GlobalErrorBoundary extends Component<
  GlobalErrorBoundaryProps,
  GlobalErrorBoundaryState
> {
  state:
    GlobalErrorBoundaryState = {
      hasError:
        false,
    };

  static getDerivedStateFromError():
    GlobalErrorBoundaryState {
    return {
      hasError:
        true,
    };
  }

  componentDidCatch(
    error: Error,
    errorInfo: ErrorInfo
  ): void {
    console.error(
      "Erro não tratado na aplicação:",
      error,
      errorInfo
    );
  }

  handleReload = (): void => {
    window.location.reload();
  };

  handleGoToDashboard = (): void => {
    window.location.href =
      "/dashboard";
  };

  render() {
    if (
      this.state.hasError
    ) {
      return (
        <Box
          sx={{
            minHeight:
              "100vh",

            display:
              "flex",

            alignItems:
              "center",

            justifyContent:
              "center",

            px: 2,

            py: 4,

            bgcolor:
              "background.default",
          }}
        >
          <Paper
            variant="outlined"
            sx={{
              width:
                "100%",

              maxWidth:
                560,

              p: {
                xs: 3,
                sm: 4,
              },

              textAlign:
                "center",
            }}
          >
            <Stack
              spacing={2.5}
              alignItems="center"
            >
              <ErrorOutlineOutlined
                color="error"
                sx={{
                  fontSize:
                    64,
                }}
              />

              <Stack
                spacing={1}
              >
                <Typography
                  variant="h5"
                  fontWeight={700}
                >
                  Ocorreu um erro inesperado
                </Typography>

                <Typography
                  color="text.secondary"
                >
                  Não foi possível concluir esta operação. Você pode tentar recarregar a aplicação ou voltar ao Dashboard.
                </Typography>
              </Stack>

              <Stack
                direction={{
                  xs:
                    "column",
                  sm:
                    "row",
                }}
                spacing={1.5}
                sx={{
                  width:
                    "100%",
                }}
              >
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={
                    <RefreshOutlined />
                  }
                  onClick={
                    this.handleReload
                  }
                >
                  Tentar novamente
                </Button>

                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={
                    <HomeOutlined />
                  }
                  onClick={
                    this.handleGoToDashboard
                  }
                >
                  Voltar ao Dashboard
                </Button>
              </Stack>

              <Typography
                variant="caption"
                color="text.secondary"
              >
                Se o problema continuar, consulte o console do navegador para obter detalhes técnicos.
              </Typography>
            </Stack>
          </Paper>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default GlobalErrorBoundary;