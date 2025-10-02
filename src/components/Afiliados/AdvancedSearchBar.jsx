import { useState, useMemo, useEffect } from "react";
import {
  Box,
  TextField,
  InputAdornment,
  Chip,
  Typography,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  ExpandMore as ExpandMoreIcon,
  FilterList as FilterListIcon,
} from "@mui/icons-material";

export default function AdvancedSearchBar({
  afiliados,
  onFilteredAfiliadosChange,
}) {
  const [expanded, setExpanded] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilters, setActiveFilters] = useState([]);
  const [filterState, setFilterState] = useState({
    estado: "todos",
    dni: "",
    credencial: "",
    direccion: "",
    fechaNacimientoDesde: "",
    fechaNacimientoHasta: "",
    orden: "",
  });

  // Función para aplicar todos los filtros
  const filteredAfiliados = useMemo(() => {
    if (!afiliados) return [];

    return afiliados
      .filter((afiliado) => {
        // Filtro por búsqueda rápida
        const searchFields = [
          afiliado.apellido.toLowerCase(),
          afiliado.nombre.toLowerCase(),
          afiliado.numeroDocumento,
          `${afiliado.numeroAfiliado}-${afiliado.numeroIntegrante}`,
          afiliado.parentesco.toLowerCase(),
          afiliado.planMedico.toLowerCase(),
        ].join(" ");

        const matchesCurrentSearch =
          searchTerm === "" || searchFields.includes(searchTerm.toLowerCase());
        const matchesActiveFilters =
          activeFilters.length === 0 ||
          activeFilters.every((filter) =>
            searchFields.includes(filter.toLowerCase())
          );

        // Filtro por estado
        const matchesEstado =
          filterState.estado === "todos" ||
          (filterState.estado === "activo" && afiliado.activo) ||
          (filterState.estado === "inactivo" && !afiliado.activo);

        // Filtro por DNI
        const matchesDni =
          !filterState.dni ||
          afiliado.numeroDocumento.includes(filterState.dni);

        // Filtro por credencial
        const matchesCredencial =
          !filterState.credencial ||
          `${afiliado.numeroAfiliado}-${afiliado.numeroIntegrante}`.includes(
            filterState.credencial
          );

        // Filtro por dirección
        const matchesDireccion =
          !filterState.direccion ||
          afiliado.direcciones.some((direccion) =>
            direccion
              .toLowerCase()
              .includes(filterState.direccion.toLowerCase())
          );

        // Filtro por fecha de nacimiento
        const fechaNacimiento = new Date(afiliado.fechaNacimiento);
        const matchesFechaNacimientoDesde =
          !filterState.fechaNacimientoDesde ||
          fechaNacimiento >= new Date(filterState.fechaNacimientoDesde);

        const matchesFechaNacimientoHasta =
          !filterState.fechaNacimientoHasta ||
          fechaNacimiento <= new Date(filterState.fechaNacimientoHasta);

        return (
          matchesCurrentSearch &&
          matchesActiveFilters &&
          matchesEstado &&
          matchesDni &&
          matchesCredencial &&
          matchesDireccion &&
          matchesFechaNacimientoDesde &&
          matchesFechaNacimientoHasta
        );
      })
      .sort((a, b) => {
        // Ordenamiento
        if (!filterState.orden) return 0;

        switch (filterState.orden) {
          case "fechaAlta-asc":
            return new Date(a.fechaAlta) - new Date(b.fechaAlta);
          case "fechaAlta-desc":
            return new Date(b.fechaAlta) - new Date(a.fechaAlta);
          case "apellido-asc":
            return a.apellido.localeCompare(b.apellido);
          case "apellido-desc":
            return b.apellido.localeCompare(a.apellido);
          default:
            return 0;
        }
      });
  }, [afiliados, searchTerm, activeFilters, filterState]);

  // Notificar al componente padre cuando cambien los afiliados filtrados
  useEffect(() => {
    onFilteredAfiliadosChange(filteredAfiliados);
  }, [filteredAfiliados, onFilteredAfiliadosChange]);

  // Handlers
  const handleKeyPress = (e) => {
    if (
      e.key === "Enter" &&
      searchTerm.trim() &&
      !activeFilters.includes(searchTerm.trim())
    ) {
      setActiveFilters([...activeFilters, searchTerm.trim()]);
      setSearchTerm("");
    }
  };

  const handleRemoveFilter = (filterToRemove) => {
    setActiveFilters(
      activeFilters.filter((filter) => filter !== filterToRemove)
    );
  };

  const handleClearAll = () => {
    setActiveFilters([]);
    setSearchTerm("");
    setFilterState({
      estado: "todos",
      dni: "",
      credencial: "",
      direccion: "",
      fechaNacimientoDesde: "",
      fechaNacimientoHasta: "",
      orden: "",
    });
  };

  const handleFilterChange = (filterType, value) => {
    setFilterState((prev) => ({
      ...prev,
      [filterType]: value,
    }));
  };

  const getFilterDisplayText = (filterType, value) => {
    const labels = {
      estado:
        value === "activo"
          ? "Habilitados"
          : value === "inactivo"
          ? "Deshabilitados"
          : "Todos",
      orden:
        value === "fechaAlta-asc"
          ? "Fecha Alta (Asc)"
          : value === "fechaAlta-desc"
          ? "Fecha Alta (Desc)"
          : "Sin orden",
    };
    return labels[filterType] || value;
  };

  return (
    <Box sx={{ mb: 3 }}>
      {/* Búsqueda rápida */}
      <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start", mb: 2 }}>
        <TextField
          fullWidth
          placeholder="Buscar por nombre, apellido, DNI, credencial..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={handleKeyPress}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ maxWidth: 500,
            bgcolor: "#ffffff",
           }}
        />
      </Box>

      {/* Filtros avanzados */}
      <Accordion expanded={expanded} onChange={() => setExpanded(!expanded)}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle1">Filtros Avanzados</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 2 }}>
            {/* Filtro por estado */}
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Estado</InputLabel>
              <Select
                value={filterState.estado}
                label="Estado"
                onChange={(e) => handleFilterChange("estado", e.target.value)}
              >
                <MenuItem value="todos">Todos</MenuItem>
                <MenuItem value="activo">Habilitados</MenuItem>
                <MenuItem value="inactivo">Deshabilitados</MenuItem>
              </Select>
            </FormControl>

            {/* Filtro por DNI */}
            <TextField
              label="Buscar por DNI"
              value={filterState.dni}
              onChange={(e) => handleFilterChange("dni", e.target.value)}
              sx={{ minWidth: 150 }}
            />

            {/* Filtro por credencial */}
            <TextField
              label="Buscar por credencial"
              value={filterState.credencial}
              onChange={(e) => handleFilterChange("credencial", e.target.value)}
              sx={{ minWidth: 150 }}
              placeholder="0000001-01"
            />

            {/* Filtro por dirección */}
            <TextField
              label="Buscar por dirección"
              value={filterState.direccion}
              onChange={(e) => handleFilterChange("direccion", e.target.value)}
              sx={{ minWidth: 200 }}
            />

            {/* Filtro por fecha de nacimiento */}
            <TextField
              label="Fecha nacimiento desde"
              type="date"
              value={filterState.fechaNacimientoDesde}
              onChange={(e) =>
                handleFilterChange("fechaNacimientoDesde", e.target.value)
              }
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Fecha nacimiento hasta"
              type="date"
              value={filterState.fechaNacimientoHasta}
              onChange={(e) =>
                handleFilterChange("fechaNacimientoHasta", e.target.value)
              }
              InputLabelProps={{ shrink: true }}
            />

            {/* Ordenamiento */}
            <FormControl sx={{ minWidth: 180 }}>
              <InputLabel>Ordenar por</InputLabel>
              <Select
                value={filterState.orden}
                label="Ordenar por"
                onChange={(e) => handleFilterChange("orden", e.target.value)}
              >
                <MenuItem value="">Sin orden</MenuItem>
                <MenuItem value="fechaAlta-asc">
                  Fecha Alta (Ascendente)
                </MenuItem>
                <MenuItem value="fechaAlta-desc">
                  Fecha Alta (Descendente)
                </MenuItem>
                <MenuItem value="apellido-asc">Apellido (A-Z)</MenuItem>
                <MenuItem value="apellido-desc">Apellido (Z-A)</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Button
            size="small"
            startIcon={<ClearIcon />}
            onClick={handleClearAll}
            variant="outlined"
          >
            Limpiar todos los filtros
          </Button>
        </AccordionDetails>
      </Accordion>

      {/* Chips de filtros activos */}
      {(activeFilters.length > 0 ||
        filterState.estado !== "todos" ||
        filterState.orden ||
        filterState.dni ||
        filterState.credencial ||
        filterState.direccion ||
        filterState.fechaNacimientoDesde ||
        filterState.fechaNacimientoHasta) && (
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

          {/* Chips para filtros de búsqueda rápida */}
          {activeFilters.map((filter, index) => (
            <Chip
              key={`search-${index}`}
              label={filter}
              onDelete={() => handleRemoveFilter(filter)}
              variant="outlined"
              size="small"
            />
          ))}

          {/* Chips para filtros avanzados */}
          {filterState.estado !== "todos" && (
            <Chip
              label={getFilterDisplayText("estado", filterState.estado)}
              onDelete={() => handleFilterChange("estado", "todos")}
              variant="outlined"
              size="small"
            />
          )}

          {filterState.dni && (
            <Chip
              label={`DNI: ${filterState.dni}`}
              onDelete={() => handleFilterChange("dni", "")}
              variant="outlined"
              size="small"
            />
          )}

          {filterState.credencial && (
            <Chip
              label={`Credencial: ${filterState.credencial}`}
              onDelete={() => handleFilterChange("credencial", "")}
              variant="outlined"
              size="small"
            />
          )}

          {filterState.direccion && (
            <Chip
              label={`Dirección: ${filterState.direccion}`}
              onDelete={() => handleFilterChange("direccion", "")}
              variant="outlined"
              size="small"
            />
          )}

          {filterState.fechaNacimientoDesde && (
            <Chip
              label={`Nac. desde: ${filterState.fechaNacimientoDesde}`}
              onDelete={() => handleFilterChange("fechaNacimientoDesde", "")}
              variant="outlined"
              size="small"
            />
          )}

          {filterState.fechaNacimientoHasta && (
            <Chip
              label={`Nac. hasta: ${filterState.fechaNacimientoHasta}`}
              onDelete={() => handleFilterChange("fechaNacimientoHasta", "")}
              variant="outlined"
              size="small"
            />
          )}

          {filterState.orden && (
            <Chip
              label={getFilterDisplayText("orden", filterState.orden)}
              onDelete={() => handleFilterChange("orden", "")}
              variant="outlined"
              size="small"
            />
          )}
        </Box>
      )}
    </Box>
  );
}
