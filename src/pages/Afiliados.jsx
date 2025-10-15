// components/pages/Afiliados.jsx
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Box, Typography, Fab, Snackbar, Alert } from "@mui/material";
import { Add as AddIcon, Person as PersonIcon } from "@mui/icons-material";
import {
  setBajaAfiliado,
  cancelBajaAfiliado,
  programarAltaAfiliado,
  cancelarAltaProgramada,
  createAfiliadoCompleto,
  updateAfiliadoCompleto,
  reactivarAfiliado,
  fetchAfiliados,
} from "../store/afiliadosSlice";
import {
  addPersona,
  updatePersona,
  deletePersona,
} from "../store/personasSlice";
import AdvancedSearchBar from "../components/Afiliados/AdvancedSearchBar";
import AfiliadoCard from "../components/Afiliados/AfiliadosCard";
import AfiliadoFormDialog from "../components/Afiliados/AfiliadoFormDialog";
import PersonaFormDialog from "../components/Afiliados/PersonaFormDialog";
import BajaDialog from "../components/Afiliados/BajaDialog";
import AltaDialog from "../components/Afiliados/AltaDialog";
import { selectSituaciones } from "../store/situacionesTerapeuticasSlice";
import { selectPlanes } from "../store/planesSlice";

const startOfDay = (d) => {
  const dt = new Date(d);
  dt.setHours(0, 0, 0, 0);
  return dt;
};
const hoyISO = () => new Date().toISOString().split("T")[0];

const estaActivo = (alta, baja) => {
  const hoy = startOfDay(new Date());
  if (baja) {
    const fechaBaja = startOfDay(new Date(baja));
    if (fechaBaja <= hoy) return false;
  }
  if (alta) {
    const fechaAlta = startOfDay(new Date(alta));
    if (fechaAlta > hoy) return false;
  }
  return true;
};

const tieneBajaProgramada = (baja) => {
  if (!baja) return false;
  return startOfDay(new Date(baja)) > startOfDay(new Date());
};

const tieneAltaProgramada = (alta) => {
  if (!alta) return false;
  return startOfDay(new Date(alta)) > startOfDay(new Date());
};

// MEJORADA: admite titularId o titularID y defensa si no hay afiliado
const getTitularDelAfiliado = (afiliado, personas) => {
  if (!afiliado) return null;
  const titularId =
    afiliado.titularId ?? afiliado.titularID ?? afiliado.titular;
  if (!titularId) return null;
  return personas.find((p) => p.id === titularId);
};

// MEJORADA: admite ambas variantes del campo titular y defensa
const getFamiliaresDelAfiliado = (afiliado, personas) => {
  if (!afiliado) return [];
  const titularId =
    afiliado.titularId ?? afiliado.titularID ?? afiliado.titular;
  return personas.filter(
    (p) => p.afiliadoId === afiliado.id && p.id !== titularId
  );
};

const getPlanMedicoNombre = (planMedicoId, planesMedicos) => {
  const plan = (planesMedicos || []).find(
    (p) => String(p.id) === String(planMedicoId)
  );
  return plan ? plan.nombre : "Desconocido";
};

