import {
  useState,
} from "react";

import type {
  FormEvent,
} from "react";

import {
  Box,
  Button,
  Stack,
  Typography,
} from "@mui/material";

import {
  ArrowBack,
} from "@mui/icons-material";

import {
  useNavigate,
} from "react-router-dom";

import InventoryForm, {
  NO_RESPONSIBLE_VALUE,
} from "../../components/inventory/InventoryForm";

import type {
  InventoryFormData,
} from "../../components/inventory/InventoryForm";

import MainLayout from "../../components/layout/MainLayout";

import {
  useAuth,
} from "../../contexts/AuthContext";

import {
  useSnackbar,
} from "../../hooks/useSnackbar";

import {
  addInventoryHistoryEvent,
} from "../../services/inventoryHistoryService";

import {
  createInventoryItem,
  previewNextAutomaticTag,
} from "../../services/inventoryService";

import {
  getStores,
} from "../../services/storeService";

import {
  getUsers,
} from "../../services/userService";

const initialFormData:
  InventoryFormData = {
    tagMode:
      "Automática",

    tag:
      "",

    assetNumber:
      "",

    storeId:
      "",

    category:
      "",

    description:
      "",

    manufacturer:
      "",

    model:
      "",

    serialNumber:
      "",

    location:
      "",

    value:
      "",

    acquisitionDate:
      "",

    warrantyUntil:
      "",

    responsibleUserId:
      NO_RESPONSIBLE_VALUE,

    status:
      "Em uso",

    condition:
      "Bom",

    notes:
      "",
  };

function CreateInventoryPage() {
  const navigate =
    useNavigate();

  const {
    user,
  } = useAuth();

  const {
    showSnackbar,
  } = useSnackbar();

  const [
    formData,
    setFormData,
  ] =
    useState<InventoryFormData>(
      initialFormData
    );

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const [
    saving,
    setSaving,
  ] = useState(false);

  const stores =
    getStores();

  const users =
    getUsers();

  const automaticTagPreview =
    previewNextAutomaticTag();

  function handleChange(
    field:
      keyof InventoryFormData,
    value: string
  ): void {
    setFormData(
      (
        currentData
      ) => ({
        ...currentData,

        [field]:
          value,
      })
    );

    setErrorMessage("");
  }

  function handleCancel():
    void {
    if (saving) {
      return;
    }

    navigate(
      "/inventory"
    );
  }

  function handleSubmit(
    event:
      FormEvent<HTMLFormElement>
  ): void {
    event.preventDefault();

    setErrorMessage("");

    try {
      setSaving(
        true
      );

      const numericStoreId =
        Number(
          formData.storeId
        );

      const numericValue =
        formData.value.trim()
          ? Number(
              formData.value
            )
          : 0;

      const responsibleUserId =
        formData.responsibleUserId ===
        NO_RESPONSIBLE_VALUE
          ? null
          : Number(
              formData.responsibleUserId
            );

      const createdItem =
        createInventoryItem({
          tagMode:
            formData.tagMode,

          tag:
            formData.tagMode ===
            "Manual"
              ? formData.tag
              : undefined,

          assetNumber:
            formData.assetNumber,

          storeId:
            numericStoreId,

          category:
            formData.category,

          description:
            formData.description,

          manufacturer:
            formData.manufacturer,

          model:
            formData.model,

          serialNumber:
            formData.serialNumber,

          location:
            formData.location,

          value:
            numericValue,

          acquisitionDate:
            formData.acquisitionDate,

          warrantyUntil:
            formData.warrantyUntil,

          responsibleUserId,

          status:
            formData.status,

          condition:
            formData.condition,

          notes:
            formData.notes,
        });

      try {
        addInventoryHistoryEvent({
          inventoryItemId:
            createdItem.id,

          type:
            "Cadastro",

          title:
            "Equipamento cadastrado",

          description:
            `O equipamento ${createdItem.tag} foi cadastrado no inventário com a situação "${createdItem.status}" e o estado físico "${createdItem.condition}".`,

          performedByUserId:
            user?.id ?? null,
        });
      } catch (historyError) {
        console.error(
          "O equipamento foi criado, mas não foi possível registrar o histórico.",
          historyError
        );
      }

      showSnackbar(
        `Equipamento ${createdItem.tag} cadastrado com sucesso.`,
        {
          severity:
            "success",
        }
      );

      navigate(
        `/inventory/${createdItem.id}`
      );
    } catch (error) {
      console.error(
        "Não foi possível cadastrar o equipamento.",
        error
      );

      const message =
        error instanceof Error
          ? error.message
          : "Não foi possível cadastrar o equipamento.";

      setErrorMessage(
        message
      );

      showSnackbar(
        message,
        {
          severity:
            "error",
        }
      );
    } finally {
      setSaving(
        false
      );
    }
  }

  return (
    <MainLayout title="Novo Equipamento">
      <Stack spacing={3}>
        <Box>
          <Button
            variant="text"
            startIcon={
              <ArrowBack />
            }
            onClick={
              handleCancel
            }
            disabled={
              saving
            }
            sx={{
              mb: 1,
            }}
          >
            Voltar para inventário
          </Button>

          <Typography
            variant="h4"
            component="h1"
            fontWeight={700}
          >
            Cadastrar equipamento
          </Typography>

          <Typography
            color="text.secondary"
            sx={{
              mt: 1,
            }}
          >
            Informe os dados do ativo de TI e escolha se a
            etiqueta será gerada automaticamente ou cadastrada
            manualmente.
          </Typography>
        </Box>

        <InventoryForm
          data={
            formData
          }
          stores={
            stores
          }
          users={
            users
          }
          automaticTagPreview={
            automaticTagPreview
          }
          errorMessage={
            errorMessage
          }
          saving={
            saving
          }
          submitLabel="Salvar equipamento"
          onChange={
            handleChange
          }
          onSubmit={
            handleSubmit
          }
          onCancel={
            handleCancel
          }
        />
      </Stack>
    </MainLayout>
  );
}

export default CreateInventoryPage;