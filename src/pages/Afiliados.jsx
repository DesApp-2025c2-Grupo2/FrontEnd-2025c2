import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Box, Typography, Fab, Snackbar, Alert } from "@mui/material";
import { Add as AddIcon, Person as PersonIcon } from "@mui/icons-material";
import {
  setBajaAfiliado,
  cancelBajaAfiliado,
  addAfiliado,
  updatePlanMedicoAfiliado,
  programarAltaAfiliado,
  cancelarAltaProgramada,
  reactivarAfiliado,
  updateAltaAfiliado,
} from "../store/afiliadosSlice";
import {
  addPersona,
  updatePersona,
  deletePersona,
  updateAltaPersona,
} from "../store/personasSlice";
import AdvancedSearchBar from "../components/Afiliados/AdvancedSearchBar";
import AfiliadoCard from "../components/Afiliados/AfiliadosCard";
import AfiliadoFormDialog from "../components/Afiliados/AfiliadoFormDialog";
import PersonaFormDialog from "../components/Afiliados/PersonaFormDialog";
import BajaDialog from "../components/Afiliados/BajaDialog";
import AltaDialog from "../components/Afiliados/AltaDialog"; // Asegúrate de importar AltaDialog

// Funciones helper
const estaActivo = (alta, baja) => {
  const hoy = new Date().toLocaleDateString("es-AR", {
                timeZone: "UTC",
              });
  if (baja && new Date(baja) <= new Date(hoy)) return false;
  if (new Date(alta) > new Date(hoy)) return false;
  return true;
};

const tieneBajaProgramada = (baja) => {
  return baja && new Date(baja) > new Date().toLocaleDateString("es-AR", {
                timeZone: "UTC",
              });
};

const tieneAltaProgramada = (alta, baja) => {
  // Si tiene baja pero la alta es futura, es una alta programada que cancela la baja
  if (baja && new Date(alta) > new Date().toLocaleDateString("es-AR", {
                timeZone: "UTC",
              })) return true;
  // Si no tiene baja pero la alta es futura, también es alta programada
  if (!baja && new Date(alta) > new Date().toLocaleDateString("es-AR", {
                timeZone: "UTC",
              })) return true;
  return false;
};

const getTitularDelAfiliado = (afiliado, personas) => {
  return personas.find((p) => p.id === afiliado.titularId);
};

const getFamiliaresDelAfiliado = (afiliado, personas) => {
  return personas.filter(
    (p) => p.afiliadoId === afiliado.id && p.id !== afiliado.titularId
  );
};

const getPlanMedicoNombre = (planMedicoId, planesMedicos) => {
  const plan = planesMedicos.find((p) => p.id === planMedicoId);
  return plan ? plan.nombre : "Desconocido";
};