export default function Afiliados() {
  const dispatch = useDispatch();
  const afiliados = useSelector((state) => state.afiliados.afiliados);
  const planesMedicos = useSelector(selectPlanes) || [];
  const personas = useSelector((state) => state.personas.personas);
  const parentescos = useSelector((state) => state.personas.parentescos);
  const situacionesCatalogo = useSelector(selectSituaciones);

  const [filteredAfiliados, setFilteredAfiliados] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedAfiliado, setSelectedAfiliado] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [openFamiliarDialog, setOpenFamiliarDialog] = useState(false);
  const [selectedFamiliar, setSelectedFamiliar] = useState(null);
  const [isEditingFamiliar, setIsEditingFamiliar] = useState(false);
  const [openBajaDialog, setOpenBajaDialog] = useState(false);
  const [openAltaDialog, setOpenAltaDialog] = useState(false);
  const [afiliadoParaBaja, setAfiliadoParaBaja] = useState(null);
  const [afiliadoParaAlta, setAfiliadoParaAlta] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Form states
  const [formAfiliado, setFormAfiliado] = useState({
    nombre: "",
    apellido: "",
    tipoDocumento: "DNI",
    numeroDocumento: "",
    fechaNacimiento: "",
    planMedicoId: "1",
    alta: hoyISO(),
  });

  const [formFamiliar, setFormFamiliar] = useState({
    nombre: "",
    apellido: "",
    tipoDocumento: "DNI",
    numeroDocumento: "",
    fechaNacimiento: "",
    parentesco: 2,
    alta: hoyISO(),
  });

  const [editTelefonos, setEditTelefonos] = useState([]);
  const [editEmails, setEditEmails] = useState([]);
  const [editDirecciones, setEditDirecciones] = useState([]);
  const [editSituaciones, setEditSituaciones] = useState([]);

  useEffect(() => setFilteredAfiliados(afiliados), [afiliados]);

  useEffect(() => {
    dispatch(fetchAfiliados());
  }, [dispatch]);

  const showSnackbar = (message, severity = "success") =>
    setSnackbar({ open: true, message, severity });

  // Afiliado handlers
  const handleAddAfiliado = () => {
    setSelectedAfiliado(null);
    setIsEditing(false);
    setFormAfiliado({
      nombre: "",
      apellido: "",
      tipoDocumento: "DNI",
      numeroDocumento: "",
      fechaNacimiento: "",
      planMedicoId: "1",
      alta: hoyISO(),
    });
    setEditTelefonos([]);
    setEditEmails([]);
    setEditDirecciones([]);
    setEditSituaciones([]);
    setOpenDialog(true);
  };

  const handleEditAfiliado = (afiliado) => {
    if (!afiliado) {
      console.error("No se proporcionó un afiliado para editar");
      return;
    }

    const titular = getTitularDelAfiliado(afiliado, personas);
    if (!titular) {
      console.error("No se encontró el titular del afiliado");
      return;
    }

    setSelectedAfiliado(afiliado);
    setIsEditing(true);
    setFormAfiliado({
      nombre: titular.nombre,
      apellido: titular.apellido,
      tipoDocumento: titular.tipoDocumento,
      numeroDocumento: titular.numeroDocumento,
      fechaNacimiento: titular.fechaNacimiento,
      planMedicoId: afiliado.planMedicoId,
      alta: afiliado.alta,
    });
    setEditTelefonos([...(titular.telefonos || [])]);
    setEditEmails([...(titular.emails || [])]);
    setEditDirecciones([...(titular.direcciones || [])]);
    setEditSituaciones([...(titular.situacionesTerapeuticas || [])]);
    setOpenDialog(true);
  };

  const handleViewAfiliado = (afiliado) => {
    setSelectedAfiliado(afiliado);
    setIsEditing(false);
    const titular = getTitularDelAfiliado(afiliado, personas);
    setEditSituaciones([...(titular?.situacionesTerapeuticas || [])]);
    setOpenDialog(true);
  };

  const handleSaveAfiliado = async () => {
    if (
      !formAfiliado.nombre ||
      !formAfiliado.apellido ||
      !formAfiliado.tipoDocumento ||
      !formAfiliado.numeroDocumento ||
      !formAfiliado.fechaNacimiento
    ) {
      showSnackbar("Complete todos los campos requeridos", "error");
      return;
    }

    try {
      if (selectedAfiliado && isEditing) {
        // usar thunk para actualizar afiliado completo
        await dispatch(
          updateAfiliadoCompleto({
            selectedAfiliado,
            formAfiliado,
            editTelefonos,
            editEmails,
            editDirecciones,
            editSituaciones,
          })
        ).unwrap();
        showSnackbar("Afiliado actualizado");
      } else {
        // usar thunk para crear afiliado completo
        await dispatch(
          createAfiliadoCompleto({
            formAfiliado,
            editTelefonos,
            editEmails,
            editDirecciones,
            editSituaciones,
          })
        ).unwrap();
        showSnackbar("Afiliado creado");
      }
    } catch (error) {
      console.error("Error guardando afiliado:", error);
      showSnackbar(String(error) || "Error al guardar afiliado", "error");
    } finally {
      setOpenDialog(false);
      setSelectedAfiliado(null);
    }
  };

  // Altas programadas / reactivación
  const handleProgramarAltaAfiliado = (afiliado, fechaAlta) => {
    dispatch(programarAltaAfiliado({ afiliadoId: afiliado.id, fechaAlta }));
    const titular = getTitularDelAfiliado(afiliado, personas);
    if (titular) dispatch(updatePersona({ ...titular, alta: fechaAlta }));
    showSnackbar("Alta programada correctamente");
  };

  const handleCancelarAltaProgramada = (afiliado) => {
    const hoy = hoyISO();
    dispatch(
      cancelarAltaProgramada({
        afiliadoId: afiliado.id,
        fechaAltaInmediata: hoy,
      })
    );
    const titular = getTitularDelAfiliado(afiliado, personas);
    if (titular) dispatch(updatePersona({ ...titular, alta: hoy }));
    showSnackbar("Alta programada cancelada");
  };

  const handleReactivarInmediatamente = (afiliado) => {
    dispatch(reactivarAfiliado({ afiliadoId: afiliado.id }));
    const titular = getTitularDelAfiliado(afiliado, personas);
    if (titular) dispatch(updatePersona({ ...titular, alta: hoyISO() }));
    showSnackbar("Afiliado reactivado inmediatamente");
  };

  const handleOpenAltaDialog = (afiliado) => {
    setAfiliadoParaAlta(afiliado);
    setOpenAltaDialog(true);
  };

  // Familiares
  const handleAddFamiliar = (afiliado) => {
    setSelectedAfiliado(afiliado);
    setSelectedFamiliar(null);
    setIsEditingFamiliar(false);
    setFormFamiliar({
      nombre: "",
      apellido: "",
      tipoDocumento: "DNI",
      numeroDocumento: "",
      fechaNacimiento: "",
      parentesco: 2,
      alta: hoyISO(),
    });
    setEditTelefonos([]);
    setEditEmails([]);
    setEditDirecciones([]);
    setEditSituaciones([]);
    setOpenFamiliarDialog(true);
  };

  const handleEditFamiliar = (familiar, afiliado) => {
    setSelectedAfiliado(afiliado);
    setSelectedFamiliar(familiar);
    setIsEditingFamiliar(true);
    setFormFamiliar({
      nombre: familiar.nombre,
      apellido: familiar.apellido,
      fechaNacimiento: familiar.fechaNacimiento,
      tipoDocumento: familiar.tipoDocumento,
      numeroDocumento: familiar.numeroDocumento,
      parentesco: familiar.parentesco,
      alta: familiar.alta,
    });
    setEditTelefonos([...(familiar.telefonos || [])]);
    setEditEmails([...(familiar.emails || [])]);
    setEditDirecciones([...(familiar.direcciones || [])]);
    setEditSituaciones([...(familiar.situacionesTerapeuticas || [])]);
    setOpenFamiliarDialog(true);
  };

  const handleViewFamiliar = (familiar, afiliado) => {
    setSelectedAfiliado(afiliado);
    setSelectedFamiliar(familiar);
    setIsEditingFamiliar(false);
    setEditSituaciones([...(familiar.situacionesTerapeuticas || [])]);
    setOpenFamiliarDialog(true);
  };

  const handleSaveFamiliar = () => {
    if (
      !selectedAfiliado ||
      !formFamiliar.nombre ||
      !formFamiliar.apellido ||
      !formFamiliar.tipoDocumento ||
      !formFamiliar.numeroDocumento ||
      !formFamiliar.fechaNacimiento
    ) {
      showSnackbar("Complete todos los campos requeridos", "error");
      return;
    }

    if (selectedFamiliar && isEditingFamiliar) {
      dispatch(
        updatePersona({
          ...selectedFamiliar,
          nombre: formFamiliar.nombre,
          apellido: formFamiliar.apellido,
          fechaNacimiento: formFamiliar.fechaNacimiento,
          tipoDocumento: formFamiliar.tipoDocumento,
          numeroDocumento: formFamiliar.numeroDocumento,
          parentesco: formFamiliar.parentesco,
          telefonos: editTelefonos,
          emails: editEmails,
          direcciones: editDirecciones,
          situacionesTerapeuticas: editSituaciones,
        })
      );
      showSnackbar("Familiar actualizado");
    } else {
      const familiaresDelGrupo = getFamiliaresDelAfiliado(
        selectedAfiliado,
        personas
      );
      const maxIntegrante = Math.max(
        ...familiaresDelGrupo.map((f) => Number(f.numeroIntegrante) || 1),
        1
      );
      dispatch(
        addPersona({
          id: `f${Date.now()}`,
          numeroIntegrante: maxIntegrante + 1,
          nombre: formFamiliar.nombre,
          apellido: formFamiliar.apellido,
          tipoDocumento: formFamiliar.tipoDocumento,
          numeroDocumento: formFamiliar.numeroDocumento,
          fechaNacimiento: formFamiliar.fechaNacimiento,
          parentesco: formFamiliar.parentesco,
          afiliadoId: selectedAfiliado.id,
          alta: formFamiliar.alta,
          baja: null,
          telefonos: editTelefonos,
          emails: editEmails,
          direcciones: editDirecciones,
          situacionesTerapeuticas: editSituaciones,
        })
      );
      showSnackbar("Familiar agregado");
    }

    setOpenFamiliarDialog(false);
    setSelectedFamiliar(null);
  };

  const handleDeleteFamiliar = (familiar) => {
    if (
      window.confirm(`¿Eliminar a ${familiar.nombre} ${familiar.apellido}?`)
    ) {
      dispatch(deletePersona(familiar.id));
      showSnackbar("Familiar eliminado");
    }
  };

  // Bajas
  const handleOpenBajaDialog = (afiliado) => {
    setAfiliadoParaBaja(afiliado);
    setOpenBajaDialog(true);
  };

  const handleSetBajaAfiliado = (afiliado, fechaBaja) => {
    dispatch(setBajaAfiliado({ afiliadoId: afiliado.id, fechaBaja }));
    const titular = getTitularDelAfiliado(afiliado, personas);
    if (titular) dispatch(updatePersona({ ...titular, baja: fechaBaja }));
    showSnackbar("Baja programada");
  };

  const handleCancelBajaAfiliado = (afiliado) => {
    dispatch(cancelBajaAfiliado(afiliado.id));
    const titular = getTitularDelAfiliado(afiliado, personas);
    if (titular) dispatch(updatePersona({ ...titular, baja: null }));
    showSnackbar("Baja cancelada");
  };

  // Style helpers
  const getParentescoColor = (parentescoId) =>
    ({ 1: "#1976d2", 2: "#2e7d32", 3: "#f57c00", 4: "#757575" }[parentescoId] ||
    "#757575");
  const getPlanColor = (planMedicoId) =>
    ({ 1: "#cd7f32", 2: "#c0c0c0", 3: "#ffd700", 4: "#e5e4e2" }[planMedicoId] ||
    "#757575");

  return (
    <Box>
      <Typography
        variant="h4"
        gutterBottom
        sx={{ fontWeight: "bold", color: "#1976d2" }}
      >
        Afiliados
      </Typography>

      <AdvancedSearchBar
        afiliados={afiliados}
        personas={personas}
        planesMedicos={planesMedicos}
        onFilteredAfiliadosChange={setFilteredAfiliados}
        estaActivo={estaActivo}
        tieneBajaProgramada={tieneBajaProgramada}
        tieneAltaProgramada={tieneAltaProgramada}
      />

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {filteredAfiliados.map((afiliado) => {
          const titular = getTitularDelAfiliado(afiliado, personas);
          const familiares = getFamiliaresDelAfiliado(afiliado, personas);
          if (!titular) return null;
          return (
            <AfiliadoCard
              key={afiliado.id}
              afiliado={afiliado}
              titular={titular}
              familiares={familiares}
              planMedico={getPlanMedicoNombre(
                afiliado.planMedicoId,
                planesMedicos
              )}
              estaActivo={estaActivo(afiliado.alta, afiliado.baja)}
              tieneBajaProgramada={tieneBajaProgramada(afiliado.baja)}
              tieneAltaProgramada={tieneAltaProgramada(afiliado.alta)}
              onView={handleViewAfiliado}
              onEdit={handleEditAfiliado}
              onSetBaja={handleOpenBajaDialog}
              onSetAlta={handleOpenAltaDialog}
              onAddFamiliar={handleAddFamiliar}
              onViewFamiliar={handleViewFamiliar}
              onEditFamiliar={handleEditFamiliar}
              onDeleteFamiliar={handleDeleteFamiliar}
              getParentescoColor={getParentescoColor}
              getPlanColor={getPlanColor}
              parentescos={parentescos}
            />
          );
        })}
      </Box>

      {filteredAfiliados.length === 0 && (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <PersonIcon sx={{ fontSize: 64, color: "#ccc", mb: 2 }} />
          <Typography variant="h6" color="textSecondary">
            No se encontraron afiliados
          </Typography>
        </Box>
      )}

      <Fab
        color="primary"
        sx={{ position: "fixed", bottom: 16, right: 16 }}
        onClick={handleAddAfiliado}
      >
        <AddIcon />
      </Fab>

      <AfiliadoFormDialog
        open={openDialog}
        selectedAfiliado={selectedAfiliado}
        isEditing={isEditing}
        formData={formAfiliado}
        planesMedicos={planesMedicos}
        personas={personas}
        situacionesCatalogo={situacionesCatalogo}
        editTelefonos={editTelefonos}
        editEmails={editEmails}
        editDirecciones={editDirecciones}
        editSituaciones={editSituaciones}
        onEditTelefonosChange={setEditTelefonos}
        onEditEmailsChange={setEditEmails}
        onEditDireccionesChange={setEditDirecciones}
        onEditSituacionesChange={setEditSituaciones}
        onClose={() => setOpenDialog(false)}
        onSave={handleSaveAfiliado}
        onEdit={() => handleEditAfiliado(selectedAfiliado)}
        onFormChange={(field, value) =>
          setFormAfiliado((prev) => ({ ...prev, [field]: value }))
        }
      />

      <PersonaFormDialog
        open={openFamiliarDialog}
        selectedAfiliado={selectedAfiliado}
        selectedFamiliar={selectedFamiliar}
        isEditing={isEditingFamiliar}
        formData={formFamiliar}
        parentescos={parentescos}
        situacionesCatalogo={situacionesCatalogo}
        editTelefonos={editTelefonos}
        editEmails={editEmails}
        editDirecciones={editDirecciones}
        editSituaciones={editSituaciones}
        onEditTelefonosChange={setEditTelefonos}
        onEditEmailsChange={setEditEmails}
        onEditDireccionesChange={setEditDirecciones}
        onEditSituacionesChange={setEditSituaciones}
        onClose={() => setOpenFamiliarDialog(false)}
        onSave={handleSaveFamiliar}
        onFormChange={(field, value) =>
          setFormFamiliar((prev) => ({ ...prev, [field]: value }))
        }
      />

      <BajaDialog
        open={openBajaDialog}
        afiliado={afiliadoParaBaja}
        onClose={() => setOpenBajaDialog(false)}
        onConfirm={handleSetBajaAfiliado}
        onCancelBaja={handleCancelBajaAfiliado}
      />

      <AltaDialog
        open={openAltaDialog}
        afiliado={afiliadoParaAlta}
        onClose={() => setOpenAltaDialog(false)}
        onConfirm={handleProgramarAltaAfiliado}
        onCancelAlta={handleCancelarAltaProgramada}
        onReactivar={handleReactivarInmediatamente}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
