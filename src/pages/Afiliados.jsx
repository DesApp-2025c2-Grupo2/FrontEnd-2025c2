import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Box, Typography, Fab, Snackbar, Alert } from "@mui/material";
import { Add as AddIcon, Person as PersonIcon } from "@mui/icons-material";
import {
  toggleAfiliadoActive,
  addAfiliado,
  updateAfiliado,
  addFamiliarToAfiliado,
  removeFamiliarFromAfiliado,
} from "../store/afiliadosSlice";
import {
  addFamiliar,
  updateFamiliar,
  deleteFamiliar,
  toggleFamiliarActive,
} from "../store/familiaresSlice";
import AdvancedSearchBar from "../components/Afiliados/AdvancedSearchBar";
import AfiliadoCard from "../components/Afiliados/AfiliadosCard";
import AfiliadoFormDialog from "../components/Afiliados/AfiliadoFormDialog";
import FamiliarFormDialog from "../components/Afiliados/FamiliarFormDialog";

export default function Afiliados() {
  const dispatch = useDispatch();
  const afiliados = useSelector((state) => state.afiliados.afiliados);
  const familiares = useSelector((state) => state.familiares.familiares);

  const [editTelefonos, setEditTelefonos] = useState([]);
  const [editEmails, setEditEmails] = useState([]);
  const [editDirecciones, setEditDirecciones] = useState([]);
  const [filteredAfiliados, setFilteredAfiliados] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedAfiliado, setSelectedAfiliado] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const [openFamiliarDialog, setOpenFamiliarDialog] = useState(false);
  const [selectedFamiliar, setSelectedFamiliar] = useState(null);
  const [isEditingFamiliar, setIsEditingFamiliar] = useState(false);

  const [formAfiliado, setFormAfiliado] = useState({
    nombre: "",
    apellido: "",
    tipoDocumento: "DNI",
    numeroDocumento: "",
    fechaNacimiento: "",
    fechaAlta: "",
    planMedico: "Plan Bronce",
  });

  const [formFamiliar, setFormFamiliar] = useState({
    nombre: "",
    apellido: "",
    tipoDocumento: "DNI",
    numeroDocumento: "",
    fechaNacimiento: "",
    fechaAlta: "",
    parentesco: "Cónyuge",
  });

  useEffect(() => {
    setFilteredAfiliados(afiliados);
  }, [afiliados]);

  const getTodayDate = () => new Date().toISOString().split("T")[0];

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleToggleActive = (afiliado) => {
    dispatch(toggleAfiliadoActive(afiliado.id));
    const action = afiliado.activo ? "desactivado" : "activado";
    showSnackbar(`Afiliado ${action} exitosamente`);
  };

  const handleAddAfiliado = () => {
    setSelectedAfiliado(null);
    setIsEditing(false);
    setFormAfiliado({
      nombre: "",
      apellido: "",
      tipoDocumento: "DNI",
      numeroDocumento: "",
      fechaNacimiento: "",
      fechaAlta: getTodayDate(),
      planMedico: "Plan Bronce",
    });
    setEditTelefonos([]);
    setEditEmails([]);
    setEditDirecciones([]);
    setOpenDialog(true);
  };

  const handleEditAfiliado = (afiliado) => {
    setSelectedAfiliado(afiliado);
    setIsEditing(true);
    setFormAfiliado({
      nombre: afiliado.nombre,
      apellido: afiliado.apellido,
      tipoDocumento: afiliado.tipoDocumento,
      numeroDocumento: afiliado.numeroDocumento,
      fechaNacimiento: afiliado.fechaNacimiento,
      fechaAlta: afiliado.fechaAlta,
      planMedico: afiliado.planMedico,
    });
    setEditTelefonos([...afiliado.telefonos]);
    setEditEmails([...afiliado.emails]);
    setEditDirecciones([...afiliado.direcciones]);
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
      !formAfiliado.numeroDocumento ||
      !formAfiliado.fechaNacimiento
    ) {
      showSnackbar("Por favor complete todos los campos requeridos", "error");
      return;
    }

    if (selectedAfiliado && isEditing) {
      const updatedAfiliado = {
        ...selectedAfiliado,
        ...formAfiliado,
        telefonos: editTelefonos,
        emails: editEmails,
        direcciones: editDirecciones,
      };
      dispatch(updateAfiliado(updatedAfiliado));
      showSnackbar("Afiliado actualizado exitosamente");
    } else {
      const maxNumeroAfiliado = afiliados.reduce((max, a) => {
        const num = Number.parseInt(a.numeroAfiliado);
        return num > max ? num : max;
      }, 0);

      const newAfiliado = {
        id: `a${Date.now()}`,
        numeroAfiliado: String(maxNumeroAfiliado + 1).padStart(7, "0"),
        numeroIntegrante: "01",
        ...formAfiliado,
        parentesco: "Titular",
        situacionesTerapeuticas: [],
        telefonos: editTelefonos,
        emails: editEmails,
        direcciones: editDirecciones,
        activo: true,
        familiaresIds: [],
      };
      dispatch(addAfiliado(newAfiliado));
      showSnackbar("Afiliado creado exitosamente");
    }

    setOpenDialog(false);
    setSelectedAfiliado(null);
  };

  const handleAddFamiliar = (afiliado) => {
    setSelectedAfiliado(afiliado);
    setSelectedFamiliar(null);
    setIsEditingFamiliar(false);
    setFormFamiliar({
      nombre: "",
      apellido: afiliado.apellido,
      tipoDocumento: "DNI",
      numeroDocumento: "",
      fechaNacimiento: "",
      fechaAlta: getTodayDate(),
      parentesco: "Cónyuge",
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
      tipoDocumento: familiar.tipoDocumento,
      numeroDocumento: familiar.numeroDocumento,
      fechaNacimiento: familiar.fechaNacimiento,
      fechaAlta: familiar.fechaAlta,
      parentesco: familiar.parentesco,
    });
    setEditTelefonos([...familiar.telefonos]);
    setEditEmails([...familiar.emails]);
    setEditDirecciones([...familiar.direcciones]);
    setOpenFamiliarDialog(true);
  };

  const handleViewFamiliar = (familiar, afiliado) => {
    setSelectedAfiliado(afiliado);
    setSelectedFamiliar(familiar);
    setIsEditingFamiliar(false); // Modo vista, no edición
    setFormFamiliar({
      nombre: familiar.nombre,
      apellido: familiar.apellido,
      tipoDocumento: familiar.tipoDocumento,
      numeroDocumento: familiar.numeroDocumento,
      fechaNacimiento: familiar.fechaNacimiento,
      fechaAlta: familiar.fechaAlta,
      parentesco: familiar.parentesco,
    });
    // Cargar contactos existentes para mostrar en vista
    setEditTelefonos([...familiar.telefonos]);
    setEditEmails([...familiar.emails]);
    setEditDirecciones([...familiar.direcciones]);
    setOpenFamiliarDialog(true);
  };

  const handleSaveFamiliar = () => {
    if (
      !selectedAfiliado ||
      !formFamiliar.nombre ||
      !formFamiliar.apellido ||
      !formFamiliar.numeroDocumento ||
      !formFamiliar.fechaNacimiento
    ) {
      showSnackbar("Por favor complete todos los campos requeridos", "error");
      return;
    }

    if (selectedFamiliar && isEditingFamiliar) {
      const updatedFamiliar = {
        ...selectedFamiliar,
        ...formFamiliar,
        telefonos: editTelefonos,
        emails: editEmails,
        direcciones: editDirecciones,
      };
      dispatch(updateFamiliar(updatedFamiliar));
      showSnackbar("Familiar actualizado exitosamente");
    } else {
      const familiaresDelGrupo = familiares.filter(
        (f) => f.numeroAfiliado === selectedAfiliado.numeroAfiliado
      );
      const maxIntegrante = familiaresDelGrupo.reduce((max, f) => {
        const num = Number.parseInt(f.numeroIntegrante);
        return num > max ? num : max;
      }, 1);

      const newFamiliar = {
        id: `f${Date.now()}`,
        numeroAfiliado: selectedAfiliado.numeroAfiliado,
        numeroIntegrante: String(maxIntegrante + 1).padStart(2, "0"),
        ...formFamiliar,
        planMedico: selectedAfiliado.planMedico,
        situacionesTerapeuticas: [],
        telefonos: editTelefonos,
        emails: editEmails,
        direcciones: editDirecciones,
        activo: true,
      };
      dispatch(addFamiliar(newFamiliar));
      dispatch(
        addFamiliarToAfiliado({
          afiliadoId: selectedAfiliado.id,
          familiarId: newFamiliar.id,
        })
      );
      showSnackbar("Familiar agregado exitosamente");
    }

    setOpenFamiliarDialog(false);
    setSelectedFamiliar(null);
  };

  const handleDeleteFamiliar = (familiar, afiliado) => {
    if (
      window.confirm(
        `¿Está seguro de eliminar a ${familiar.nombre} ${familiar.apellido}?`
      )
    ) {
      dispatch(deleteFamiliar(familiar.id));
      dispatch(
        removeFamiliarFromAfiliado({
          afiliadoId: afiliado.id,
          familiarId: familiar.id,
        })
      );
      showSnackbar("Familiar eliminado exitosamente");
    }
  };

  const handleToggleFamiliarActive = (familiar) => {
    dispatch(toggleFamiliarActive(familiar.id));
    const action = familiar.activo ? "desactivado" : "activado";
    showSnackbar(`Familiar ${action} exitosamente`);
  };

  const getParentescoColor = (parentesco) => {
    const colors = {
      Titular: "#1976d2",
      Cónyuge: "#2e7d32",
      Hijo: "#f57c00",
      ACargo: "#757575",
    };
    return colors[parentesco] || "#757575";
  };

  const getPlanColor = (plan) => {
    const colors = {
      210: "#4caf50",
      310: "#2196f3",
      410: "#ff9800",
      510: "#9c27b0",
      "Plan Bronce": "#cd7f32",
      "Plan Plata": "#c0c0c0",
      "Plan Oro": "#ffd700",
      "Plan Platino": "#e5e4e2",
    };
    return colors[plan] || "#757575";
  };

  const getFamiliaresDelAfiliado = (afiliado) => {
    return afiliado.familiaresIds
      .map((id) => familiares.find((f) => f.id === id))
      .filter(Boolean);
  };

  return (
    <Box>
      <Typography
        variant="h4"
        gutterBottom
        sx={{ fontWeight: "bold", color: "#1976d2" }}
      >
        Afiliados
      </Typography>
      <Typography
        variant="subtitle1"
        gutterBottom
        sx={{ color: "#666", mb: 3 }}
      >
        Gestión de afiliados y sus grupos familiares
      </Typography>

      <AdvancedSearchBar
        afiliados={afiliados}
        onFilteredAfiliadosChange={setFilteredAfiliados}
      />

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {filteredAfiliados.map((afiliado) => {
          const familiaresDelAfiliado = getFamiliaresDelAfiliado(afiliado);

          return (
            <AfiliadoCard
              key={afiliado.id}
              afiliado={afiliado}
              familiares={familiaresDelAfiliado}
              onView={handleViewAfiliado}
              onEdit={handleEditAfiliado}
              onToggleActive={handleToggleActive}
              onAddFamiliar={handleAddFamiliar}
              onViewFamiliar={handleViewFamiliar}
              onEditFamiliar={handleEditFamiliar}
              onToggleFamiliarActive={handleToggleFamiliarActive}
              onDeleteFamiliar={handleDeleteFamiliar}
              getParentescoColor={getParentescoColor}
              getPlanColor={getPlanColor}
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
          <Typography variant="body2" color="textSecondary">
            {afiliados.length === 0
              ? "No hay afiliados registrados"
              : "Intenta con otros términos de búsqueda"}
          </Typography>
        </Box>
      )}

      <Fab
        color="primary"
        aria-label="add"
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
        editTelefonos={editTelefonos}
        editEmails={editEmails}
        editDirecciones={editDirecciones}
        onEditTelefonosChange={setEditTelefonos}
        onEditEmailsChange={setEditEmails}
        onEditDireccionesChange={setEditDirecciones}
        onClose={() => setOpenDialog(false)}
        onSave={handleSaveAfiliado}
        onEdit={() => setIsEditing(true)}
        onFormChange={(field, value) =>
          setFormAfiliado({ ...formAfiliado, [field]: value })
        }
      />

      <FamiliarFormDialog
        open={openFamiliarDialog}
        selectedAfiliado={selectedAfiliado}
        selectedFamiliar={selectedFamiliar}
        isEditing={isEditingFamiliar}
        formData={formFamiliar}
        editTelefonos={editTelefonos}
        editEmails={editEmails}
        editDirecciones={editDirecciones}
        onEditTelefonosChange={setEditTelefonos}
        onEditEmailsChange={setEditEmails}
        onEditDireccionesChange={setEditDirecciones}
        onClose={() => setOpenFamiliarDialog(false)}
        onSave={handleSaveFamiliar}
        onFormChange={(field, value) =>
          setFormFamiliar({ ...formFamiliar, [field]: value })
        }
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
