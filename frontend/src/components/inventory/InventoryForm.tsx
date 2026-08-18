import {
  Alert,
  Button,
  FormControl,
  FormControlLabel,
  FormLabel,
  MenuItem,
  Paper,
  Radio,
  RadioGroup,
  Stack,
  TextField,
} from "@mui/material";

import {
  ArrowBack,
  Save,
} from "@mui/icons-material";

import type {
  FormEvent,
} from "react";

import type {
  InventoryCondition,
  InventoryStatus,
  InventoryTagMode,
} from "../../types/InventoryItem";

import type {
  Store,
} from "../../types/Store";

import type {
  User,
} from "../../types/User";

export interface InventoryFormData {
  tagMode: InventoryTagMode;

  tag: string;

  assetNumber: string;

  storeId: string;

  category: string;

  description: string;

  manufacturer: string;

  model: string;

  serialNumber: string;

  location: string;

  value: string;

  acquisitionDate: string;

  warrantyUntil: string;

  responsibleUserId: string;

  status: InventoryStatus;

  condition: InventoryCondition;

  notes: string;
}

interface InventoryFormProps {
  data: InventoryFormData;

  stores: Store[];

  users: User[];

  automaticTagPreview: string;

  errorMessage?: string;

  saving?: boolean;

  submitLabel?: string;

  onChange: (
    field: keyof InventoryFormData,
    value: string
  ) => void;

  onSubmit: (
    event: FormEvent<HTMLFormElement>
  ) => void;

  onCancel: () => void;
}

const NO_RESPONSIBLE_VALUE =
  "unassigned";

const MAXIMUM_TAG_LENGTH =
  50;

const MAXIMUM_ASSET_NUMBER_LENGTH =
  50;

const MAXIMUM_LOCATION_LENGTH =
  120;

const MAXIMUM_CATEGORY_LENGTH =
  80;

const MINIMUM_DESCRIPTION_LENGTH =
  3;

const MAXIMUM_DESCRIPTION_LENGTH =
  200;

const MAXIMUM_MANUFACTURER_LENGTH =
  100;

const MAXIMUM_MODEL_LENGTH =
  100;

const MAXIMUM_SERIAL_NUMBER_LENGTH =
  100;

const MAXIMUM_NOTES_LENGTH =
  2000;

