import {
  useState,
} from "react";

import type {
  FormEvent,
} from "react";

import {
  Alert,
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
  useParams,
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
  getInventoryItemById,
  previewNextAutomaticTag,
  updateInventoryItem,
} from "../../services/inventoryService";

import {
  getStoreById,
  getStores,
} from "../../services/storeService";

import {
  getUserById,
  getUsers,
} from "../../services/userService";

function formatCurrency(
  value: number
): string {
  return value.toLocaleString(
    "pt-BR",
    {
      style: "currency",
      currency: "BRL",
    }
  );
}

function formatOptionalValue(
  value: string
): string {
  return value.trim() ||
    "Não informado";
}

function EditInventoryPage() {
  const navigate =
    useNavigate();

  const {
    id,
  } = useParams();

  const {
    user,
  } = useAuth();

  const {
    showSnackbar,
  } = useSnackbar();

  const itemId =
    Number(id);

  const equipment =
    getInventoryItemById(
      itemId
    );

  const [
    formData,
    setFormData,
  ] = useState<InventoryFormData>(
    {
      tagMode:
        equipment?.tagMode ??
        "Automática",

      tag:
        equipment?.tag ?? "",

      assetNumber:
        equipment?.assetNumber ??
        "",

      storeId:
        equipment
          ? String(
              equipment.storeId
            )
          : "",

      category:
        equipment?.category ??
        "",

      description:
        equipment?.description ??
        "",

      manufacturer:
        equipment?.manufacturer ??
        "",

      model:
        equipment?.model ??
        "",

      serialNumber:
        equipment?.serialNumber ??
        "",

      location:
        equipment?.location ??
        "",

      value:
        equipment
          ? String(
              equipment.value
            )
          : "",

      acquisitionDate:
        equipment?.acquisitionDate ??
        "",

      warrantyUntil:
        equipment?.warrantyUntil ??
        "",

      responsibleUserId:
        equipment
          ?.responsibleUserId ===
        null
          ? NO_RESPONSIBLE_VALUE
          : equipment
                ?.responsibleUserId ===
              undefined
            ? NO_RESPONSIBLE_VALUE
            : String(
                equipment.responsibleUserId
              ),

      status:
        equipment?.status ??
        "Em uso",

      condition:
        equipment?.condition ??
        "Bom",

      notes:
        equipment?.notes ?? "",
    }
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
    equipment &&
    equipment.tagMode ===
      "Automática" &&
    formData.tagMode ===
      "Automática"
      ? equipment.tag
      : previewNextAutomaticTag();

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

    if (equipment) {
      navigate(
        `/inventory/${equipment.id}`
      );

      return;
    }

    navigate(
      "/inventory"
    );
  }

  function registerHistoryEvents(
    updatedEquipment:
      NonNullable<
        ReturnType<
          typeof updateInventoryItem
        >
      >
  ): void {
    if (!equipment) {
      return;
    }

    const performedByUserId =
      user?.id ?? null;

    const oldStore =
      getStoreById(
        equipment.storeId
      );

    const newStore =
      getStoreById(
        updatedEquipment.storeId
      );

    const oldResponsible =
      equipment.responsibleUserId ===
      null
        ? null
        : getUserById(
            equipment.responsibleUserId
          );

    const newResponsible =
      updatedEquipment.responsibleUserId ===
      null
        ? null
        : getUserById(
            updatedEquipment.responsibleUserId
          );

    const specificChanges:
      string[] = [];

    if (
      equipment.status !==
      updatedEquipment.status
    ) {
      addInventoryHistoryEvent({
        inventoryItemId:
          updatedEquipment.id,

        type:
          "Mudança de situação",

        title:
          "Situação alterada",

        description:
          `A situação foi alterada de "${equipment.status}" para "${updatedEquipment.status}".`,

        performedByUserId,
      });

      specificChanges.push(
        "situação"
      );
    }

    if (
      equipment.condition !==
      updatedEquipment.condition
    ) {
      addInventoryHistoryEvent({
        inventoryItemId:
          updatedEquipment.id,

        type:
          "Mudança de estado físico",

        title:
          "Estado físico alterado",

        description:
          `O estado físico foi alterado de "${equipment.condition}" para "${updatedEquipment.condition}".`,

        performedByUserId,
      });

      specificChanges.push(
        "estado físico"
      );
    }

    if (
      equipment.storeId !==
      updatedEquipment.storeId
    ) {
      addInventoryHistoryEvent({
        inventoryItemId:
          updatedEquipment.id,

        type:
          "Mudança de loja",

        title:
          "Loja alterada",

        description:
          `A loja foi alterada de "${oldStore?.name ?? "Loja não encontrada"}" para "${newStore?.name ?? "Loja não encontrada"}".`,

        performedByUserId,
      });

      specificChanges.push(
        "loja"
      );
    }

    if (
      equipment.responsibleUserId !==
      updatedEquipment.responsibleUserId
    ) {
      addInventoryHistoryEvent({
        inventoryItemId:
          updatedEquipment.id,

        type:
          "Mudança de responsável",

        title:
          "Responsável alterado",

        description:
          `O responsável foi alterado de "${oldResponsible?.name ?? "Sem responsável"}" para "${newResponsible?.name ?? "Sem responsável"}".`,

        performedByUserId,
      });

      specificChanges.push(
        "responsável"
      );
    }

    const generalChanges:
      string[] = [];

    if (
      equipment.tag !==
      updatedEquipment.tag
    ) {
      generalChanges.push(
        `Etiqueta: "${equipment.tag}" → "${updatedEquipment.tag}"`
      );
    }

    if (
      equipment.tagMode !==
      updatedEquipment.tagMode
    ) {
      generalChanges.push(
        `Origem da etiqueta: "${equipment.tagMode}" → "${updatedEquipment.tagMode}"`
      );
    }

    if (
      equipment.assetNumber !==
      updatedEquipment.assetNumber
    ) {
      generalChanges.push(
        `Patrimônio: "${formatOptionalValue(
          equipment.assetNumber
        )}" → "${formatOptionalValue(
          updatedEquipment.assetNumber
        )}"`
      );
    }

    if (
      equipment.category !==
      updatedEquipment.category
    ) {
      generalChanges.push(
        `Categoria: "${equipment.category}" → "${updatedEquipment.category}"`
      );
    }

    if (
      equipment.description !==
      updatedEquipment.description
    ) {
      generalChanges.push(
        `Descrição: "${equipment.description}" → "${updatedEquipment.description}"`
      );
    }

    if (
      equipment.manufacturer !==
      updatedEquipment.manufacturer
    ) {
      generalChanges.push(
        `Fabricante: "${formatOptionalValue(
          equipment.manufacturer
        )}" → "${formatOptionalValue(
          updatedEquipment.manufacturer
        )}"`
      );
    }

    if (
      equipment.model !==
      updatedEquipment.model
    ) {
      generalChanges.push(
        `Modelo: "${formatOptionalValue(
          equipment.model
        )}" → "${formatOptionalValue(
          updatedEquipment.model
        )}"`
      );
    }

    if (
      equipment.serialNumber !==
      updatedEquipment.serialNumber
    ) {
      generalChanges.push(
        `Número de série: "${formatOptionalValue(
          equipment.serialNumber
        )}" → "${formatOptionalValue(
          updatedEquipment.serialNumber
        )}"`
      );
    }

    if (
      equipment.location !==
      updatedEquipment.location
    ) {
      generalChanges.push(
        `Localização: "${equipment.location}" → "${updatedEquipment.location}"`
      );
    }

    if (
      equipment.value !==
      updatedEquipment.value
    ) {
      generalChanges.push(
        `Valor: "${formatCurrency(
          equipment.value
        )}" → "${formatCurrency(
          updatedEquipment.value
        )}"`
      );
    }

    if (
      equipment.acquisitionDate !==
      updatedEquipment.acquisitionDate
    ) {
      generalChanges.push(
        `Data de aquisição: "${formatOptionalValue(
          equipment.acquisitionDate
        )}" → "${formatOptionalValue(
          updatedEquipment.acquisitionDate
        )}"`
      );
    }

    if (
      equipment.warrantyUntil !==
      updatedEquipment.warrantyUntil
    ) {
      generalChanges.push(
        `Garantia: "${formatOptionalValue(
          equipment.warrantyUntil
        )}" → "${formatOptionalValue(
          updatedEquipment.warrantyUntil
        )}"`
      );
    }

    if (
      equipment.notes !==
      updatedEquipment.notes
    ) {
      generalChanges.push(
        "Observações atualizadas"
      );
    }

    if (
      generalChanges.length >
      0
    ) {
      addInventoryHistoryEvent({
        inventoryItemId:
          updatedEquipment.id,

        type:
          "Edição",

        title:
          "Dados do equipamento atualizados",

        description:
          generalChanges.join(
            "\n"
          ),

        performedByUserId,
      });
    }

    const hasAnyChange =
      specificChanges.length >
        0 ||
      generalChanges.length >
        0;

    if (!hasAnyChange) {
      addInventoryHistoryEvent({
        inventoryItemId:
          updatedEquipment.id,

        type:
          "Edição",

        title:
          "Edição salva sem alterações",

        description:
          "O formulário foi salvo, mas nenhum dado do equipamento foi alterado.",

        performedByUserId,
      });
    }
  }

  function handleSubmit(
    event:
      FormEvent<HTMLFormElement>
  ): void {
    event.preventDefault();

    if (!equipment) {
      return;
    }

    setErrorMessage("");

    try {
      setSaving(true);

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

      const updatedEquipment =
        updateInventoryItem(
          equipment.id,
          {
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
              Number(
                formData.storeId
              ),

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
          }
        );

      if (!updatedEquipment) {
        throw new Error(
          "O equipamento não foi encontrado."
        );
      }

      try {
        registerHistoryEvents(
          updatedEquipment
        );
      } catch (historyError) {
        console.error(
          "O equipamento foi atualizado, mas não foi possível registrar todo o histórico.",
          historyError
        );
      }

      showSnackbar(
        `Equipamento ${updatedEquipment.tag} atualizado com sucesso.`,
        {
          severity:
            "success",
        }
      );

      navigate(
        `/inventory/${updatedEquipment.id}`
      );
    } catch (error) {
      console.error(
        "Não foi possível atualizar o equipamento.",
        error
      );

      const message =
        error instanceof Error
          ? error.message
          : "Não foi possível atualizar o equipamento.";

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
      setSaving(false);
    }
  }

  if (!equipment) {
    return (
      <MainLayout title="Editar Equipamento">
        <Stack spacing={2}>
          <Alert severity="error">
            Equipamento não encontrado.
          </Alert>

          <Box>
            <Button
              variant="outlined"
              startIcon={
                <ArrowBack />
              }
              onClick={() =>
                navigate(
                  "/inventory"
                )
              }
            >
              Voltar para inventário
            </Button>
          </Box>
        </Stack>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Editar Equipamento">
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
            disabled={saving}
            sx={{
              mb: 1,
            }}
          >
            Voltar aos detalhes
          </Button>

          <Typography
            variant="h4"
            component="h1"
            fontWeight={700}
          >
            Editar equipamento
          </Typography>

          <Typography
            color="text.secondary"
            sx={{
              mt: 1,
            }}
          >
            Atualize os dados do equipamento{" "}
            <strong>
              {equipment.tag}
            </strong>
            .
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
          submitLabel="Salvar alterações"
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

export default EditInventoryPage;