import {
  Button,
  Paper,
  Stack,
} from "@mui/material";

import PictureAsPdfOutlinedIcon from "@mui/icons-material/PictureAsPdfOutlined";
import TableChartOutlinedIcon from "@mui/icons-material/TableChartOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import PrintOutlinedIcon from "@mui/icons-material/PrintOutlined";

interface ReportActionsProps {
  onExportPdf: () => void;
  onExportExcel: () => void;
  onExportCsv: () => void;
  onPrint: () => void;
}

function ReportActions({
  onExportPdf,
  onExportExcel,
  onExportCsv,
  onPrint,
}: ReportActionsProps) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
      }}
    >
      <Stack
        direction={{
          xs: "column",
          md: "row",
        }}
        spacing={2}
        justifyContent="flex-end"
      >
        <Button
          variant="contained"
          color="error"
          startIcon={
            <PictureAsPdfOutlinedIcon />
          }
          onClick={onExportPdf}
        >
          Exportar PDF
        </Button>

        <Button
          variant="contained"
          color="success"
          startIcon={
            <TableChartOutlinedIcon />
          }
          onClick={onExportExcel}
        >
          Exportar Excel
        </Button>

        <Button
          variant="contained"
          color="primary"
          startIcon={
            <DescriptionOutlinedIcon />
          }
          onClick={onExportCsv}
        >
          Exportar CSV
        </Button>

        <Button
          variant="outlined"
          startIcon={
            <PrintOutlinedIcon />
          }
          onClick={onPrint}
        >
          Imprimir
        </Button>
      </Stack>
    </Paper>
  );
}

export default ReportActions;