export default function Afiliados() {
  const dispatch = useDispatch();
  const afiliados = useSelector((state) => state.afiliados.afiliados);
  const planesMedicos = useSelector((state) => state.afiliados.planesMedicos);
  const personas = useSelector((state) => state.personas.personas);
  const parentescos = useSelector((state) => state.personas.parentescos);

  // Estados
  const [filteredAfiliados, setFilteredAfiliados] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedAfiliado, setSelectedAfiliado] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [openFamiliarDialog, setOpenFamiliarDialog] = useState(false);
  const [selectedFamiliar, setSelectedFamiliar] = useState(null);
  const [isEditingFamiliar, setIsEditingFamiliar] = useState(false);
  const [openBajaDialog, setOpenBajaDialog] = useState(false);
  const [openAltaDialog, setOpenAltaDialog] = useState(false); // Nuevo estado para AltaDialog
  const [afiliadoParaBaja, setAfiliadoParaBaja] = useState(null);
  const [afiliadoParaAlta, setAfiliadoParaAlta] = useState(null); // Nuevo estado para alta
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Estados para formularios
  const [formAfiliado, setFormAfiliado] = useState({
    nombre: "",
    apellido: "",
    tipoDocumento: "DNI",
    numeroDocumento: "",
    fechaNacimiento: "",
    planMedicoId: 1,
    alta: new Date().toLocaleDateString("es-AR", {
                timeZone: "UTC",
              }),
  });

  const [formFamiliar, setFormFamiliar] = useState({
    nombre: "",
    apellido: "",
    tipoDocumento: "DNI",
    numeroDocumento: "",
    fechaNacimiento: "",
    parentesco: 2,
    alta: new Date().toLocaleDateString("es-AR", {
                timeZone: "UTC",
              }),
  });

  const [editTelefonos, setEditTelefonos] = useState([]);
  const [editEmails, setEditEmails] = useState([]);
  const [editDirecciones, setEditDirecciones] = useState([]);

  useEffect(() => {
    setFilteredAfiliados(afiliados);
  }, [afiliados]);

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  // Handlers para Afiliados
  const handleAddAfiliado = () => {
    setSelectedAfiliado(null);
    setIsEditing(false);
    setFormAfiliado({
      nombre: "",
      apellido: "",
      tipoDocumento: "DNI",
      numeroDocumento: "",
      fechaNacimiento: "",
      planMedicoId: 1,
      alta: new Date().toLocaleDateString("es-AR", {
                timeZone: "UTC",
              }),
    });
    setEditTelefonos([]);
    setEditEmails([]);
    setEditDirecciones([]);
    setOpenDialog(true);
  };

  const handleEditAfiliado = (afiliado) => {
    const titular = getTitularDelAfiliado(afiliado, personas);
    if (!titular) return;

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
    setEditTelefonos([...titular.telefonos]);
    setEditEmails([...titular.emails]);
    setEditDirecciones([...titular.direcciones]);
    setOpenDialog(true);
  };

  const handleViewAfiliado = (afiliado) => {
    setSelectedAfiliado(afiliado);
    setIsEditing(false);
    setOpenDialog(true);
  };

  const handleSaveAfiliado = () => {
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

    if (selectedAfiliado && isEditing) {
      // Actualizar existente
      dispatch(
        updatePlanMedicoAfiliado({
          afiliadoId: selectedAfiliado.id,
          planMedicoId: formAfiliado.planMedicoId,
        })
      );

      if (formAfiliado.alta !== selectedAfiliado.alta) {
        dispatch(
          updateAltaAfiliado({
            afiliadoId: selectedAfiliado.id,
            fechaAlta: formAfiliado.alta,
          })
        );
      }

      const titular = getTitularDelAfiliado(selectedAfiliado, personas);
      if (titular) {
        dispatch(
          updatePersona({
            ...titular,
            nombre: formAfiliado.nombre,
            apellido: formAfiliado.apellido,
            fechaNacimiento: formAfiliado.fechaNacimiento,
            telefonos: editTelefonos,
            emails: editEmails,
            direcciones: editDirecciones,
          })
        );
      }
      showSnackbar("Afiliado actualizado");
    } else {
      // Crear nuevo
      const maxNumeroAfiliado = Math.max(
        ...afiliados.map((a) => a.numeroAfiliado),
        0
      );
      const nuevaPersonaId = `p${Date.now()}`;
      const nuevoAfiliadoId = `a${Date.now()}`;

      // Crear persona
      dispatch(
        addPersona({
          id: nuevaPersonaId,
          numeroIntegrante: 1,
          nombre: formAfiliado.nombre,
          apellido: formAfiliado.apellido,
          tipoDocumento: formAfiliado.tipoDocumento,
          numeroDocumento: formAfiliado.numeroDocumento,
          fechaNacimiento: formAfiliado.fechaNacimiento,
          parentesco: 1,
          alta: formAfiliado.alta,
          baja: null,
          telefonos: editTelefonos,
          emails: editEmails,
          direcciones: editDirecciones,
          situacionesTerapeuticas: [],
          afiliadoId: nuevoAfiliadoId,
        })
      );

      // Crear afiliado
      dispatch(
        addAfiliado({
          id: nuevoAfiliadoId,
          numeroAfiliado: maxNumeroAfiliado + 1,
          titularId: nuevaPersonaId,
          planMedicoId: formAfiliado.planMedicoId,
          alta: formAfiliado.alta,
          baja: null,
        })
      );

      showSnackbar("Afiliado creado");
    }

    setOpenDialog(false);
    setSelectedAfiliado(null);
  };

  // NUEVOS HANDLERS PARA ALTAS PROGRAMADAS
  const handleProgramarAltaAfiliado = (afiliado, fechaAlta) => {
    dispatch(
      programarAltaAfiliado({
        afiliadoId: afiliado.id,
        fechaAlta,
      })
    );

    // También actualizar la fecha de alta del titular
    const titular = getTitularDelAfiliado(afiliado, personas);
    if (titular) {
      dispatch(
        updateAltaPersona({
          personaId: titular.id,
          fechaAlta: fechaAlta,
        })
      );
    }

    showSnackbar("Alta programada correctamente");
  };

  const handleCancelarAltaProgramada = (afiliado) => {
    const hoy = new Date().toLocaleDateString("es-AR", {
                timeZone: "UTC",
              });
    dispatch(
      cancelarAltaProgramada({
        afiliadoId: afiliado.id,
        fechaAltaInmediata: hoy,
      })
    );

    // También actualizar la fecha de alta del titular
    const titular = getTitularDelAfiliado(afiliado, personas);
    if (titular) {
      dispatch(
        updateAltaPersona({
          personaId: titular.id,
          fechaAlta: hoy,
        })
      );
    }

    showSnackbar("Alta programada cancelada");
  };

  const handleReactivarInmediatamente = (afiliado) => {
    dispatch(reactivarAfiliado({ afiliadoId: afiliado.id }));

    // También actualizar la fecha de alta del titular
    const titular = getTitularDelAfiliado(afiliado, personas);
    if (titular) {
      const hoy = new Date().toLocaleDateString("es-AR", {
                timeZone: "UTC",
              });
      dispatch(
        updateAltaPersona({
          personaId: titular.id,
          fechaAlta: hoy,
        })
      );
    }

    showSnackbar("Afiliado reactivado inmediatamente");
  };

  const handleOpenAltaDialog = (afiliado) => {
    setAfiliadoParaAlta(afiliado);
    setOpenAltaDialog(true);
  };

  // Handlers para Familiares
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
      alta: new Date().toLocaleDateString("es-AR", {
                timeZone: "UTC",
              }),
    });
    setEditTelefonos([]);
    setEditEmails([]);
    setEditDirecciones([]);
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
    setEditTelefonos([...familiar.telefonos]);
    setEditEmails([...familiar.emails]);
    setEditDirecciones([...familiar.direcciones]);
    setOpenFamiliarDialog(true);
  };

  const handleViewFamiliar = (familiar, afiliado) => {
    setSelectedAfiliado(afiliado);
    setSelectedFamiliar(familiar);
    setIsEditingFamiliar(false);
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
        })
      );
      showSnackbar("Familiar actualizado");
    } else {
      const familiaresDelGrupo = getFamiliaresDelAfiliado(
        selectedAfiliado,
        personas
      );
      const maxIntegrante = Math.max(
        ...familiaresDelGrupo.map((f) => f.numeroIntegrante),
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
          situacionesTerapeuticas: [],
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

  // Handlers para Bajas
  const handleOpenBajaDialog = (afiliado) => {
    setAfiliadoParaBaja(afiliado);
    setOpenBajaDialog(true);
  };

  const handleSetBajaAfiliado = (afiliado, fechaBaja) => {
    dispatch(setBajaAfiliado({ afiliadoId: afiliado.id, fechaBaja }));
    showSnackbar("Baja programada");
  };

  const handleCancelBajaAfiliado = (afiliado) => {
    dispatch(cancelBajaAfiliado(afiliado.id));
    showSnackbar("Baja cancelada");
  };

  // Funciones de estilo
  const getParentescoColor = (parentescoId) =>
    ({
      1: "#1976d2",
      2: "#2e7d32",
      3: "#f57c00",
      4: "#757575",
    }[parentescoId] || "#757575");

  const getPlanColor = (planMedicoId) =>
    ({
      1: "#cd7f32",
      2: "#c0c0c0",
      3: "#ffd700",
      4: "#e5e4e2",
    }[planMedicoId] || "#757575");

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
              tieneAltaProgramada={tieneAltaProgramada(
                afiliado.alta,
                afiliado.baja
              )}
              onView={handleViewAfiliado}
              onEdit={handleEditAfiliado}
              onSetBaja={handleOpenBajaDialog}
              onSetAlta={handleOpenAltaDialog} // Nueva prop para abrir AltaDialog
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
        editTelefonos={editTelefonos}
        editEmails={editEmails}
        editDirecciones={editDirecciones}
        onEditTelefonosChange={setEditTelefonos}
        onEditEmailsChange={setEditEmails}
        onEditDireccionesChange={setEditDirecciones}
        onClose={() => setOpenDialog(false)}
        onSave={handleSaveAfiliado}
        onFormChange={(field, value) => {
          setFormAfiliado((prev) => ({
            ...prev,
            [field]: value,
          }));
        }}
      />

      <PersonaFormDialog
        open={openFamiliarDialog}
        selectedAfiliado={selectedAfiliado}
        selectedFamiliar={selectedFamiliar}
        isEditing={isEditingFamiliar}
        formData={formFamiliar}
        parentescos={parentescos}
        editTelefonos={editTelefonos}
        editEmails={editEmails}
        editDirecciones={editDirecciones}
        onEditTelefonosChange={setEditTelefonos}
        onEditEmailsChange={setEditEmails}
        onEditDireccionesChange={setEditDirecciones}
        onClose={() => setOpenFamiliarDialog(false)}
        onSave={handleSaveFamiliar}
        onFormChange={(field, value) => {
          setFormFamiliar((prev) => ({
            ...prev,
            [field]: value,
          }));
        }}
      />

      <BajaDialog
        open={openBajaDialog}
        afiliado={afiliadoParaBaja}
        onClose={() => setOpenBajaDialog(false)}
        onConfirm={handleSetBajaAfiliado}
        onCancelBaja={handleCancelBajaAfiliado}
      />

      {/* NUEVO: Dialog para Altas Programadas */}
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
