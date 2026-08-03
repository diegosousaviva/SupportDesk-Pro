import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  Box,
  Button,
  Paper,
  TextField,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";

import {
  Permissions,
} from "../../auth/permissions";

import ConfirmDialog from "../../components/common/ConfirmDialog";
import PageHeader from "../../components/common/PageHeader";
import MainLayout from "../../components/layout/MainLayout";
import StoreStatistics from "../../components/stores/StoreStatistics";
import StoreTable from "../../components/stores/StoreTable";

import {
  usePermissions,
} from "../../hooks/usePermissions";

import {
  useSnackbar,
} from "../../hooks/useSnackbar";

import {
  deleteStore,
  getStores,
} from "../../services/storeService";

import type {
  Store,
} from "../../types/Store";

function StoreListPage() {
  const navigate =
    useNavigate();

  const {
    can,
  } = usePermissions();

  const {
    showSuccess,
    showError,
  } = useSnackbar();

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    stores,
    setStores,
  ] = useState<Store[]>([]);

  const [
    selectedStoreId,
    setSelectedStoreId,
  ] = useState<number | null>(
    null
  );

  const [
    deleteDialogOpen,
    setDeleteDialogOpen,
  ] = useState(false);

  const [
    deleting,
    setDeleting,
  ] = useState(false);

  useEffect(() => {
    setStores(
      getStores()
    );
  }, []);

  const filteredStores =
    useMemo(() => {
      const value =
        search
          .trim()
          .toLocaleLowerCase(
            "pt-BR"
          );

      return stores.filter(
        (store) => {
          const searchableContent =
            [
              store.code,
              store.name,
              store.city,
              store.state,
              store.manager,
              store.email,
              store.phone,
            ]
              .join(" ")
              .toLocaleLowerCase(
                "pt-BR"
              );

          return searchableContent.includes(
            value
          );
        }
      );
    }, [
      stores,
      search,
    ]);

  function handleDeleteClick(
    storeId: number
  ): void {
    setSelectedStoreId(
      storeId
    );

    setDeleteDialogOpen(
      true
    );
  }

  function handleCancelDelete(): void {
    if (deleting) {
      return;
    }

    setDeleteDialogOpen(
      false
    );

    setSelectedStoreId(
      null
    );
  }

  async function handleConfirmDelete():
    Promise<void> {
    if (
      selectedStoreId ===
      null
    ) {
      return;
    }

    const storeId =
      selectedStoreId;

    try {
      setDeleting(
        true
      );

      const deleted =
        await Promise.resolve(
          deleteStore(
            storeId
          )
        );

      if (!deleted) {
        throw new Error(
          "A loja não foi encontrada."
        );
      }

      setStores(
        (currentStores) =>
          currentStores.filter(
            (store) =>
              store.id !==
              storeId
          )
      );

      setDeleteDialogOpen(
        false
      );

      setSelectedStoreId(
        null
      );

      showSuccess(
        "Loja excluída com sucesso."
      );
    } catch (error) {
      console.error(
        "Erro ao excluir loja:",
        error
      );

      setDeleteDialogOpen(
        false
      );

      setSelectedStoreId(
        null
      );

      showError(
        error instanceof Error
          ? error.message
          : "Não foi possível excluir a loja."
      );
    } finally {
      setDeleting(
        false
      );
    }
  }

  return (
    <MainLayout title="Lojas">
      <PageHeader
        title="Gestão de Lojas"
        subtitle="Cadastre e gerencie as unidades da empresa."
      />

      <StoreStatistics
        stores={
          filteredStores
        }
      />

      <Paper
        sx={{
          p: 2,
          mb: 3,
        }}
      >
        <Box
          display="flex"
          gap={2}
          flexWrap="wrap"
          justifyContent="space-between"
        >
          <TextField
            label="Pesquisar loja"
            placeholder="Código, nome, cidade, gerente..."
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
            sx={{
              minWidth: {
                xs: "100%",
                sm: 320,
              },
              flex: 1,
            }}
          />

          {can(
            Permissions.stores.create
          ) && (
            <Button
              variant="contained"
              startIcon={
                <AddIcon />
              }
              onClick={() =>
                navigate(
                  "/stores/new"
                )
              }
            >
              Nova Loja
            </Button>
          )}
        </Box>
      </Paper>

      <StoreTable
        stores={
          filteredStores
        }
        onView={(storeId) =>
          navigate(
            `/stores/${storeId}`
          )
        }
        onEdit={(storeId) =>
          navigate(
            `/stores/${storeId}/edit`
          )
        }
        onDelete={
          handleDeleteClick
        }
      />

      <ConfirmDialog
        open={
          deleteDialogOpen
        }
        title="Excluir loja"
        message="Deseja realmente excluir esta loja?"
        confirmLabel="Excluir"
        confirmColor="error"
        loading={deleting}
        onCancel={
          handleCancelDelete
        }
        onConfirm={
          handleConfirmDelete
        }
      />
    </MainLayout>
  );
}

export default StoreListPage;