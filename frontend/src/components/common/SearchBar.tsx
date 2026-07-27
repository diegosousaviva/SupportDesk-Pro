import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";

import {
  IconButton,
  InputAdornment,
  TextField,
} from "@mui/material";

export interface SearchBarProps {
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
  fullWidth?: boolean;
}

function SearchBar({
  value,
  placeholder = "Pesquisar...",
  onChange,
  fullWidth = true,
}: SearchBarProps) {
  function handleClear() {
    onChange("");
  }

  return (
    <TextField
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      fullWidth={fullWidth}
      size="small"
      variant="outlined"
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon color="action" />
          </InputAdornment>
        ),
        endAdornment: value ? (
          <InputAdornment position="end">
            <IconButton
              size="small"
              onClick={handleClear}
            >
              <ClearIcon fontSize="small" />
            </IconButton>
          </InputAdornment>
        ) : undefined,
      }}
    />
  );
}

export default SearchBar;