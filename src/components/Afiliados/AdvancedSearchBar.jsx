import { useState, useMemo, useEffect, useRef, useCallback } from "react";
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
  afiliados = [],
  planesMedicos = [],
  onFilteredAfiliadosChange = () => {},
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

  // Ref para evitar notificar con la misma lista
  const lastIdsRef = useRef(null);

  const getTitularDelAfiliado = (afiliado) => {
    if (!afiliado || !afiliado.integrantes) return null;
    const titularId = afiliado.titularID ?? afiliado.titularId;
    return afiliado.integrantes.find((i) => String(i.id) === String(titularId));
  };

  const filteredAfiliados = useMemo(() => {
    if (!Array.isArray(afiliados) || afiliados.length === 0) return [];

    let filtered = afiliados.filter((afiliado) => {
      const titular = getTitularDelAfiliado(afiliado);

      // Si no hay titular, descartar el afiliado
      if (!titular) return false;

      // Búsqueda por texto
      const searchFields = [
        titular.nombre?.toLowerCase() || "",
        titular.apellido?.toLowerCase() || "",
        titular.documentacion?.numero?.toLowerCase() ||
          titular.numeroDocumento?.toLowerCase() ||
          "",
        String(afiliado.numeroAfiliado || "").toLowerCase(),
      ].join(" ");

      const search = searchTerm.trim().toLowerCase();
      const matchesSearch = !search || searchFields.includes(search);

      // Filtros de chips activos
      const matchesActiveFilters =
        activeFilters.length === 0 ||
        activeFilters.every((filter) =>
          searchFields.includes(filter.toLowerCase())
        );

      // Filtro de estado (activo/inactivo)
      const matchesEstado =
        filterState.estado === "todos" ||
        (filterState.estado === "activos" &&
          estaActivo(afiliado.alta, afiliado.baja)) ||
        (filterState.estado === "inactivos" &&
          !estaActivo(afiliado.alta, afiliado.baja));

      // Filtro de estado de baja
      const matchesEstadoBaja =
        filterState.estadoBaja === "todos" ||
        (filterState.estadoBaja === "conBajaProgramada" &&
          tieneBajaProgramada(afiliado.baja)) ||
        (filterState.estadoBaja === "sinBaja" && !afiliado.baja) ||
        (filterState.estadoBaja === "conBajaEfectiva" &&
          afiliado.baja &&
          !tieneBajaProgramada(afiliado.baja));

      // Filtro de estado de alta
      const matchesEstadoAlta =
        filterState.estadoAlta === "todos" ||
        (filterState.estadoAlta === "conAltaProgramada" &&
          tieneAltaProgramada(afiliado.alta)) ||
        (filterState.estadoAlta === "sinAltaProgramada" &&
          !tieneAltaProgramada(afiliado.alta));

      // Filtro de plan médico
      const matchesPlanMedico =
        filterState.planMedico === "todos" ||
        String(afiliado.planMedicoId) === String(filterState.planMedico);

      // Filtros de fecha de alta
      const fechaAlta = afiliado.alta ? new Date(afiliado.alta) : null;
      const matchesFechaAltaDesde =
        !filterState.fechaAltaDesde ||
        (fechaAlta &&
          fechaAlta >= new Date(filterState.fechaAltaDesde + "T00:00:00"));
      const matchesFechaAltaHasta =
        !filterState.fechaAltaHasta ||
        (fechaAlta &&
          fechaAlta <= new Date(filterState.fechaAltaHasta + "T23:59:59"));

      // Filtros de fecha de baja
      const fechaBaja = afiliado.baja ? new Date(afiliado.baja) : null;
      const matchesFechaBajaDesde =
        !filterState.fechaBajaDesde ||
        (fechaBaja &&
          fechaBaja >= new Date(filterState.fechaBajaDesde + "T00:00:00"));
      const matchesFechaBajaHasta =
        !filterState.fechaBajaHasta ||
        (fechaBaja &&
          fechaBaja <= new Date(filterState.fechaBajaHasta + "T23:59:59"));

      return (
        matchesSearch &&
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
    });

    // Ordenamiento
    if (filterState.orden) {
      filtered.sort((a, b) => {
        switch (filterState.orden) {
          case "fechaAlta-asc":
            return new Date(a.alta || 0) - new Date(b.alta || 0);
          case "fechaAlta-desc":
            return new Date(b.alta || 0) - new Date(a.alta || 0);
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
            return (
              (Number(a.numeroAfiliado) || 0) - (Number(b.numeroAfiliado) || 0)
            );
          case "numeroAfiliado-desc":
            return (
              (Number(b.numeroAfiliado) || 0) - (Number(a.numeroAfiliado) || 0)
            );
          default:
            return 0;
        }
      });
    }

    return filtered;
  }, [
    afiliados,
    searchTerm,
    activeFilters,
    filterState,
    estaActivo,
    tieneBajaProgramada,
    tieneAltaProgramada,
  ]);

  // Notificar cambios en la lista filtrada
  useEffect(() => {
    const currentIds = filteredAfiliados.map((a) => a.id).join(",");
    const lastIds = lastIdsRef.current;

    if (currentIds !== lastIds) {
      lastIdsRef.current = currentIds;
      onFilteredAfiliadosChange(filteredAfiliados);
    }
  }, [filteredAfiliados, onFilteredAfiliadosChange]);

  const handleKeyPress = useCallback(
    (e) => {
      if (
        e.key === "Enter" &&
        searchTerm.trim() &&
        !activeFilters.includes(searchTerm.trim())
      ) {
        setActiveFilters((prev) => [...prev, searchTerm.trim()]);
        setSearchTerm("");
      }
    },
    [searchTerm, activeFilters]
  );

  const handleRemoveFilter = useCallback((filterToRemove) => {
    setActiveFilters((prev) =>
      prev.filter((filter) => filter !== filterToRemove)
    );
  }, []);

  const handleClearAll = useCallback(() => {
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
  }, []);

  const handleFilterChange = useCallback((filterType, value) => {
    setFilterState((prev) => ({ ...prev, [filterType]: value }));
  }, []);

  const getFilterDisplayText = useCallback(
    (filterType, value) => {
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
            : planesMedicos.find((p) => String(p.id) === String(value))
                ?.nombre || value,
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
    },
    [planesMedicos]
  );

  const hasActiveFilters =
    activeFilters.length > 0 ||
    filterState.estado !== "todos" ||
    filterState.estadoBaja !== "todos" ||
    filterState.estadoAlta !== "todos" ||
    filterState.planMedico !== "todos" ||
    filterState.orden ||
    filterState.fechaAltaDesde ||
    filterState.fechaAltaHasta ||
    filterState.fechaBajaDesde ||
    filterState.fechaBajaHasta;

  return (
    <Box sx={{ mb: 3 }}>
      {/* Búsqueda rápida */}
      <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start", mb: 2 }}>
        <TextField
          fullWidth
          placeholder="Buscar por nombre, apellido, documento, número de afiliado..."
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
      <Accordion expanded={expanded} onChange={() => setExpanded((s) => !s)}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle1">Filtros Avanzados</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 2 }}>
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
      {hasActiveFilters && (
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
              key={`search-${index}`}
              label={filter}
              onDelete={() => handleRemoveFilter(filter)}
              variant="outlined"
              size="small"
            />
          ))}

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
