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
        onSubmit={onSubmit}
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
            value={data.tagMode}
            onChange={(event) =>
              onChange(
                "tagMode",
                event.target.value
              )
            }
          >
            <FormControlLabel
              value="Automática"
              control={<Radio />}
              label="Gerar automaticamente"
              disabled={saving}
            />

            <FormControlLabel
              value="Manual"
              control={<Radio />}
              label="Informar manualmente"
              disabled={saving}
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
            value={data.tag}
            onChange={(event) =>
              onChange(
                "tag",
                event.target.value
              )
            }
            placeholder="Exemplo: TI-00452"
            helperText="O código precisa ser único."
            required
            fullWidth
            disabled={saving}
            slotProps={{
              htmlInput: {
                maxLength: 50,
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
          helperText="Campo opcional. Quando informado, o número precisa ser único."
          fullWidth
          disabled={saving}
          slotProps={{
            htmlInput: {
              maxLength: 50,
            },
          }}
        />

        <Stack
          direction={{
            xs: "column",
            md: "row",
          }}
          spacing={2}
        >
          <TextField
            select
            label="Loja"
            value={data.storeId}
            onChange={(event) =>
              onChange(
                "storeId",
                event.target.value
              )
            }
            required
            fullWidth
            disabled={saving}
          >
            {activeStores.map(
              (store) => (
                <MenuItem
                  key={store.id}
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
            value={data.location}
            onChange={(event) =>
              onChange(
                "location",
                event.target.value
              )
            }
            placeholder="Exemplo: Financeiro, Caixa 03"
            required
            fullWidth
            disabled={saving}
          />
        </Stack>

        <Stack
          direction={{
            xs: "column",
            md: "row",
          }}
          spacing={2}
        >
          <TextField
            label="Categoria"
            value={data.category}
            onChange={(event) =>
              onChange(
                "category",
                event.target.value
              )
            }
            placeholder="Exemplo: Notebook"
            required
            fullWidth
            disabled={saving}
          />

          <TextField
            select
            label="Situação"
            value={data.status}
            onChange={(event) =>
              onChange(
                "status",
                event.target.value
              )
            }
            required
            fullWidth
            disabled={saving}
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
            value={data.condition}
            onChange={(event) =>
              onChange(
                "condition",
                event.target.value
              )
            }
            required
            fullWidth
            disabled={saving}
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
          disabled={saving}
        />

        <Stack
          direction={{
            xs: "column",
            md: "row",
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
            fullWidth
            disabled={saving}
          />

          <TextField
            label="Modelo"
            value={data.model}
            onChange={(event) =>
              onChange(
                "model",
                event.target.value
              )
            }
            fullWidth
            disabled={saving}
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
            fullWidth
            disabled={saving}
          />
        </Stack>

        <Stack
          direction={{
            xs: "column",
            md: "row",
          }}
          spacing={2}
        >
          <TextField
            label="Valor do equipamento"
            type="number"
            value={data.value}
            onChange={(event) =>
              onChange(
                "value",
                event.target.value
              )
            }
            fullWidth
            disabled={saving}
            slotProps={{
              htmlInput: {
                min: 0,
                step: "0.01",
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
            disabled={saving}
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
                  key={user.id}
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
            xs: "column",
            md: "row",
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
            disabled={saving}
            slotProps={{
              inputLabel: {
                shrink: true,
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
            fullWidth
            disabled={saving}
            slotProps={{
              inputLabel: {
                shrink: true,
              },
            }}
          />
        </Stack>

        <TextField
          label="Observações"
          value={data.notes}
          onChange={(event) =>
            onChange(
              "notes",
              event.target.value
            )
          }
          multiline
          rows={5}
          fullWidth
          disabled={saving}
        />

        <Stack
          direction={{
            xs: "column",
            sm: "row",
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
            disabled={saving}
          >
            Cancelar
          </Button>

          <Button
            type="submit"
            variant="contained"
            startIcon={
              <Save />
            }
            loading={saving}
            disabled={
              saving ||
              !data.storeId ||
              !data.category.trim() ||
              !data.description.trim() ||
              !data.location.trim() ||
              (
                data.tagMode ===
                  "Manual" &&
                !data.tag.trim()
              )
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