function InventoryForm({
  data,
  stores,
  users,
  automaticTagPreview,
  errorMessage = "",
  saving = false,
  submitLabel = "Salvar equipamento",
  onChange,
  onSubmit,
  onCancel,
}: InventoryFormProps) {
  const activeStores =
    stores.filter(
      (store) =>
        store.status ===
        "Ativa"
    );

  const activeUsers =
    users.filter(
      (user) =>
        user.status ===
        "Ativo"
    );

  const normalizedDescription =
    data.description.trim();

  const descriptionTooShort =
    normalizedDescription.length >
      0 &&
    normalizedDescription.length <
      MINIMUM_DESCRIPTION_LENGTH;

  const numericValue =
    data.value.trim()
      ? Number(
          data.value
        )
      : null;

  const invalidValue =
    numericValue !==
      null &&
    (
      !Number.isFinite(
        numericValue
      ) ||
      numericValue < 0
    );

  const invalidWarrantyDate =
    Boolean(
      data.acquisitionDate &&
      data.warrantyUntil &&
      data.warrantyUntil <
        data.acquisitionDate
    );

  const formHasValidationError =
    descriptionTooShort ||
    invalidValue ||
    invalidWarrantyDate;

  return (
    <Paper
      sx={{
        p: {
          xs: 2.5,
          md: 4,
        },
      }}
    >
      <Stack
        component="form"
        spacing={3}
        onSubmit={
          onSubmit
        }
      >
        {errorMessage && (
          <Alert severity="error">
            {errorMessage}
          </Alert>
        )}

        <FormControl>
          <FormLabel>
            Modo da etiqueta
          </FormLabel>

          <RadioGroup
            row
            value={
              data.tagMode
            }
            onChange={(event) =>
              onChange(
                "tagMode",
                event.target.value
              )
            }
          >
            <FormControlLabel
              value="Automática"
              control={
                <Radio />
              }
              label="Gerar automaticamente"
              disabled={
                saving
              }
            />

            <FormControlLabel
              value="Manual"
              control={
                <Radio />
              }
              label="Informar manualmente"
              disabled={
                saving
              }
            />
          </RadioGroup>
        </FormControl>

        {data.tagMode ===
        "Automática" ? (
          <TextField
            label="Próxima etiqueta automática"
            value={
              automaticTagPreview
            }
            helperText="A etiqueta definitiva será confirmada ao salvar."
            fullWidth
            disabled
          />
        ) : (
          <TextField
            label="Etiqueta física"
            value={
              data.tag
            }
            onChange={(event) =>
              onChange(
                "tag",
                event.target.value
              )
            }
            placeholder="Exemplo: TI-00452"
            helperText={`${data.tag.length}/${MAXIMUM_TAG_LENGTH} caracteres. O código precisa ser único.`}
            required
            fullWidth
            disabled={
              saving
            }
            slotProps={{
              htmlInput: {
                maxLength:
                  MAXIMUM_TAG_LENGTH,
              },
            }}
          />
        )}

        <TextField
          label="Número do patrimônio"
          value={
            data.assetNumber
          }
          onChange={(event) =>
            onChange(
              "assetNumber",
              event.target.value
            )
          }
          placeholder="Exemplo: PAT-000145"
          helperText={`${data.assetNumber.length}/${MAXIMUM_ASSET_NUMBER_LENGTH} caracteres. Campo opcional e, quando informado, precisa ser único.`}
          fullWidth
          disabled={
            saving
          }
          slotProps={{
            htmlInput: {
              maxLength:
                MAXIMUM_ASSET_NUMBER_LENGTH,
            },
          }}
        />

        <Stack
          direction={{
            xs:
              "column",
            md:
              "row",
          }}
          spacing={2}
        >
          <TextField
            select
            label="Loja"
            value={
              data.storeId
            }
            onChange={(event) =>
              onChange(
                "storeId",
                event.target.value
              )
            }
            required
            fullWidth
            disabled={
              saving
            }
          >
            {activeStores.map(
              (store) => (
                <MenuItem
                  key={
                    store.id
                  }
                  value={String(
                    store.id
                  )}
                >
                  {store.code} —{" "}
                  {store.name}
                </MenuItem>
              )
            )}
          </TextField>

          <TextField
            label="Localização"
            value={
              data.location
            }
            onChange={(event) =>
              onChange(
                "location",
                event.target.value
              )
            }
            placeholder="Exemplo: Financeiro, Caixa 03"
            helperText={`${data.location.length}/${MAXIMUM_LOCATION_LENGTH} caracteres`}
            required
            fullWidth
            disabled={
              saving
            }
            slotProps={{
              htmlInput: {
                maxLength:
                  MAXIMUM_LOCATION_LENGTH,
              },
            }}
          />
        </Stack>

        <Stack
          direction={{
            xs:
              "column",
            md:
              "row",
          }}
          spacing={2}
        >
          <TextField
            label="Categoria"
            value={
              data.category
            }
            onChange={(event) =>
              onChange(
                "category",
                event.target.value
              )
            }
            placeholder="Exemplo: Notebook"
            helperText={`${data.category.length}/${MAXIMUM_CATEGORY_LENGTH} caracteres`}
            required
            fullWidth
            disabled={
              saving
            }
            slotProps={{
              htmlInput: {
                maxLength:
                  MAXIMUM_CATEGORY_LENGTH,
              },
            }}
          />

          <TextField
            select
            label="Situação"
            value={
              data.status
            }
            onChange={(event) =>
              onChange(
                "status",
                event.target.value
              )
            }
            required
            fullWidth
            disabled={
              saving
            }
          >
            <MenuItem value="Em uso">
              Em uso
            </MenuItem>

            <MenuItem value="Em estoque">
              Em estoque
            </MenuItem>

            <MenuItem value="Em manutenção">
              Em manutenção
            </MenuItem>

            <MenuItem value="Emprestado">
              Emprestado
            </MenuItem>

            <MenuItem value="Reserva">
              Reserva
            </MenuItem>

            <MenuItem value="Descartado">
              Descartado
            </MenuItem>

            <MenuItem value="Baixado">
              Baixado
            </MenuItem>
          </TextField>

          <TextField
            select
            label="Estado físico"
            value={
              data.condition
            }
            onChange={(event) =>
              onChange(
                "condition",
                event.target.value
              )
            }
            required
            fullWidth
            disabled={
              saving
            }
          >
            <MenuItem value="Novo">
              Novo
            </MenuItem>

            <MenuItem value="Excelente">
              Excelente
            </MenuItem>

            <MenuItem value="Bom">
              Bom
            </MenuItem>

            <MenuItem value="Regular">
              Regular
            </MenuItem>

            <MenuItem value="Ruim">
              Ruim
            </MenuItem>

            <MenuItem value="Sucata">
              Sucata
            </MenuItem>
          </TextField>
        </Stack>

        <TextField
          label="Descrição"
          value={
            data.description
          }
          onChange={(event) =>
            onChange(
              "description",
              event.target.value
            )
          }
          placeholder="Exemplo: Notebook Dell Latitude 5420"
          required
          fullWidth
          disabled={
            saving
          }
          error={
            descriptionTooShort
          }
          helperText={
            descriptionTooShort
              ? `Digite pelo menos ${MINIMUM_DESCRIPTION_LENGTH} caracteres.`
              : `${data.description.length}/${MAXIMUM_DESCRIPTION_LENGTH} caracteres`
          }
          slotProps={{
            htmlInput: {
              maxLength:
                MAXIMUM_DESCRIPTION_LENGTH,
            },
          }}
        />

        <Stack
          direction={{
            xs:
              "column",
            md:
              "row",
          }}
          spacing={2}
        >
          <TextField
            label="Fabricante"
            value={
              data.manufacturer
            }
            onChange={(event) =>
              onChange(
                "manufacturer",
                event.target.value
              )
            }
            helperText={`${data.manufacturer.length}/${MAXIMUM_MANUFACTURER_LENGTH} caracteres`}
            fullWidth
            disabled={
              saving
            }
            slotProps={{
              htmlInput: {
                maxLength:
                  MAXIMUM_MANUFACTURER_LENGTH,
              },
            }}
          />

          <TextField
            label="Modelo"
            value={
              data.model
            }
            onChange={(event) =>
              onChange(
                "model",
                event.target.value
              )
            }
            helperText={`${data.model.length}/${MAXIMUM_MODEL_LENGTH} caracteres`}
            fullWidth
            disabled={
              saving
            }
            slotProps={{
              htmlInput: {
                maxLength:
                  MAXIMUM_MODEL_LENGTH,
              },
            }}
          />

          <TextField
            label="Número de série"
            value={
              data.serialNumber
            }
            onChange={(event) =>
              onChange(
                "serialNumber",
                event.target.value
              )
            }
            helperText={`${data.serialNumber.length}/${MAXIMUM_SERIAL_NUMBER_LENGTH} caracteres`}
            fullWidth
            disabled={
              saving
            }
            slotProps={{
              htmlInput: {
                maxLength:
                  MAXIMUM_SERIAL_NUMBER_LENGTH,
              },
            }}
          />
        </Stack>

        <Stack
          direction={{
            xs:
              "column",
            md:
              "row",
          }}
          spacing={2}
        >
          <TextField
            label="Valor do equipamento"
            type="number"
            value={
              data.value
            }
            onChange={(event) =>
              onChange(
                "value",
                event.target.value
              )
            }
            error={
              invalidValue
            }
            helperText={
              invalidValue
                ? "O valor do equipamento não pode ser negativo."
                : "Campo opcional. Informe um valor igual ou superior a zero."
            }
            fullWidth
            disabled={
              saving
            }
            slotProps={{
              htmlInput: {
                min:
                  0,
                step:
                  "0.01",
              },
            }}
          />

          <TextField
            select
            label="Responsável"
            value={
              data.responsibleUserId
            }
            onChange={(event) =>
              onChange(
                "responsibleUserId",
                event.target.value
              )
            }
            fullWidth
            disabled={
              saving
            }
          >
            <MenuItem
              value={
                NO_RESPONSIBLE_VALUE
              }
            >
              Sem responsável
            </MenuItem>

            {activeUsers.map(
              (user) => (
                <MenuItem
                  key={
                    user.id
                  }
                  value={String(
                    user.id
                  )}
                >
                  {user.name} —{" "}
                  {user.role}
                </MenuItem>
              )
            )}
          </TextField>
        </Stack>

        <Stack
          direction={{
            xs:
              "column",
            md:
              "row",
          }}
          spacing={2}
        >
          <TextField
            label="Data de aquisição"
            type="date"
            value={
              data.acquisitionDate
            }
            onChange={(event) =>
              onChange(
                "acquisitionDate",
                event.target.value
              )
            }
            fullWidth
            disabled={
              saving
            }
            slotProps={{
              inputLabel: {
                shrink:
                  true,
              },
            }}
          />

          <TextField
            label="Garantia até"
            type="date"
            value={
              data.warrantyUntil
            }
            onChange={(event) =>
              onChange(
                "warrantyUntil",
                event.target.value
              )
            }
            error={
              invalidWarrantyDate
            }
            helperText={
              invalidWarrantyDate
                ? "A garantia não pode terminar antes da data de aquisição."
                : "Campo opcional."
            }
            fullWidth
            disabled={
              saving
            }
            slotProps={{
              inputLabel: {
                shrink:
                  true,
              },

              htmlInput: {
                min:
                  data.acquisitionDate ||
                  undefined,
              },
            }}
          />
        </Stack>

        <TextField
          label="Observações"
          value={
            data.notes
          }
          onChange={(event) =>
            onChange(
              "notes",
              event.target.value
            )
          }
          multiline
          rows={5}
          helperText={`${data.notes.length}/${MAXIMUM_NOTES_LENGTH.toLocaleString(
            "pt-BR"
          )} caracteres`}
          fullWidth
          disabled={
            saving
          }
          slotProps={{
            htmlInput: {
              maxLength:
                MAXIMUM_NOTES_LENGTH,
            },
          }}
        />

        <Stack
          direction={{
            xs:
              "column",
            sm:
              "row",
          }}
          spacing={2}
          justifyContent="flex-end"
        >
          <Button
            type="button"
            variant="outlined"
            startIcon={
              <ArrowBack />
            }
            onClick={
              onCancel
            }
            disabled={
              saving
            }
          >
            Cancelar
          </Button>

          <Button
            type="submit"
            variant="contained"
            startIcon={
              <Save />
            }
            loading={
              saving
            }
            disabled={
              saving ||
              !data.storeId ||
              !data.category.trim() ||
              !normalizedDescription ||
              !data.location.trim() ||
              (
                data.tagMode ===
                  "Manual" &&
                !data.tag.trim()
              ) ||
              formHasValidationError
            }
          >
            {saving
              ? "Salvando..."
              : submitLabel}
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
}

export {
  NO_RESPONSIBLE_VALUE,
};

export default InventoryForm;