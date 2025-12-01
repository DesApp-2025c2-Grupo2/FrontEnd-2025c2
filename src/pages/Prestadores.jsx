import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Box, Fab, Snackbar, Alert, Typography } from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";

import PageHeader from "../components/Ui/PageHeader";
import TarjetaPrestadorSimple from "../components/Prestadores/TarjetaPrestadorSimple";
import DialogPrestador from "../components/Prestadores/DialogPrestador";
import AgendaDialog from "../components/Prestadores/AgendaDialog";
import AdvancedSearchBarPrestadores from "../components/Prestadores/AdvancedSearchBarPrestadores";

// Slice
import {
  fetchPrestadores,
  createPrestador,
  updatePrestador,
  selectPrestadores,
  selectPrestadoresLoading,
  selectPrestadoresError,
  togglePrestadorStatus,
  updateAgendaPrestador,
} from "../store/prestadoresSlice";

import {
  cargarEspecialidades,
  selectEspecialidades,
} from "../store/especialidadesSlice";

export default function Prestadores() {
  const dispatch = useDispatch();

  // lista filtrada: null = sin filtros, array = resultado actual (incluye [])
  const [prestadoresFiltrados, setPrestadoresFiltrados] = useState(null);

  const prestadores = useSelector(selectPrestadores);
  const especialidades = useSelector(selectEspecialidades);
  const loading = useSelector(selectPrestadoresLoading);
  const error = useSelector(selectPrestadoresError);

  // Control del diálogo prestador
  const [dialogOpen, setDialogOpen] = useState(false);
  const [modoInicialVista, setModoInicialVista] = useState(true);
  const [selected, setSelected] = useState(null);

  // Diálogo de agenda
  const [agendaDialogOpen, setAgendaDialogOpen] = useState(false);
  const [prestadorAgenda, setPrestadorAgenda] = useState(null);

  // Snackbar
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Cargar prestadores
  useEffect(() => {
    dispatch(fetchPrestadores());
  }, [dispatch]);

  // Cargar especialidades
  useEffect(() => {
    dispatch(cargarEspecialidades());
  }, [dispatch]);

  // ------------------------- ACCIONES -----------------------------

  const handleGuardar = async (form) => {
    try {
      if (selected) {
        await dispatch(updatePrestador({ id: selected.id, ...form })).unwrap();
        await dispatch(fetchPrestadores());
        setSnackbar({
          open: true,
          message: "Prestador actualizado correctamente",
          severity: "success",
        });
      } else {
        await dispatch(createPrestador(form)).unwrap();
        await dispatch(fetchPrestadores());
        setSnackbar({
          open: true,
          message: "Prestador creado correctamente",
          severity: "success",
        });
      }
    } catch (err) {
      setSnackbar({
        open: true,
        message: err || "Error al guardar",
        severity: "error",
      });
    }

    setDialogOpen(false);
    setSelected(null);
    // Cuando cambio algo, resetear lista filtrada para que se recalcule
    setPrestadoresFiltrados(null);
  };

  const handleVer = (prestador) => {
    setSelected(prestador);
    setModoInicialVista(true);
    setDialogOpen(true);
  };

  const handleEditar = (prestador) => {
    setSelected(prestador);
    setModoInicialVista(false);
    setDialogOpen(true);
  };

  // Archivo: Prestadores.jsx

  const handleToggleStatus = async (id) => {
    try {
      // Primero optimista: actualizar el estado local inmediatamente
      const prestadorActual = prestadores.find((p) => p.id === id);
      if (prestadorActual) {
        // Encontrar el índice en la lista que se está mostrando
        const listaActual =
          prestadoresFiltrados !== null ? prestadoresFiltrados : prestadores;
        const indexEnLista = listaActual.findIndex((p) => p.id === id);

        // Si encontramos el prestador en la lista actual
        if (indexEnLista !== -1) {
          // Crear una nueva referencia del array para forzar re-render
          if (prestadoresFiltrados !== null) {
            const nuevosFiltrados = [...prestadoresFiltrados];
            nuevosFiltrados[indexEnLista] = {
              ...listaActual[indexEnLista],
              baja: listaActual[indexEnLista].baja
                ? null
                : new Date().toISOString().split("T")[0],
            };
            setPrestadoresFiltrados(nuevosFiltrados);
          }
        }
      }

      // Luego hacer la llamada real al backend
      await dispatch(togglePrestadorStatus(id)).unwrap();

      // Opcional: recargar los prestadores para asegurar consistencia
      // await dispatch(fetchPrestadores());

      setSnackbar({
        open: true,
        message: "Estado actualizado correctamente",
        severity: "success",
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: err || "Error al cambiar el estado",
        severity: "error",
      });

      // Si hay error, recargar para restaurar estado correcto
      dispatch(fetchPrestadores());
    }
  };

  const handleAbrirAgenda = (prestador) => {
    setPrestadorAgenda(prestador);
    setAgendaDialogOpen(true);
  };

  const handleGuardarAgenda = async (payloads) => {
    try {
      // Asegurar que sea un array
      if (!Array.isArray(payloads)) {
        console.error("Se esperaba una lista de agendas:", payloads);
        return;
      }

      for (const agenda of payloads) {
        // Validación mínima
        if (!agenda || !agenda.id || !Array.isArray(agenda.horariosAtencion)) {
          console.error("Agenda inválida:", agenda);
          continue;
        }

        await dispatch(
          updateAgendaPrestador({
            id: agenda.id,
            horariosAtencion: agenda.horariosAtencion,
          })
        ).unwrap();
        await dispatch(fetchPrestadores());
      }

      setAgendaDialogOpen(false);

      setSnackbar({
        open: true,
        message: "Agenda actualizada correctamente",
        severity: "success",
      });
    } catch (e) {
      console.error(e);
      setSnackbar({
        open: true,
        message: "Error al actualizar agenda",
        severity: "error",
      });
    }
  };

  const openNuevoPrestador = () => {
    setSelected(null);
    setModoInicialVista(false);
    setDialogOpen(true);
  };

  // Lista que se muestra: si hay valor desde la barra, usarlo; si no, usar todos
  const listaPrestadores =
    prestadoresFiltrados !== null ? prestadoresFiltrados : prestadores;

  // ------------------------- RENDER -----------------------------

  return (
    <>
      <PageHeader title="Prestadores" subtitle="Gestión de prestadores" />

      <AdvancedSearchBarPrestadores
        prestadores={prestadores}
        especialidades={especialidades}
        onFilteredPrestadoresChange={setPrestadoresFiltrados}
      />

      {loading && <Typography>Cargando...</Typography>}
      {error && <Typography color="error">{error}</Typography>}

      {/* LISTA */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {listaPrestadores.map((p) => (
          <TarjetaPrestadorSimple
            key={p.id}
            prestador={p}
            onVer={handleVer}
            onEditar={handleEditar}
            onToggleStatus={handleToggleStatus}
            onAbrirAgenda={handleAbrirAgenda}
          />
        ))}
      </Box>

      {/* BOTÓN FLOTANTE NUEVO */}
      <Fab
        color="primary"
        sx={{ position: "fixed", bottom: 24, right: 24 }}
        onClick={openNuevoPrestador}
      >
        <AddIcon />
      </Fab>

      {/* DIALOG PRESTADOR */}
      <DialogPrestador
        open={dialogOpen}
        prestador={selected}
        prestadores={prestadores}
        modoInicialVista={modoInicialVista}
        onClose={() => {
          setDialogOpen(false);
          setSelected(null);
        }}
        onSave={handleGuardar}
      />

      {/* DIALOG AGENDA */}
      {prestadorAgenda && (
        <AgendaDialog
          open={agendaDialogOpen}
          prestador={prestadorAgenda}
          prestadores={prestadores}
          onClose={() => setAgendaDialogOpen(false)}
          onSaveAgenda={handleGuardarAgenda}
        />
      )}

      {/* SNACKBAR */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={2500}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}
