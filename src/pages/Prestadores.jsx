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

function Prestadores() {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Estados locales
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogoAgregar, setDialogoAgregar] = useState(false);
  const [dialogoEditar, setDialogoEditar] = useState(false);
  const [dialogoVer, setDialogoVer] = useState(false);
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
          return;
        }
        // Si no hay cache, cargar agendas y mergear
        promises.push(
          agendasService.getByProfesional(p.id).then((agendas) => {
            if (cancelado) return;
            const listaAgendas = Array.isArray(agendas) ? agendas : [];
            const normalizar = (s) => String(s || '').trim().toLowerCase();
            const lugaresBase = Array.isArray(p.lugaresAtencion) ? JSON.parse(JSON.stringify(p.lugaresAtencion)) : [];
            const matchedKeys = new Set();
            const lugaresMergeados = lugaresBase.map((l) => {
              const lid = l?.id;
              const dirNorm = normalizar(l?.direccion);
              // Tomar todas las agendas que correspondan por id de lugar (lugarId/id) o por dirección normalizada
              const matches = listaAgendas.filter((a) => {
                const aLugarId = a?.lugarId ?? a?.lugarAtencionId ?? a?.id;
                const aDirNorm = normalizar(a?.direccion);
                const matchId = lid != null && (String(aLugarId) === String(lid));
                const matchDir = !!dirNorm && aDirNorm === dirNorm;
                return matchId || matchDir;
              });
              if (matches.length > 0) {
                const primera = matches[0];
                const horarios = matches.flatMap((m) => m.horarios || m.horariosAtencion || []);
                const nuevoId = lid != null ? lid : (primera?.lugarId ?? primera?.lugarAtencionId ?? primera?.id ?? null);
                const nuevaDir = l.direccion || primera?.direccion || '';
                // Marcar como matcheadas todas las agendas usadas
                matches.forEach((m) => {
                  const key = (m?.id != null) ? `id:${m.id}` : `dir:${normalizar(m?.direccion)}`;
                  matchedKeys.add(key);
                });
                return { ...l, id: nuevoId, direccion: nuevaDir, horarios };
              }
              return l;
            });
            // Agregar agendas que no matchearon ningún lugar base (union)
            const extras = listaAgendas.filter((a) => {
              const key = (a?.id != null) ? `id:${a.id}` : `dir:${normalizar(a?.direccion)}`;
              return !matchedKeys.has(key);
            }).map((a) => ({
              id: a?.id ?? null,
              direccion: a?.direccion || '',
              horarios: a?.horarios || a?.horariosAtencion || []
            }));
            const lugaresFinal = [...lugaresMergeados, ...extras];
            actuales[p.id] = { ...p, lugaresAtencion: lugaresFinal };
          }).catch(() => {})
        );
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
    setPrestadorSeleccionado(prestador);
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
      await dispatch(crearPrestador(nuevoPrestador)).unwrap();
      // Re-cargar lista desde backend para asegurar estado consistente
      dispatch(cargarPrestadores());
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
      // Refrescar cache local inmediatamente
      setPrestadoresConAgenda((prev) => {
        if (!actualizado || !actualizado.id) return prev;
        // Usar las direcciones actualizadas; si querés, luego se completarán horarios vía efecto de agendas
        return { ...prev, [actualizado.id]: { ...actualizado, lugaresAtencion: actualizado.lugaresAtencion || [] } };
      });
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
          mb: { xs: 3, sm: 4 },
          '& .MuiOutlinedInput-root': {
            borderRadius: 2,
            fontSize: { xs: '0.875rem', sm: '1rem' }
          }
        }}
      />

      {/* Lista de prestadores */}
      <Box sx={{ mb: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
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

      {/* Gestión de horarios por dirección (CRUD de disponibilidad + duración) */}
      {dialogoHorarios && prestadorSeleccionado && (
        <DialogHorariosPrestador
          abierto={dialogoHorarios}
          prestador={prestadorSeleccionado}
          initialLugarIndex={horariosContext.lugarIndex}
          initialHorarioIndex={horariosContext.horarioIndex}
          lockLugar={true}
          onCerrar={() => {
            setDialogoHorarios(false);
            setPrestadorSeleccionado(null);
            setHorariosContext({ lugarIndex: 0, horarioIndex: null });
          }}
          onGuardar={async (prestadorActualizado) => {
            try {
              const id = prestadorSeleccionado?.id || prestadorActualizado?.id;
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
              // Refrescar cache local consultando agendas reales (para reflejar ids/direcciones definitivos)
              try {
        setRefreshingHorarios((prev) => ({ ...prev, [id]: true }));
                const ags = await agendasService.getByProfesional(id);
                const agendaById = new Map((Array.isArray(ags) ? ags : []).map((a) => [a.id, a]));
                const agendaByDir = new Map((Array.isArray(ags) ? ags : []).map((a) => [String(a.direccion || '').trim().toLowerCase(), a]));
                const lugaresBase = JSON.parse(JSON.stringify(lugaresAtencion));
                const matchedKeys = new Set();
                const lugaresMergeados = lugaresBase.map((l) => {
                  const a = (l.id != null ? agendaById.get(l.id) : null) || agendaByDir.get(String(l.direccion || '').trim().toLowerCase());
                  if (a) {
                    const key = (a?.id != null) ? `id:${a.id}` : `dir:${String(a?.direccion || '').trim().toLowerCase()}`;
                    matchedKeys.add(key);
                    return { ...l, horarios: a.horarios || a.horariosAtencion || [] };
                  }
                  return l;
                });
                // Agregar agendas que no matchearon ningún lugar base
                const extras = (Array.isArray(ags) ? ags : []).filter((a) => {
                  const key = (a?.id != null) ? `id:${a.id}` : `dir:${String(a?.direccion || '').trim().toLowerCase()}`;
                  return !matchedKeys.has(key);
                }).map((a) => ({
                  id: a?.id ?? null,
                  direccion: a?.direccion || '',
                  horarios: a?.horarios || a?.horariosAtencion || []
                }));
                const lugaresFinal = [...lugaresMergeados, ...extras];
                setPrestadoresConAgenda((prev) => {
                  const base = prev[id] || prestadorSeleccionado || prestadorActualizado || {};
                  return { ...prev, [id]: { ...base, id, lugaresAtencion: lugaresFinal } };
                });
              } catch (_) {
                // fallback a actualizar con lo que tenemos
                setPrestadoresConAgenda((prev) => {
                  const base = prev[id] || prestadorSeleccionado || prestadorActualizado || {};
                  const actualizado = { ...base, id, lugaresAtencion: JSON.parse(JSON.stringify(lugaresAtencion)) };
                  return { ...prev, [id]: actualizado };
                });
      } finally {
        setRefreshingHorarios((prev) => ({ ...prev, [id]: false }));
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