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
} from "@mui/icons-material";

export default function AdvancedSearchBar({
  afiliados,
  personas,
  planesMedicos,
  onFilteredAfiliadosChange,
  estaActivo,
  tieneBajaProgramada,
  tieneAltaProgramada,
}) {
  const [expanded, setExpanded] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilters, setActiveFilters] = useState([]);
  const [filterState, setFilterState] = useState({
    estado: "todos",
    estadoBaja: "todos",
    estadoAlta: "todos",
    planMedico: "todos",
    fechaAltaDesde: "",
    fechaAltaHasta: "",
    fechaBajaDesde: "",
    fechaBajaHasta: "",
    orden: "",
  });

  // Función para aplicar todos los filtros
  const filteredAfiliados = useMemo(() => {
    if (!afiliados) return [];

    return afiliados
      .filter((afiliado) => {
        // Obtener el titular del afiliado para búsqueda
        const titular = personas.find((p) => p.id === afiliado.titularId);
        if (!titular) return false;

        // Filtro por búsqueda rápida
        const searchFields = [
          titular.nombre.toLowerCase(),
          titular.apellido.toLowerCase(),
          titular.tipoDocumento?.toLowerCase() || "",
          titular.numeroDocumento?.toLowerCase() || "",
          afiliado.numeroAfiliado.toString(),
        ].join(" ");

        const matchesCurrentSearch =
          searchTerm === "" || searchFields.includes(searchTerm.toLowerCase());
        const matchesActiveFilters =
          activeFilters.length === 0 ||
          activeFilters.every((filter) =>
            searchFields.includes(filter.toLowerCase())
          );

        // Filtro por estado (activo/inactivo)
        const matchesEstado =
          filterState.estado === "todos" ||
          (filterState.estado === "activos" &&
            estaActivo(afiliado.alta, afiliado.baja)) ||
          (filterState.estado === "inactivos" &&
            !estaActivo(afiliado.alta, afiliado.baja));

        // Filtro por estado de baja
        const matchesEstadoBaja =
          filterState.estadoBaja === "todos" ||
          (filterState.estadoBaja === "conBajaProgramada" &&
            tieneBajaProgramada(afiliado.baja)) ||
          (filterState.estadoBaja === "sinBaja" && !afiliado.baja) ||
          (filterState.estadoBaja === "conBajaEfectiva" &&
            afiliado.baja &&
            !tieneBajaProgramada(afiliado.baja));

        const matchesEstadoAlta =
          filterState.estadoAlta === "todos" ||
          (filterState.estadoAlta === "conAltaProgramada" &&
            tieneAltaProgramada(afiliado.alta, afiliado.baja)) ||
          (filterState.estadoAlta === "sinAltaProgramada" &&
            !tieneAltaProgramada(afiliado.alta, afiliado.baja));

        // Filtro por plan médico
        const matchesPlanMedico =
          filterState.planMedico === "todos" ||
          afiliado.planMedicoId.toString() === filterState.planMedico;

        // Filtro por fecha de alta
        const fechaAlta = new Date(afiliado.alta);
        const matchesFechaAltaDesde =
          !filterState.fechaAltaDesde ||
          fechaAlta >= new Date(filterState.fechaAltaDesde);

        const matchesFechaAltaHasta =
          !filterState.fechaAltaHasta ||
          fechaAlta <= new Date(filterState.fechaAltaHasta);

        // Filtro por fecha de baja
        const fechaBaja = afiliado.baja ? new Date(afiliado.baja) : null;
        const matchesFechaBajaDesde =
          !filterState.fechaBajaDesde ||
          (fechaBaja && fechaBaja >= new Date(filterState.fechaBajaDesde));

        const matchesFechaBajaHasta =
          !filterState.fechaBajaHasta ||
          (fechaBaja && fechaBaja <= new Date(filterState.fechaBajaHasta));

        return (
          matchesCurrentSearch &&
          matchesActiveFilters &&
          matchesEstado &&
          matchesEstadoBaja &&
          matchesEstadoAlta &&
          matchesPlanMedico &&
          matchesFechaAltaDesde &&
          matchesFechaAltaHasta &&
          matchesFechaBajaDesde &&
          matchesFechaBajaHasta
        );
      })
      .sort((a, b) => {
        // Ordenamiento
        if (!filterState.orden) return 0;

        switch (filterState.orden) {
          case "fechaAlta-asc":
            return new Date(a.alta) - new Date(b.alta);
          case "fechaAlta-desc":
            return new Date(b.alta) - new Date(a.alta);
          case "fechaBaja-asc":
            return (
              (a.baja ? new Date(a.baja) : new Date("9999-12-31")) -
              (b.baja ? new Date(b.baja) : new Date("9999-12-31"))
            );
          case "fechaBaja-desc":
            return (
              (b.baja ? new Date(b.baja) : new Date("9999-12-31")) -
              (a.baja ? new Date(a.baja) : new Date("9999-12-31"))
            );
          case "numeroAfiliado-asc":
            return a.numeroAfiliado - b.numeroAfiliado;
          case "numeroAfiliado-desc":
            return b.numeroAfiliado - a.numeroAfiliado;
          default:
            return 0;
        }
      });
  }, [
    afiliados,
    personas,
    searchTerm,
    activeFilters,
    filterState,
    estaActivo,
    tieneBajaProgramada,
    tieneAltaProgramada,
  ]);

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
      estadoBaja: "todos",
      estadoAlta: "todos",
      planMedico: "todos",
      fechaAltaDesde: "",
      fechaAltaHasta: "",
      fechaBajaDesde: "",
      fechaBajaHasta: "",
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
        value === "activos"
          ? "Activos"
          : value === "inactivos"
          ? "Inactivos"
          : "Todos",
      estadoBaja:
        value === "conBajaProgramada"
          ? "Con baja programada"
          : value === "sinBaja"
          ? "Sin baja"
          : value === "conBajaEfectiva"
          ? "Con baja efectiva"
          : "Todos",
      estadoAlta:
        value === "conAltaProgramada"
          ? "Con alta programada"
          : value === "sinAltaProgramada"
          ? "Sin alta programada"
          : "Todos",
      planMedico:
        value === "todos"
          ? "Todos los planes"
          : planesMedicos.find((p) => p.id.toString() === value)?.nombre ||
            value,
      orden:
        value === "fechaAlta-asc"
          ? "Fecha Alta (Asc)"
          : value === "fechaAlta-desc"
          ? "Fecha Alta (Desc)"
          : value === "fechaBaja-asc"
          ? "Fecha Baja (Asc)"
          : value === "fechaBaja-desc"
          ? "Fecha Baja (Desc)"
          : value === "numeroAfiliado-asc"
          ? "Nº Afiliado (Asc)"
          : value === "numeroAfiliado-desc"
          ? "Nº Afiliado (Desc)"
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
          placeholder="Buscar por nombre, apellido, número de afiliado..."
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
          sx={{ maxWidth: 500, bgcolor: "#ffffff" }}
        />
      </Box>

      {/* Filtros avanzados */}
      <Accordion expanded={expanded} onChange={() => setExpanded(!expanded)}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle1">Filtros Avanzados</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 2 }}>
            {/* Filtro por estado activo/inactivo */}
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Estado</InputLabel>
              <Select
                value={filterState.estado}
                label="Estado"
                onChange={(e) => handleFilterChange("estado", e.target.value)}
              >
                <MenuItem value="todos">Todos</MenuItem>
                <MenuItem value="activos">Activos</MenuItem>
                <MenuItem value="inactivos">Inactivos</MenuItem>
              </Select>
            </FormControl>

            {/* Filtro por estado de baja */}
            <FormControl sx={{ minWidth: 180 }}>
              <InputLabel>Estado de baja</InputLabel>
              <Select
                value={filterState.estadoBaja}
                label="Estado de baja"
                onChange={(e) =>
                  handleFilterChange("estadoBaja", e.target.value)
                }
              >
                <MenuItem value="todos">Todos</MenuItem>
                <MenuItem value="sinBaja">Sin baja</MenuItem>
                <MenuItem value="conBajaProgramada">
                  Con baja programada
                </MenuItem>
                <MenuItem value="conBajaEfectiva">Con baja efectiva</MenuItem>
              </Select>
            </FormControl>

            {/* Filtro por estado de alta */}
            <FormControl sx={{ minWidth: 180 }}>
              <InputLabel>Estado de alta</InputLabel>
              <Select
                value={filterState.estadoAlta}
                label="Estado de alta"
                onChange={(e) =>
                  handleFilterChange("estadoAlta", e.target.value)
                }
              >
                <MenuItem value="todos">Todos</MenuItem>
                <MenuItem value="conAltaProgramada">
                  Con alta programada
                </MenuItem>
                <MenuItem value="sinAltaProgramada">
                  Sin alta programada
                </MenuItem>
              </Select>
            </FormControl>

            {/* Filtro por plan médico */}
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Plan Médico</InputLabel>
              <Select
                value={filterState.planMedico}
                label="Plan Médico"
                onChange={(e) =>
                  handleFilterChange("planMedico", e.target.value)
                }
              >
                <MenuItem value="todos">Todos</MenuItem>
                {planesMedicos.map((plan) => (
                  <MenuItem key={plan.id} value={plan.id.toString()}>
                    {plan.nombre}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Filtro por fecha de alta */}
            <TextField
              label="Alta desde"
              type="date"
              value={filterState.fechaAltaDesde}
              onChange={(e) =>
                handleFilterChange("fechaAltaDesde", e.target.value)
              }
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Alta hasta"
              type="date"
              value={filterState.fechaAltaHasta}
              onChange={(e) =>
                handleFilterChange("fechaAltaHasta", e.target.value)
              }
              InputLabelProps={{ shrink: true }}
            />

            {/* Filtro por fecha de baja */}
            <TextField
              label="Baja desde"
              type="date"
              value={filterState.fechaBajaDesde}
              onChange={(e) =>
                handleFilterChange("fechaBajaDesde", e.target.value)
              }
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Baja hasta"
              type="date"
              value={filterState.fechaBajaHasta}
              onChange={(e) =>
                handleFilterChange("fechaBajaHasta", e.target.value)
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
                <MenuItem value="fechaBaja-asc">
                  Fecha Baja (Ascendente)
                </MenuItem>
                <MenuItem value="fechaBaja-desc">
                  Fecha Baja (Descendente)
                </MenuItem>
                <MenuItem value="numeroAfiliado-asc">
                  Nº Afiliado (Ascendente)
                </MenuItem>
                <MenuItem value="numeroAfiliado-desc">
                  Nº Afiliado (Descendente)
                </MenuItem>
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
        filterState.estadoBaja !== "todos" ||
        filterState.planMedico !== "todos" ||
        filterState.orden ||
        filterState.fechaAltaDesde ||
        filterState.fechaAltaHasta ||
        filterState.fechaBajaDesde ||
        filterState.fechaBajaHasta) && (
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

          {filterState.estadoBaja !== "todos" && (
            <Chip
              label={getFilterDisplayText("estadoBaja", filterState.estadoBaja)}
              onDelete={() => handleFilterChange("estadoBaja", "todos")}
              variant="outlined"
              size="small"
            />
          )}

          {filterState.estadoAlta !== "todos" && (
            <Chip
              label={getFilterDisplayText("estadoAlta", filterState.estadoAlta)}
              onDelete={() => handleFilterChange("estadoAlta", "todos")}
              variant="outlined"
              size="small"
            />
          )}

          {filterState.planMedico !== "todos" && (
            <Chip
              label={getFilterDisplayText("planMedico", filterState.planMedico)}
              onDelete={() => handleFilterChange("planMedico", "todos")}
              variant="outlined"
              size="small"
            />
          )}

          {filterState.fechaAltaDesde && (
            <Chip
              label={`Alta desde: ${filterState.fechaAltaDesde}`}
              onDelete={() => handleFilterChange("fechaAltaDesde", "")}
              variant="outlined"
              size="small"
            />
          )}

          {filterState.fechaAltaHasta && (
            <Chip
              label={`Alta hasta: ${filterState.fechaAltaHasta}`}
              onDelete={() => handleFilterChange("fechaAltaHasta", "")}
              variant="outlined"
              size="small"
            />
          )}

          {filterState.fechaBajaDesde && (
            <Chip
              label={`Baja desde: ${filterState.fechaBajaDesde}`}
              onDelete={() => handleFilterChange("fechaBajaDesde", "")}
              variant="outlined"
              size="small"
            />
          )}

          {filterState.fechaBajaHasta && (
            <Chip
              label={`Baja hasta: ${filterState.fechaBajaHasta}`}
              onDelete={() => handleFilterChange("fechaBajaHasta", "")}
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
