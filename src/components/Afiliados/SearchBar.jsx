import {
  Box,
  TextField,
  InputAdornment,
  Chip,
  Typography,
  Button,
} from "@mui/material";
import { Search as SearchIcon, Clear as ClearIcon } from "@mui/icons-material";

export default function SearchBar({
  searchTerm,
  activeFilters,
  onSearchChange,
  onKeyPress,
  onRemoveFilter,
  onClearAll,
}) {
  return (
    <Box sx={{ mb: 3 }}>
      <TextField
        fullWidth
        placeholder="Buscar por apellido, nombre, DNI, credencial, parentesco o plan..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        onKeyPress={onKeyPress}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
        sx={{ maxWidth: 600 }}
      />

      {activeFilters.length > 0 && (
        <Box
          sx={{
            mt: 2,
            display: "flex",
            gap: 1,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <Typography variant="body2" sx={{ color: "#666", mr: 1 }}>
            Filtros activos:
          </Typography>
          {activeFilters.map((filter, index) => (
            <Chip
              key={index}
              label={filter}
              onDelete={() => onRemoveFilter(filter)}
              variant="outlined"
              size="small"
            />
          ))}
          <Button
            size="small"
            startIcon={<ClearIcon />}
            onClick={onClearAll}
            sx={{ ml: 1 }}
            variant="outlined"
          >
            Limpiar todo
          </Button>
        </Box>
      )}
    </Box>
  );
}
