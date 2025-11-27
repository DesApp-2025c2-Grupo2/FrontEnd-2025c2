import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Divider,
  Fab,
  CircularProgress,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button
} from '@mui/material';
import PageHeader from '../components/Ui/PageHeader.jsx';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Person as PersonIcon
} from '@mui/icons-material';

import TarjetaPrestadorSimple from '../components/TarjetaPrestadorSimple';
import DialogPrestador from '../components/DialogPrestador';
import DialogVerPrestador from '../components/DialogVerPrestador';
import DialogVerCentroAgendas from '../components/DialogVerCentroAgendas.jsx';
import DialogHorariosPrestador from '../components/DialogHorariosPrestador';
import * as agendasService from '../services/agendasService';
import {
  selectPrestadoresFiltrados,
  selectPrestadoresLoading,
  selectPrestadoresError,
  cargarPrestadores,
  crearPrestador,
  editarPrestador,
  toggleActivoPrestador,
  actualizarHorariosPrestador,
  actualizarDireccionesPrestador
} from '../store/prestadoresSlice';
import { cargarEspecialidades } from '../store/especialidadesSlice';
import { selectPrestadores } from '../store/prestadoresSlice';

function Prestadores() {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Estados locales
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogoAgregar, setDialogoAgregar] = useState(false);
  const [dialogoEditar, setDialogoEditar] = useState(false);
  const [dialogoVer, setDialogoVer] = useState(false);
  const [dialogoVerCentro, setDialogoVerCentro] = useState(false);
  const [dialogoHorarios, setDialogoHorarios] = useState(false);
  const [prestadoresConAgenda, setPrestadoresConAgenda] = useState({}); // id -> prestador mergeado
  const [horariosContext, setHorariosContext] = useState({ lugarIndex: 0, horarioIndex: null });
  // Agenda creation was simplified and is not used directly from Prestadores
  const [prestadorSeleccionado, setPrestadorSeleccionado] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [highlightId, setHighlightId] = useState(null);
  const itemRefs = React.useRef(new Map());
  const setItemRef = (id) => (el) => {
    if (!el) return;
    itemRefs.current.set(id, el);
  };
  const [refreshingHorarios, setRefreshingHorarios] = useState({}); // idPrestador -> boolean

  // Selectores de Redux
  const prestadoresFiltrados = useSelector(selectPrestadoresFiltrados(searchTerm));
  const loading = useSelector(selectPrestadoresLoading);
  const error = useSelector(selectPrestadoresError);
  const prestadoresTodos = useSelector(selectPrestadores);

  // Cargar prestadores y especialidades al montar el componente
  useEffect(() => {
    dispatch(cargarPrestadores());
    dispatch(cargarEspecialidades());
  }, [dispatch]);

  // Fusionar agendas para mostrar horarios en lugares (solo en memoria)
  useEffect(() => {
    let cancelado = false;
    async function cargarAgendas() {
      const actuales = { ...prestadoresConAgenda };
      const promises = [];
      prestadoresFiltrados.forEach((p) => {
        // Mantener horarios existentes en cache pero refrescar datos base (nombre, tipo, etc.)
        const existente = actuales[p.id];
        if (existente) {
          const lugares = Array.isArray(existente.lugaresAtencion) ? existente.lugaresAtencion : p.lugaresAtencion;
          actuales[p.id] = { ...p, lugaresAtencion: lugares };
          // Para profesionales independientes, si ya tenemos cache, no volvemos a pedir agendas
          if (p.tipo !== 'Centro Médico') {
            return;
          }
          // Para centros SIEMPRE refrescamos desde getByCentro, así reflejan los horarios más recientes del backend
        }
        // Cargar agendas y mergear
        if (p.tipo === 'Centro Médico') {
          // Preferir endpoint del backend para centros; fallback a fan-out
          promises.push(
            agendasService.getByCentro(p.id).then(async (profList) => {
              if (cancelado) return;
              const canonDir = (s) => {
                return String(s || '')
                  .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
                  .replace(/\s+/g, ' ')
                  .replace(/\b(s\/?n|s\/?d)\b/gi, '')
                  .replace(/[,.;\-–—]+$/g, '')
                  .trim()
                  .toLowerCase();
              };
              const lugares = [];
              const keyMap = new Map(); // key -> index
              const addHorario = (lugarId, dir, horario, pid) => {
                const key = (typeof lugarId === 'number' && lugarId > 0) ? `id:${lugarId}` : `dir:${canonDir(dir)}`;
                let idx = keyMap.get(key);
                if (idx === undefined) {
                  idx = lugares.length;
                  keyMap.set(key, idx);
                  lugares.push({ id: (typeof lugarId === 'number' && lugarId > 0 ? lugarId : null), direccion: dir, horarios: [] });
                }
                const lista = lugares[idx].horarios;
                // evitar duplicados exactos
                const dias = Array.isArray(horario?.dias) ? horario.dias : (Array.isArray(horario?.diasDeLaSemana) ? horario.diasDeLaSemana : []);
                const espId = (Array.isArray(horario?.especialidades) && horario.especialidades.length > 0)
                  ? horario.especialidades[0]
                  : ((typeof horario?.especialidadId === 'number') ? horario.especialidadId : null);
                const dupKey = JSON.stringify({
                  d: [...dias].sort(),
                  hi: horario?.horaInicio || horario?.desde,
                  hf: horario?.horaFin || horario?.hasta,
                  pid,
                  esp: espId
                });
                const exists = lista.some(x => {
                  const xd = Array.isArray(x?.dias) ? x.dias : (Array.isArray(x?.diasDeLaSemana) ? x.diasDeLaSemana : []);
                  const xEsp = (Array.isArray(x?.especialidades) && x.especialidades.length > 0) ? x.especialidades[0] : ((typeof x?.especialidadId === 'number') ? x.especialidadId : null);
                  const xKey = JSON.stringify({ d: [...xd].sort(), hi: x?.horaInicio || x?.desde, hf: x?.horaFin || x?.hasta, pid: x?.profesionalId, esp: xEsp });
                  return xKey === dupKey;
                });
                if (!exists) lista.push({ ...horario, profesionalId: pid });
              };
              if (Array.isArray(profList) && profList.length > 0) {
                profList.forEach(pr => {
                  (pr?.direcciones || []).forEach(l => {
                    const horarios = Array.isArray(l?.horarios) ? l.horarios : (Array.isArray(l?.horariosAtencion) ? l.horariosAtencion : []);
                    horarios.forEach(h => addHorario(l?.id ?? l?.lugarId ?? null, l?.direccion || '', h, pr.profesionalId));
                  });
                });
              }
              const baseDirecciones2 = Array.isArray(p.lugaresAtencion) ? p.lugaresAtencion : [];
              const finalLugares2 = (lugares.length > 0) ? lugares : baseDirecciones2;
              actuales[p.id] = { ...p, lugaresAtencion: finalLugares2 };
            })
          );
        } else {
          promises.push(
            agendasService.getByProfesional(p.id).then((agendas) => {
              if (cancelado) return;
              const listaAgendas = Array.isArray(agendas) ? agendas : [];
              const canonDir = (s) => {
                return String(s || '')
                  .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
                  .replace(/\s+/g, ' ')
                  .replace(/\b(s\/?n|s\/?d)\b/gi, '')
                  .replace(/[,.;\-–—]+$/g, '')
                  .trim()
                  .toLowerCase();
              };
              const lugaresBase = Array.isArray(p.lugaresAtencion) ? JSON.parse(JSON.stringify(p.lugaresAtencion)) : [];
              const matchedKeys = new Set();
              const lugaresMergeados = lugaresBase.map((l) => {
                const lid = l?.id;
                const dirNorm = canonDir(l?.direccion);
                // Solo enriquecer por id exacto de lugar del PROFESIONAL (no por dirección)
                const matches = listaAgendas.filter((a) => {
                  const aLugarId = a?.lugarId ?? a?.lugarAtencionId ?? a?.id;
                  const matchId = lid != null && (String(aLugarId) === String(lid));
                  return matchId;
                });
                if (matches.length > 0) {
                  const primera = matches[0];
                  const horarios = matches.flatMap((m) => m.horarios || m.horariosAtencion || []);
                  const nuevoId = lid != null ? lid : (primera?.lugarId ?? primera?.lugarAtencionId ?? primera?.id ?? null);
                  const nuevaDir = l.direccion || primera?.direccion || '';
                  // Marcar como matcheadas todas las agendas usadas
                  matches.forEach((m) => {
                    const key = (m?.id != null) ? `id:${m.id}` : `dir:${canonDir(m?.direccion)}`;
                    matchedKeys.add(key);
                  });
                  return { ...l, id: nuevoId, direccion: nuevaDir, horarios };
                }
                return l;
              });
              const dedup = [];
              const seen = new Set();
              // Solo los lugares del profesional (no agregamos lugares extra provenientes del centro)
              [...lugaresMergeados].forEach((l) => {
                const key = (l && l.id != null) ? `id:${l.id}` : `dir:${canonDir(l?.direccion)}`;
                if (key && !seen.has(key)) {
                  seen.add(key);
                  dedup.push(l);
                }
              });
              actuales[p.id] = { ...p, lugaresAtencion: dedup };
            }).catch(() => {})
          );
        }
      });
      if (promises.length > 0) {
        await Promise.all(promises);
      }
      if (!cancelado) setPrestadoresConAgenda(actuales);
    }
    if (prestadoresFiltrados && prestadoresFiltrados.length > 0) {
      cargarAgendas();
    }
    return () => { cancelado = true; };
  }, [prestadoresFiltrados, /* forzamos refresh cuando cambian */ setPrestadoresConAgenda]);

  // Abrir modal si viene ?nuevo=1
  useEffect(() => {
    if (searchParams.get('nuevo') === '1') {
      setPrestadorSeleccionado(null);
      setDialogoAgregar(true);
      // limpiar query para evitar reabrir al navegar dentro
      searchParams.delete('nuevo');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  // Handlers para los botones
  const handleVer = (prestador) => {
    // Usar siempre la versión base desde Redux para preservar direcciones completas,
    // y dejar que el diálogo enriquezca con horarios según sea necesario.
    const lista = Array.isArray(prestadoresTodos) ? prestadoresTodos : [];
    const base = lista.find(p => p.id === prestador.id) || prestador;
    setPrestadorSeleccionado(base);
    // Unificar comportamiento: "Ver" siempre muestra detalles del prestador,
    // tanto para profesionales independientes como para centros médicos.
    setDialogoVer(true);
  };

  const handleEditar = (prestador) => {
    setPrestadorSeleccionado(prestador);
    setDialogoEditar(true);
  };

  const handleAgregarHorario = (prestador) => {
    setPrestadorSeleccionado(prestador);
    setHorariosContext({ lugarIndex: 0, horarioIndex: null });
    setDialogoHorarios(true);
  };

  const handleEditarHorario = (prestador, lugarIndex, horarioIndex) => {
    setPrestadorSeleccionado(prestador);
    setHorariosContext({ lugarIndex, horarioIndex });
    setDialogoHorarios(true);
  };


  const handleEliminarHorario = async (prestador, lugarIndex, horarioIndex) => {
    try {
      const copia = JSON.parse(JSON.stringify(prestador));
      if (!copia.lugaresAtencion || !copia.lugaresAtencion[lugarIndex]) return;
      const lugar = copia.lugaresAtencion[lugarIndex];
      if (!Array.isArray(lugar.horarios)) return;
      lugar.horarios = lugar.horarios.filter((_, idx) => idx !== horarioIndex);
      await dispatch(editarPrestador(copia)).unwrap();
      setSnackbar({ open: true, message: 'Horario eliminado', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: 'No se pudo eliminar el horario', severity: 'error' });
    }
  };

  const handleToggleActivo = async (prestador) => {
    try {
      await dispatch(toggleActivoPrestador({ id: prestador.id, activo: !prestador.activo })).unwrap();
      setSnackbar({
        open: true,
        message: `Prestador ${prestador.activo ? 'dado de baja' : 'rehabilitado'} exitosamente`,
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: typeof error === 'string' ? error : (error?.message || 'Error al cambiar estado del prestador'),
        severity: 'error'
      });
    }
  };

  const handleAgregar = () => {
    setPrestadorSeleccionado(null);
    setDialogoAgregar(true);
  };

  // Handlers para los diálogos
  const handleGuardarNuevo = async (nuevoPrestador) => {
    try {
      const creado = await dispatch(crearPrestador(nuevoPrestador)).unwrap();

      // Si se trata de un Centro Médico y vienen asociaciones, sincronizarlas
      if (nuevoPrestador?.tipo === 'Centro Médico' && Array.isArray(nuevoPrestador?.profesionalesAsociadosIds)) {
        // Resolver ID del centro creado
        let centroId = (creado && !Array.isArray(creado) && typeof creado?.id === 'number') ? creado.id : null;
        if (!centroId && Array.isArray(creado)) {
          const match = creado.find(p => String(p?.cuilCuit || '').toLowerCase() === String(nuevoPrestador?.cuilCuit || '').toLowerCase());
          if (match && typeof match.id === 'number') centroId = match.id;
        }
        // Intento adicional: si no lo pudimos obtener, cargar y buscar por CUIT
        if (!centroId) {
          await dispatch(cargarPrestadores());
          const lista = (Array.isArray(prestadoresTodos) ? prestadoresTodos : []);
          const match = lista.find(p => String(p?.cuilCuit || '').toLowerCase() === String(nuevoPrestador?.cuilCuit || '').toLowerCase());
          if (match && typeof match.id === 'number') centroId = match.id;
        }
        if (centroId) {
          // Profesionales actualmente asociados a este centro (en estado actual)
          const actualesIds = (Array.isArray(prestadoresTodos) ? prestadoresTodos : [])
            .filter(p => p?.integraCentroMedicoId === centroId)
            .map(p => p.id);
          const seleccionados = new Set(nuevoPrestador.profesionalesAsociadosIds);
          const actuales = new Set(actualesIds);
          const toAdd = [...seleccionados].filter(id => !actuales.has(id));
          const toRemove = [...actuales].filter(id => !seleccionados.has(id));
          // Aplicar cambios
          await Promise.allSettled([
            ...toAdd.map(id => dispatch(editarPrestador({ id, integraCentroMedicoId: centroId })).unwrap()),
            ...toRemove.map(id => dispatch(editarPrestador({ id, integraCentroMedicoId: null })).unwrap()),
          ]);
          // Evitar actualizar el centro con profesionalesIds si el backend exige payload completo
          // La asociación se refleja vía integraCentroMedicoId en cada profesional
        }
      }

      // Si el create devolvió lista, recargamos.
      // Si devolvió objeto sin id (fallback), intentamos recargar para reflejar desde backend.
      if (Array.isArray(creado) || (creado && typeof creado === 'object' && creado.id == null)) {
        dispatch(cargarPrestadores());
      }
      setDialogoAgregar(false);
      setSnackbar({
        open: true,
        message: 'Prestador creado exitosamente',
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: typeof error === 'string' ? error : (error?.message || 'Error al crear el prestador'),
        severity: 'error'
      });
    }
  };

  const handleGuardarEdicion = async (prestadorEditado) => {
    try {
      // Incluir direcciones en el PUT de edición
      const actualizado = await dispatch(actualizarDireccionesPrestador(prestadorEditado)).unwrap();

      // Si es Centro Médico y vienen asociaciones, sincronizarlas
      if (prestadorEditado?.tipo === 'Centro Médico' && Array.isArray(prestadorEditado?.profesionalesAsociadosIds)) {
        const centroId = actualizado?.id || prestadorEditado?.id;
        if (centroId) {
          const actualesIds = (Array.isArray(prestadoresTodos) ? prestadoresTodos : [])
            .filter(p => p?.integraCentroMedicoId === centroId)
            .map(p => p.id);
          const seleccionados = new Set(prestadorEditado.profesionalesAsociadosIds);
          const actuales = new Set(actualesIds);
          const toAdd = [...seleccionados].filter(id => !actuales.has(id));
          const toRemove = [...actuales].filter(id => !seleccionados.has(id));
          await Promise.allSettled([
            ...toAdd.map(id => dispatch(editarPrestador({ id, integraCentroMedicoId: centroId })).unwrap()),
            ...toRemove.map(id => dispatch(editarPrestador({ id, integraCentroMedicoId: null })).unwrap()),
          ]);
        }
      }
      // Refrescar cache local inmediatamente
      setPrestadoresConAgenda((prev) => {
        if (!actualizado || !actualizado.id) return prev;
        // Usar las direcciones actualizadas; los horarios se completan abajo con un refresh puntual
        return { ...prev, [actualizado.id]: { ...actualizado, lugaresAtencion: actualizado.lugaresAtencion || [] } };
      });
      // Refrescar agendas del profesional editado para no depender de un F5
      if (actualizado && actualizado.id && actualizado.tipo !== 'Centro Médico') {
        try {
          const ags = await agendasService.getByProfesional(actualizado.id);
          const listaAgendas = Array.isArray(ags) ? ags : [];
          const canonDir = (s) => {
            return String(s || '')
              .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
              .replace(/\s+/g, ' ')
              .replace(/\b(s\/?n|s\/?d)\b/gi, '')
              .replace(/[,.;\-–—]+$/g, '')
              .trim()
              .toLowerCase();
          };
          const byId = new Map(
            listaAgendas
              .filter(l => typeof l?.id === 'number')
              .map(l => [l.id, l])
          );
          const byDir = new Map(
            listaAgendas.map(l => [canonDir(l.direccion), l])
          );
          const baseDirecciones = Array.isArray(actualizado.lugaresAtencion) ? actualizado.lugaresAtencion : [];
          const lugaresConHorarios = baseDirecciones.map((l) => {
            const lid = (typeof l?.id === 'number') ? l.id : null;
            const match =
              (lid != null ? byId.get(lid) : null) ||
              byDir.get(canonDir(l?.direccion));
            if (match) {
              const horarios = Array.isArray(match.horarios)
                ? match.horarios
                : (Array.isArray(match.horariosAtencion) ? match.horariosAtencion : []);
              return { ...l, horarios };
            }
            return l;
          });
          setPrestadoresConAgenda((prev) => ({
            ...prev,
            [actualizado.id]: { ...actualizado, lugaresAtencion: lugaresConHorarios }
          }));
        } catch (_) {
          // si falla el refresh puntual, el efecto general de agendas se encargará luego
        }
      }
      // Resaltar y hacer scroll al editado
      if (actualizado && actualizado.id) {
        setHighlightId(actualizado.id);
        const node = itemRefs.current.get(actualizado.id);
        if (node && node.scrollIntoView) {
          node.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        setTimeout(() => setHighlightId(null), 2500);
      }
      setDialogoEditar(false);
      setPrestadorSeleccionado(null);
      setSnackbar({
        open: true,
        message: 'Prestador actualizado exitosamente',
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: typeof error === 'string' ? error : (error?.message || 'Error al actualizar el prestador'),
        severity: 'error'
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <>
      {/* Header de la página */}
      <PageHeader title="Prestadores" subtitle="Gestión de prestadores médicos y centros de salud" />

      {/* Buscador unificado */}
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Buscar por nombre, CUIT/CUIL, especialidad, código postal, tipo o día de atención (ej: Lunes)..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon color="action" />
            </InputAdornment>
          ),
        }}
        sx={{
          mb: { xs: 2, sm: 4 },
          '& .MuiOutlinedInput-root': {
            borderRadius: 2,
            fontSize: { xs: '0.95rem', sm: '1rem' },
            py: { xs: 0.5, sm: 1 }
          }
        }}
      />

      {/* Lista de prestadores */}
      <Box sx={{ mb: 4, display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {typeof error === 'string' ? error : (error?.message || String(error))}
          </Alert>
        ) : prestadoresFiltrados.length > 0 ? (
          prestadoresFiltrados.map((prestador) => {
            const pMerge = prestadoresConAgenda[prestador.id] || prestador;
            return (
            <div key={pMerge.id} ref={setItemRef(pMerge.id)}>
              <TarjetaPrestadorSimple
                prestador={pMerge}
                emphasis={highlightId === pMerge.id}
                isRefreshing={!!refreshingHorarios[pMerge.id]}
                onVer={handleVer}
                onEditar={handleEditar}
                onToggleActivo={handleToggleActivo}
                onGestionarHorarios={(p, lugarIndex) => {
                  setPrestadorSeleccionado(p);
                  setHorariosContext({ lugarIndex, horarioIndex: null });
                  setDialogoHorarios(true);
                }}
              />
            </div>
            );
          })
        ) : (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <PersonIcon sx={{ fontSize: 64, color: '#ccc', mb: 2 }} />
            <Typography variant="h6" color="textSecondary">
              No se encontraron prestadores
            </Typography>
          </Box>
        )}
      </Box>

      {/* Botón flotante para agregar */}
      <Fab
        color="primary"
        aria-label="add"
        onClick={handleAgregar}
        sx={{
          position: 'fixed',
          bottom: { xs: 16, sm: 24 },
          right: { xs: 16, sm: 24 },
          width: { xs: 48, sm: 56 },
          height: { xs: 48, sm: 56 }
        }}
      >
        <AddIcon />
      </Fab>

      {/* Diálogo Agregar Prestador */}
      <DialogPrestador
        abierto={dialogoAgregar}
        valorInicial={null}
        onCerrar={() => setDialogoAgregar(false)}
        onGuardar={handleGuardarNuevo}
        soloDirecciones={true}
      />

      {/* Diálogo Editar Prestador */}
      <DialogPrestador
        abierto={dialogoEditar}
        valorInicial={prestadorSeleccionado}
        onCerrar={() => {
          setDialogoEditar(false);
          setPrestadorSeleccionado(null);
        }}
        onGuardar={handleGuardarEdicion}
        soloDirecciones={true}
      />

      {/* Diálogo Ver Detalles */}
      <DialogVerPrestador
        abierto={dialogoVer}
        prestador={prestadorSeleccionado}
        onCerrar={() => {
          setDialogoVer(false);
          setPrestadorSeleccionado(null);
        }}
      />

      {/* Diálogo Ver Agendas de Centro */}
      {dialogoVerCentro && prestadorSeleccionado && (
        <DialogVerCentroAgendas
          abierto={dialogoVerCentro}
          centro={prestadorSeleccionado}
          onCerrar={() => {
            setDialogoVerCentro(false);
            setPrestadorSeleccionado(null);
          }}
          onVerProfesional={(profId) => {
            const lista = Array.isArray(prestadoresTodos) ? prestadoresTodos : [];
            const prof = lista.find(p => p.id === profId);
            if (!prof) return;
            // Cerrar vista de centro y abrir diálogo de detalles de ese profesional
            setDialogoVerCentro(false);
            setPrestadorSeleccionado(prof);
            setDialogoVer(true);
          }}
        />
      )}

      {/* Gestión de horarios por dirección (CRUD de disponibilidad + duración) */}
      {dialogoHorarios && prestadorSeleccionado && (
        <DialogHorariosPrestador
          abierto={dialogoHorarios}
          prestador={prestadorSeleccionado}
          initialLugarIndex={horariosContext.lugarIndex}
          initialHorarioIndex={horariosContext.horarioIndex}
          lockLugar={!(prestadorSeleccionado?.tipo === 'Centro Médico' || prestadorSeleccionado?.rol === 0)}
          onCerrar={() => {
            setDialogoHorarios(false);
            setPrestadorSeleccionado(null);
            setHorariosContext({ lugarIndex: 0, horarioIndex: null });
          }}
          onGuardar={async (prestadorActualizado) => {
            try {
              if (prestadorActualizado && prestadorActualizado.isCentro) {
                const centroId = prestadorActualizado.id || prestadorSeleccionado?.id;
                if (!centroId) throw new Error('ID de centro no disponible');
                // Dos caminos: múltiples updates por profesional o una estructura completa
                if (prestadorActualizado.actualizacionesPorProfesional) {
                  const entries = Object.entries(prestadorActualizado.actualizacionesPorProfesional);
                  if (entries.length === 0) throw new Error('Debe asignar al menos un horario a un profesional');
                  // Unificar por lugar del CENTRO y adjuntar profesionalId en cada tramo
                  const canonDir = (s) => String(s || '')
                    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
                    .replace(/\s+/g, ' ')
                    .replace(/\b(s\/?n|s\/?d)\b/gi, '')
                    .replace(/[,.;\\-–—]+$/g, '')
                    .trim()
                    .toLowerCase();
                  const keyLugar = (l) => (l && l.id != null) ? `id:${l.id}` : `dir:${canonDir(l?.direccion)}`;
                  const mapLugaresCentro = new Map();
                  entries.forEach(([pid, lugares]) => {
                    const profId = Number(pid);
                    (Array.isArray(lugares) ? lugares : []).forEach((l) => {
                      const key = keyLugar(l);
                      const existente = mapLugaresCentro.get(key) || { id: l?.id ?? null, direccion: l?.direccion || '', horarios: [] };
                      const hs = Array.isArray(l?.horarios) ? l.horarios : [];
                      hs.forEach((h) => {
                        existente.horarios.push({
                          id: h?.id ?? null,
                          dias: Array.isArray(h?.dias) ? h.dias : (Array.isArray(h?.diasDeLaSemana) ? h.diasDeLaSemana : []),
                          horaInicio: h?.horaInicio || h?.desde || '',
                          horaFin: h?.horaFin || h?.hasta || '',
                          duracionMinutos: (typeof h?.duracionMinutos === 'number') ? h.duracionMinutos : (typeof h?.duracionConsulta === 'number' ? h.duracionConsulta : 30),
                          especialidadId: (Array.isArray(h?.especialidades) && h.especialidades.length > 0) ? h.especialidades[0] : (h?.especialidadId ?? null),
                          profesionalId: profId
                        });
                      });
                      mapLugaresCentro.set(key, existente);
                    });
                  });
                  const lugaresCentro = Array.from(mapLugaresCentro.values());
                  await dispatch(actualizarHorariosPrestador({ id: centroId, lugaresAtencion: lugaresCentro, isCentro: true })).unwrap();
                  // Refresco en caliente la cache local de cada profesional afectado (opcional)
                  try {
                    const idsToRefresh = entries.map(([pid]) => Number(pid)).filter((x) => !isNaN(x));
                    const reqs = idsToRefresh.map((rid) =>
                      agendasService.getByProfesional(rid).then((ags) => ({ rid, ags: Array.isArray(ags) ? ags : [] })).catch(() => ({ rid, ags: [] }))
                    );
                    const arr = await Promise.all(reqs);
                    setPrestadoresConAgenda((prev) => {
                      const n = { ...prev };
                      arr.forEach(({ rid, ags }) => {
                        const canonDir = (s) => String(s || '')
                          .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
                          .replace(/\s+/g, ' ')
                          .replace(/\b(s\/?n|s\/?d)\b/gi, '')
                          .replace(/[,.;\-–—]+$/g, '')
                          .trim()
                          .toLowerCase();
                        const agendaById = new Map((ags || []).map((a) => [a.id, a]));
                        const agendaByDir = new Map((ags || []).map((a) => [canonDir(a.direccion), a]));
                        const base = n[rid] || {};
                        const lugaresBase = JSON.parse(JSON.stringify(base?.lugaresAtencion || []));
                        const lugaresMergeados = lugaresBase.map((l) => {
                          const a = (l.id != null ? agendaById.get(l.id) : null) || agendaByDir.get(canonDir(l.direccion));
                          if (a) {
                            return { ...l, horarios: a.horarios || a.horariosAtencion || [] };
                          }
                          return l;
                        });
                        const dedup = [];
                        const seen = new Set();
                        // Importante: solo lugares propios del profesional (no agregamos extras provenientes del centro)
                        lugaresMergeados.forEach((l) => {
                          const key = (l && l.id != null)
                            ? `id:${l.id}`
                            : `dir:${String(l?.direccion || '').trim().toLowerCase()}`;
                          if (key && !seen.has(key)) {
                            seen.add(key);
                            dedup.push(l);
                          }
                        });
                        n[rid] = { ...(base || {}), id: rid, lugaresAtencion: dedup };
                      });
                      return n;
                    });
                  } catch (_) {}
                } else {
                  const lugaresAtencion = prestadorActualizado.lugaresAtencion || [];
                  // Vincular profesionales referenciados
                  const usados = new Set();
                  (Array.isArray(lugaresAtencion) ? lugaresAtencion : []).forEach((l) => {
                    (Array.isArray(l?.horarios) ? l.horarios : []).forEach((h) => {
                      const pid = (typeof h?.profesionalId === 'number') ? h.profesionalId : (typeof h?.prestadorId === 'number' ? h.prestadorId : null);
                      if (typeof pid === 'number') usados.add(pid);
                    });
                  });
                  const todos = (Array.isArray(prestadoresTodos) ? prestadoresTodos : []);
                  const actualesIds = new Set(todos.filter(p => p?.integraCentroMedicoId === centroId).map(p => p.id));
                  const toLink = [...usados].filter(id => !actualesIds.has(id));
                  if (toLink.length > 0) {
                    await Promise.allSettled(toLink.map(id => dispatch(editarPrestador({ id, integraCentroMedicoId: centroId })).unwrap()));
                  }
                  await dispatch(actualizarHorariosPrestador({ id: centroId, lugaresAtencion, isCentro: true })).unwrap();
                  // Refresco en caliente profesionales usados
                  try {
                    const idsToRefresh = [...usados];
                    const reqs = idsToRefresh.map((rid) =>
                      agendasService.getByProfesional(rid).then((ags) => ({ rid, ags: Array.isArray(ags) ? ags : [] })).catch(() => ({ rid, ags: [] }))
                    );
                    const arr = await Promise.all(reqs);
                    setPrestadoresConAgenda((prev) => {
                      const n = { ...prev };
                      arr.forEach(({ rid, ags }) => {
                        const base = n[rid] || {};
                        n[rid] = { ...(base || {}), id: rid, lugaresAtencion: (Array.isArray(ags) ? ags : []).map(a => ({ id: a?.id ?? null, direccion: a?.direccion || '', horarios: a?.horarios || a?.horariosAtencion || [] })) };
                      });
                      return n;
                    });
                  } catch (_) {}
                }
                // Refrescar cache base y UI
                dispatch(cargarPrestadores());
              } else {
                // Preferir el ID del prestadorActualizado (modo profesional)
                const id = prestadorActualizado?.id || prestadorSeleccionado?.id;
                const lugaresAtencion = prestadorActualizado?.lugaresAtencion || [];
                if (!id) throw new Error('ID de prestador no disponible');
                // Pre-borrado de horarios que desaparecieron (maneja multi-día)
                try {
                  const originalLugares = Array.isArray(prestadorSeleccionado?.lugaresAtencion) ? prestadorSeleccionado.lugaresAtencion : [];
                  const normalizar = (s) => String(s || '').trim().toLowerCase();
                  const keyLugar = (l) => (l && l.id != null) ? `id:${l.id}` : `dir:${normalizar(l?.direccion)}`;
                  const mapOriginal = new Map();
                  originalLugares.forEach((l) => {
                    const key = keyLugar(l);
                    const lugarId = (l && l.id != null) ? l.id : null;
                    const ids = new Set((Array.isArray(l?.horarios) ? l.horarios : [])
                      .map((h) => h?.id)
                      .filter((x) => typeof x === 'number'));
                    mapOriginal.set(key, { lugarId, ids });
                  });
                  const mapActual = new Map();
                  (Array.isArray(lugaresAtencion) ? lugaresAtencion : []).forEach((l) => {
                    const key = keyLugar(l);
                    const lugarId = (l && l.id != null) ? l.id : null;
                    const ids = new Set((Array.isArray(l?.horarios) ? l.horarios : [])
                      .map((h) => h?.id)
                      .filter((x) => typeof x === 'number'));
                    mapActual.set(key, { lugarId, ids });
                  });
                  const deletions = [];
                  mapOriginal.forEach((orig, key) => {
                    const upd = mapActual.get(key);
                    const updIds = upd ? upd.ids : new Set();
                    orig.ids.forEach((hid) => {
                      if (!updIds.has(hid)) {
                        const lugarId = (typeof orig.lugarId === 'number') ? orig.lugarId : (upd && typeof upd.lugarId === 'number' ? upd.lugarId : null);
                        if (typeof lugarId === 'number') {
                          deletions.push({ lugarId, horarioId: hid });
                        }
                      }
                    });
                  });
                  if (deletions.length > 0) {
                    await Promise.allSettled(
                      deletions.map((d) => agendasService.deleteHorario(id, d.lugarId, d.horarioId))
                    );
                  }
                } catch (_) {
                  // si falla borrado granular, continuamos con PUT en bloque
                }
                await dispatch(actualizarHorariosPrestador({ id, lugaresAtencion })).unwrap();
              }
              // Refrescar cache local consultando agendas reales (para reflejar ids/direcciones definitivos)
              try {
                const refreshIds = (prestadorActualizado && prestadorActualizado.isCentro && prestadorActualizado.actualizacionesPorProfesional)
                  ? Object.keys(prestadorActualizado.actualizacionesPorProfesional).map(x => Number(x)).filter(x => !isNaN(x))
                  : [prestadorActualizado?.id || prestadorSeleccionado?.id].filter(Boolean);
                await Promise.all(refreshIds.map(async (rid) => {
                  setRefreshingHorarios((prev) => ({ ...prev, [rid]: true }));
                  const ags = await agendasService.getByProfesional(rid);
                    const canonDir = (s) => String(s || '')
                      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
                      .replace(/\s+/g, ' ')
                      .replace(/\b(s\/?n|s\/?d)\b/gi, '')
                      .replace(/[,.;\-–—]+$/g, '')
                      .trim()
                      .toLowerCase();
                    const agendaById = new Map((Array.isArray(ags) ? ags : []).map((a) => [a.id, a]));
                  const basePrev = prestadoresConAgenda[rid] || {};
                  const lugaresBase = JSON.parse(JSON.stringify(basePrev?.lugaresAtencion || []));
                  const matchedKeys = new Set();
                  const lugaresMergeados = lugaresBase.map((l) => {
                    const a = (l.id != null ? agendaById.get(l.id) : null);
                    if (a) {
                      const key = (a?.id != null) ? `id:${a.id}` : `dir:${String(a?.direccion || '').trim().toLowerCase()}`;
                      matchedKeys.add(key);
                      return { ...l, horarios: a.horarios || a.horariosAtencion || [] };
                    }
                    return l;
                  });
                  const dedup = [];
                  const seen = new Set();
                  // No agregamos extras: solo lugares propios del profesional
                  [...lugaresMergeados].forEach((l) => {
                    const key = (l && l.id != null)
                      ? `id:${l.id}`
                      : `dir:${String(l?.direccion || '').trim().toLowerCase()}`;
                    if (key && !seen.has(key)) {
                      seen.add(key);
                      dedup.push(l);
                    }
                  });
                  setPrestadoresConAgenda((prev) => {
                    const base = prev[rid] || {};
                    return { ...prev, [rid]: { ...base, id: rid, lugaresAtencion: dedup } };
                  });
                  setRefreshingHorarios((prev) => ({ ...prev, [rid]: false }));
                }));
              } catch (_) {
                // sin refresh
              }
              setDialogoHorarios(false);
              setPrestadorSeleccionado(null);
              setSnackbar({ open: true, message: 'Horarios actualizados', severity: 'success' });
            } catch (error) {
              setSnackbar({ open: true, message: (typeof error === 'string' ? error : (error?.message || 'No se pudieron actualizar los horarios')), severity: 'error' });
            }
          }}
        />
      )}


      {/* Crear/editar agenda se realiza desde la pantalla de agendas, no desde Prestadores */}

      {/* Snackbar para notificaciones */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}

export default Prestadores;