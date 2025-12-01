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

const DIAS_SEMANA = [
  { value: "1", label: "Lunes" },
  { value: "2", label: "Martes" },
  { value: "3", label: "Miércoles" },
  { value: "4", label: "Jueves" },
  { value: "5", label: "Viernes" },
  { value: "6", label: "Sábado" },
  { value: "7", label: "Domingo" },
];

export default function AdvancedSearchBarPrestadores({
  prestadores = [],
  especialidades = [],
  onFilteredPrestadoresChange = () => {},
}) {
  const [expanded, setExpanded] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilters, setActiveFilters] = useState([]);

  const [filterState, setFilterState] = useState({
    estado: "todos",
    rol: "todos",
    especialidadId: "todos",
    dias: [], // array de strings con los días seleccionados ("1".."7")
    orden: "",
  });

  const lastIdsRef = useRef(null);

  const filteredPrestadores = useMemo(() => {
    if (!Array.isArray(prestadores) || prestadores.length === 0) return [];

    let filtered = prestadores.filter((p) => {
      const search = searchTerm.trim().toLowerCase();

      // CP y otras partes de dirección
      const direccionesText = Array.isArray(p.direcciones)
        ? p.direcciones
            .map((d) =>
              [
                d.calle,
                d.altura,
                d.provinciaCiudad,
                d.codigoPostal,
              ]
                .filter(Boolean)
                .join(" ")
            )
            .join(" ")
        : "";

      const searchFields = [
        p.nombreCompleto?.toLowerCase() || "",
        p.documentacion?.numero?.toLowerCase() || "",
        String(direccionesText).toLowerCase(),
      ].join(" ");

      const matchesSearch = !search || searchFields.includes(search);

      const matchesActiveFilters =
        activeFilters.length === 0 ||
        activeFilters.every((f) => searchFields.includes(f.toLowerCase()));

      const activo = p.baja == null;

      const matchesEstado =
        filterState.estado === "todos" ||
        (filterState.estado === "activos" && activo) ||
        (filterState.estado === "inactivos" && !activo);

      const prestadorRol = String(p.rol);
      const filtroRol = String(filterState.rol);

      const matchesRol = filtroRol === "todos" || prestadorRol === filtroRol;

      const prestadorEspecialidadesIds = Array.isArray(p.especialidadesIds)
        ? p.especialidadesIds
        : Array.isArray(p.especialidades)
        ? p.especialidades.map((e) => e.id)
        : [];

      const matchesEspecialidad =
        filterState.especialidadId === "todos" ||
        prestadorEspecialidadesIds.some(
          (id) => String(id) === String(filterState.especialidadId)
        );

      // Filtro por día de atención (usa agendas / horarios) - permite varios días
      let matchesDia = true;
      if (Array.isArray(filterState.dias) && filterState.dias.length > 0) {
        const diasSeleccionados = filterState.dias
          .map((d) => Number(d))
          .filter((n) => !Number.isNaN(n));

        const agendas = Array.isArray(p.agendas) ? p.agendas : [];

        const tieneDia = agendas.some((ag) => {
          const horarios = Array.isArray(ag.horarios)
            ? ag.horarios
            : Array.isArray(ag.horariosAtencion)
            ? ag.horariosAtencion
            : [];

          return horarios.some((h) => {
            const dias =
              Array.isArray(h.diasAtencion) && h.diasAtencion.length > 0
                ? h.diasAtencion
                : Array.isArray(h.diasDeLaSemana)
                ? h.diasDeLaSemana
                : Array.isArray(h.dias)
                ? h.dias
                : [];

            return dias.some((d) => {
              if (d == null) return false;
              const valor =
                typeof d === "number"
                  ? d
                  : typeof d === "string"
                  ? Number(d)
                  : Number(d.dia);
              if (Number.isNaN(valor)) return false;
              // alcanza con que coincida al menos un día seleccionado
              return diasSeleccionados.includes(valor);
            });
          });
        });

        matchesDia = tieneDia;
      }

      return (
        matchesSearch &&
        matchesActiveFilters &&
        matchesEstado &&
        matchesRol &&
        matchesEspecialidad &&
        matchesDia
      );
    });

    // ORDENAMIENTO
    if (filterState.orden === "nombre-asc" || filterState.orden === "nombre-desc") {
      const asc = filterState.orden === "nombre-asc";
      filtered = [...filtered].sort((a, b) => {
        const na = (a?.nombreCompleto || "").toString().toLowerCase();
        const nb = (b?.nombreCompleto || "").toString().toLowerCase();
        if (na < nb) return asc ? -1 : 1;
        if (na > nb) return asc ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [prestadores, searchTerm, activeFilters, filterState]);

  // Notificar cambios
  useEffect(() => {
    const ids = filteredPrestadores.map((p) => p.id).join(",");
    if (ids !== lastIdsRef.current) {
      lastIdsRef.current = ids;
      onFilteredPrestadoresChange(filteredPrestadores);
    }
  }, [filteredPrestadores, onFilteredPrestadoresChange]);

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

  const handleRemoveFilter = useCallback((filter) => {
    setActiveFilters((prev) => prev.filter((f) => f !== filter));
  }, []);

  const handleClearAll = () => {
    setActiveFilters([]);
    setSearchTerm("");
    setFilterState({
      estado: "todos",
      rol: "todos",
      especialidadId: "todos",
      dias: [],
      orden: "",
    });
  };

  const hasActiveFilters =
    activeFilters.length > 0 ||
    filterState.estado !== "todos" ||
    filterState.rol !== "todos" ||
    filterState.especialidadId !== "todos" ||
    (Array.isArray(filterState.dias) && filterState.dias.length > 0) ||
    filterState.orden !== "";

  return (
    <Box sx={{ mb: 3 }}>
      {/* BUSCADOR RÁPIDO */}
      <Box sx={{ mb: 2 }}>
        <TextField
          fullWidth
          placeholder="Buscar por nombre o documento..."
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
          sx={{ bgcolor: "#ffffff" }}
        />
      </Box>

      {/* FILTROS AVANZADOS */}
      <Accordion expanded={expanded} onChange={() => setExpanded((x) => !x)}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle1">Filtros Avanzados</Typography>
        </AccordionSummary>

        <AccordionDetails>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
            {/* ESTADO */}
            <FormControl sx={{ minWidth: 160 }}>
              <InputLabel>Estado</InputLabel>
              <Select
                value={filterState.estado}
                label="Estado"
                onChange={(e) =>
                  setFilterState((s) => ({ ...s, estado: e.target.value }))
                }
              >
                <MenuItem value="todos">Todos</MenuItem>
                <MenuItem value="activos">Activos</MenuItem>
                <MenuItem value="inactivos">Inactivos</MenuItem>
              </Select>
            </FormControl>

            {/* ROL */}
            <FormControl sx={{ minWidth: 160 }}>
              <InputLabel>Rol</InputLabel>
              <Select
                value={filterState.rol}
                label="Rol"
                onChange={(e) =>
                  setFilterState((s) => ({ ...s, rol: String(e.target.value) }))
                }
              >
                <MenuItem value="todos">Todos</MenuItem>
                <MenuItem value="1">Profesionales</MenuItem>
                <MenuItem value="0">Centros Médicos</MenuItem>
              </Select>
            </FormControl>

            {/* ESPECIALIDAD (SIMPLE) */}
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Especialidad</InputLabel>
              <Select
                value={filterState.especialidadId}
                label="Especialidad"
                onChange={(e) =>
                  setFilterState((s) => ({
                    ...s,
                    especialidadId: e.target.value,
                  }))
                }
              >
                <MenuItem value="todos">Todas</MenuItem>
                {especialidades.map((e) => (
                  <MenuItem key={e.id} value={e.id}>
                    {e.nombre}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* DÍAS DE ATENCIÓN (MÚLTIPLE) */}
            <FormControl sx={{ minWidth: 220 }}>
              <InputLabel>Días de atención</InputLabel>
              <Select
                multiple
                value={filterState.dias}
                label="Días de atención"
                onChange={(e) =>
                  setFilterState((s) => ({
                    ...s,
                    dias: e.target.value,
                  }))
                }
                renderValue={(selected) => {
                  if (!Array.isArray(selected) || selected.length === 0)
                    return "Todos";
                  return DIAS_SEMANA.filter((d) =>
                    selected.includes(d.value)
                  )
                    .map((d) => d.label)
                    .join(", ");
                }}
              >
                {DIAS_SEMANA.map((d) => (
                  <MenuItem key={d.value} value={d.value}>
                    {d.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* ORDEN */}
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Ordenar por</InputLabel>
              <Select
                value={filterState.orden}
                label="Ordenar por"
                onChange={(e) =>
                  setFilterState((s) => ({ ...s, orden: e.target.value }))
                }
              >
                <MenuItem value="">Sin orden</MenuItem>
                <MenuItem value="nombre-asc">Nombre (A-Z)</MenuItem>
                <MenuItem value="nombre-desc">Nombre (Z-A)</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Button
            startIcon={<ClearIcon />}
            onClick={handleClearAll}
            sx={{ mt: 2 }}
          >
            Limpiar todos los filtros
          </Button>
        </AccordionDetails>
      </Accordion>

      {/* CHIPS ACTIVOS */}
      {hasActiveFilters && (
        <Box
          sx={{
            mt: 2,
            display: "flex",
            flexWrap: "wrap",
            gap: 1,
            alignItems: "center",
          }}
        >
          <Typography variant="body2" sx={{ color: "#666", mr: 1 }}>
            Filtros activos:
          </Typography>

          {activeFilters.map((f) => (
            <Chip
              key={f}
              label={f}
              onDelete={() => handleRemoveFilter(f)}
              variant="outlined"
              size="small"
            />
          ))}

          {filterState.estado !== "todos" && (
            <Chip
              label={filterState.estado === "activos" ? "Activos" : "Inactivos"}
              onDelete={() =>
                setFilterState((s) => ({ ...s, estado: "todos" }))
              }
              variant="outlined"
              size="small"
            />
          )}

          {filterState.rol !== "todos" && (
            <Chip
              label={
                filterState.rol === "1"
                  ? "Profesionales"
                  : filterState.rol === "0"
                  ? "Centros Médicos"
                  : `Rol: ${filterState.rol}`
              }
              onDelete={() => setFilterState((s) => ({ ...s, rol: "todos" }))}
              variant="outlined"
              size="small"
            />
          )}

          {filterState.especialidadId !== "todos" && (
            <Chip
              label={
                especialidades.find(
                  (e) => String(e.id) === String(filterState.especialidadId)
                )?.nombre || "Especialidad"
              }
              onDelete={() =>
                setFilterState((s) => ({ ...s, especialidadId: "todos" }))
              }
              variant="outlined"
              size="small"
            />
          )}

          {Array.isArray(filterState.dias) &&
            filterState.dias.map((dia) => {
              const info = DIAS_SEMANA.find((d) => d.value === String(dia));
              return (
                <Chip
                  key={dia}
                  label={info?.label || `Día ${dia}`}
                  onDelete={() =>
                    setFilterState((s) => ({
                      ...s,
                      dias: s.dias.filter((x) => x !== dia),
                    }))
                  }
                  variant="outlined"
                  size="small"
                />
              );
            })}

          {filterState.orden && (
            <Chip
              label={
                filterState.orden === "nombre-asc"
                  ? "Nombre (A-Z)"
                  : "Nombre (Z-A)"
              }
              onDelete={() => setFilterState((s) => ({ ...s, orden: "" }))}
              variant="outlined"
              size="small"
            />
          )}
        </Box>
      )}
    </Box>
  );
}
