import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

import {
  ArrowBack,
  EditOutlined,
  EmailOutlined,
  LocationOnOutlined,
  PhoneOutlined,
  PersonOutline,
  StoreOutlined,
} from "@mui/icons-material";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  Permissions,
} from "../../auth/permissions";

import MainLayout from "../../components/layout/MainLayout";

import {
  usePermissions,
} from "../../hooks/usePermissions";

import {
  getStoreById,
} from "../../services/storeService";

function StoreDetailsPage() {
  const navigate =
    useNavigate();

  const {
    id,
  } = useParams();

  const {
    can,
  } = usePermissions();

  const storeId =
    Number(id);

  const store =
    getStoreById(
      storeId
    );

  function handleBack(): void {
    navigate(
      "/stores"
    );
  }

  if (!store) {
    return (
      <MainLayout title="Detalhes da Loja">
        <Alert severity="error">
          Loja não encontrada.
        </Alert>

        <Button
          variant="outlined"
          startIcon={
            <ArrowBack />
          }
          onClick={
            handleBack
          }
          sx={{
            mt: 2,
          }}
        >
          Voltar para lojas
        </Button>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Detalhes da Loja">
      <Stack spacing={3}>
        <Stack
          direction={{
            xs: "column",
            sm: "row",
          }}
          spacing={2}
          justifyContent="space-between"
          alignItems={{
            xs: "flex-start",
            sm: "center",
          }}
        >
          <Box>
            <Button
              variant="text"
              startIcon={
                <ArrowBack />
              }
              onClick={
                handleBack
              }
              sx={{
                mb: 1,
              }}
            >
              Voltar para lojas
            </Button>

            <Typography
              variant="h4"
              component="h1"
              fontWeight={700}
            >
              {store.name}
            </Typography>

            <Typography
              color="text.secondary"
            >
              Código: {store.code}
            </Typography>
          </Box>

          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
          >
            <Chip
              label={
                store.status
              }
              color={
                store.status ===
                "Ativa"
                  ? "success"
                  : "default"
              }
            />

            {can(
              Permissions.stores.edit
            ) && (
              <Button
                variant="contained"
                startIcon={
                  <EditOutlined />
                }
                onClick={() =>
                  navigate(
                    `/stores/${store.id}/edit`
                  )
                }
              >
                Editar loja
              </Button>
            )}
          </Stack>
        </Stack>

        <Paper
          variant="outlined"
          sx={{
            p: {
              xs: 2.5,
              md: 4,
            },
          }}
        >
          <Stack spacing={3}>
            <Stack
              direction="row"
              spacing={1.5}
              alignItems="center"
            >
              <StoreOutlined
                color="primary"
              />

              <Typography
                variant="h6"
                fontWeight={700}
              >
                Informações gerais
              </Typography>
            </Stack>

            <Divider />

            <Stack
              direction={{
                xs: "column",
                md: "row",
              }}
              spacing={4}
            >
              <Box flex={1}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  Código
                </Typography>

                <Typography
                  fontWeight={700}
                >
                  {store.code}
                </Typography>
              </Box>

              <Box flex={2}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  Nome da loja
                </Typography>

                <Typography
                  fontWeight={700}
                >
                  {store.name}
                </Typography>
              </Box>

              <Box flex={1}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  Status
                </Typography>

                <Typography
                  fontWeight={700}
                >
                  {store.status}
                </Typography>
              </Box>
            </Stack>
          </Stack>
        </Paper>

        <Paper
          variant="outlined"
          sx={{
            p: {
              xs: 2.5,
              md: 4,
            },
          }}
        >
          <Stack spacing={3}>
            <Stack
              direction="row"
              spacing={1.5}
              alignItems="center"
            >
              <LocationOnOutlined
                color="primary"
              />

              <Typography
                variant="h6"
                fontWeight={700}
              >
                Localização
              </Typography>
            </Stack>

            <Divider />

            <Stack spacing={2}>
              <Box>
                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  Endereço
                </Typography>

                <Typography>
                  {store.address ||
                    "Não informado"}
                </Typography>
              </Box>

              <Stack
                direction={{
                  xs: "column",
                  md: "row",
                }}
                spacing={4}
              >
                <Box flex={2}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    Cidade
                  </Typography>

                  <Typography>
                    {store.city ||
                      "Não informado"}
                  </Typography>
                </Box>

                <Box flex={1}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    Estado
                  </Typography>

                  <Typography>
                    {store.state ||
                      "Não informado"}
                  </Typography>
                </Box>

                <Box flex={1}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    CEP
                  </Typography>

                  <Typography>
                    {store.zipCode ||
                      "Não informado"}
                  </Typography>
                </Box>
              </Stack>
            </Stack>
          </Stack>
        </Paper>

        <Paper
          variant="outlined"
          sx={{
            p: {
              xs: 2.5,
              md: 4,
            },
          }}
        >
          <Stack spacing={3}>
            <Typography
              variant="h6"
              fontWeight={700}
            >
              Contato e responsável
            </Typography>

            <Divider />

            <Stack
              direction={{
                xs: "column",
                md: "row",
              }}
              spacing={4}
            >
              <Stack
                direction="row"
                spacing={1.5}
                flex={1}
              >
                <PhoneOutlined
                  color="action"
                />

                <Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    Telefone
                  </Typography>

                  <Typography>
                    {store.phone ||
                      "Não informado"}
                  </Typography>
                </Box>
              </Stack>

              <Stack
                direction="row"
                spacing={1.5}
                flex={1}
              >
                <EmailOutlined
                  color="action"
                />

                <Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    E-mail
                  </Typography>

                  <Typography>
                    {store.email ||
                      "Não informado"}
                  </Typography>
                </Box>
              </Stack>

              <Stack
                direction="row"
                spacing={1.5}
                flex={1}
              >
                <PersonOutline
                  color="action"
                />

                <Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    Gerente
                  </Typography>

                  <Typography>
                    {store.manager ||
                      "Não informado"}
                  </Typography>
                </Box>
              </Stack>
            </Stack>
          </Stack>
        </Paper>

        <Paper
          variant="outlined"
          sx={{
            p: {
              xs: 2.5,
              md: 4,
            },
          }}
        >
          <Typography
            variant="h6"
            fontWeight={700}
            sx={{
              mb: 2,
            }}
          >
            Observações
          </Typography>

          <Typography
            color={
              store.notes
                ? "text.primary"
                : "text.secondary"
            }
            sx={{
              whiteSpace: "pre-wrap",
            }}
          >
            {store.notes ||
              "Nenhuma observação cadastrada."}
          </Typography>
        </Paper>

        <Typography
          variant="caption"
          color="text.secondary"
        >
          Criada em{" "}
          {new Date(
            store.createdAt
          ).toLocaleString(
            "pt-BR"
          )}
          {" • "}
          Atualizada em{" "}
          {new Date(
            store.updatedAt
          ).toLocaleString(
            "pt-BR"
          )}
        </Typography>
      </Stack>
    </MainLayout>
  );
}

export default StoreDetailsPage;