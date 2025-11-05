import React, { useMemo, useState } from "react";
import { Box, Container, Typography } from "@mui/material";
import SeccionAccionesRapidas from "../components/SeccionAccionesRapidas";
import SeccionEstadisticasRecientes from "../components/SeccionEstadisticasRecientes";
import { useEstadisticasRecientes } from "../hooks/useEstadisticasRecientes.jsx";
import { PersonAdd, LocalHospital, MedicalServices } from "@mui/icons-material";
import DialogPrestador from "../components/DialogPrestador";
import DialogoPlan from "../components/DialogoPlan.jsx";
import AfiliadoFormDialog from "../components/Afiliados/AfiliadoFormDialog";
import { useDispatch, useSelector } from "react-redux";
import { crearPrestador } from "../store/prestadoresSlice";
import { addEspecialidad } from "../store/especialidadesSlice";
import { selectPlanes } from "../store/planesSlice"; // ejemplo
import TablaCrecimiento from "../components/TablaCrecimiento.jsx";

import PeopleIcon from "@mui/icons-material/People";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import EventIcon from "@mui/icons-material/Event";
import DescriptionIcon from "@mui/icons-material/Description";
import TarjetaEstadistica from "../components/TarjetaEstadistica.jsx";

import {
  crearPlan,
  editarPlan,
  alternarPlanThunk,
} from "../store/planesSlice.js";
import SnackbarMini from "../components/Ui/SnackbarMini.jsx";

function Dashboard() {
  const { stats: recentStats } = useEstadisticasRecientes("dashboard");
  const dispatch = useDispatch();

  const planesMedicos = useSelector(selectPlanes) || [];

  const [openPrestador, setOpenPrestador] = useState(false);
  const [openAfiliado, setOpenAfiliado] = useState(false);

  // Para crear un nuevo afiliado
  const [newAfiliadoData, setNewAfiliadoData] = useState({});

  const actions = useMemo(
    () => [
      {
        title: "Nuevo Afiliado",
        subtitle: "Agregar afiliado titular",
        icon: <PersonAdd />,
        backgroundColor: "#28a745",
        onClick: () => {
          setNewAfiliadoData({}); // resetear form
          setOpenAfiliado(true);
        },
      },
      {
        title: "Nuevo Prestador",
        subtitle: "Registrar prestador médico",
        icon: <LocalHospital />,
        backgroundColor: "#6f42c1",
        onClick: () => setOpenPrestador(true),
      },
      {
        title: "Nuevo Plan",
        subtitle: "Agregar plan de salud",
        icon: <DescriptionIcon />,
        backgroundColor: "#007bff",
        onClick: () => setDialogOpen(true),
      },
    ],
    []
  );

  //Para logica del modal de planes

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editPlan, setEditPlan] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  const handleClosePlan = () => setDialogOpen(false);

  const handleSubmitPlan = (data) => {
    if (editPlan) {
      dispatch(editarPlan({ ...data, id: editPlan.id }));
      setSnackbarMessage("Plan actualizado correctamente");
      setSnackbarSeverity("success");
    } else {
      dispatch(crearPlan(data));
      setSnackbarMessage("Plan agregado correctamente");
      setSnackbarSeverity("success");
    }
    setDialogOpen(false);
    setSnackbarOpen(true);
  };

  const handleOpenAddPlan = () => {
    setEditPlan(null);
    setDialogOpen(true);
  };

  const handleSaveAfiliado = () => {
    // Aquí iría la lógica para guardar el afiliado en Redux o backend
    console.log("Crear afiliado con datos:", newAfiliadoData);
    setOpenAfiliado(false);
  };

  const metrics = [
    {
      title: "Total Afiliados",
      value: "13,698",
      changeValue: "+12.5%",
      positive: true,
      icon: <PeopleIcon color="secondary" />,
    },
    {
      title: "Prestadores Activos",
      value: "327",
      changeValue: "+5.2%",
      positive: true,
      icon: <MedicalServicesIcon color="secondary" />,
    },
    {
      title: "Turnos del Mes",
      value: "8,234",
      changeValue: "-2.4%",
      positive: false,
      icon: <EventIcon color="secondary" />,
    },
    {
      title: "Planes Activos",
      value: "12",
      changeValue: "+8.1%",
      positive: true,
      icon: <DescriptionIcon color="secondary" />,
    },
  ];
  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Typography variant="h3" fontWeight="bold">
        Dashboard
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Resumen general de la plataforma de servicios médicos
      </Typography>

      <Box>
        <SeccionAccionesRapidas actions={actions} />
        <Box display="flex" gap={2} flexWrap="wrap" mb={4}>
          {metrics.map((m, i) => (
            <TarjetaEstadistica key={i} {...m} />
          ))}
        </Box>
        <Box display="flex" gap={2} flexWrap="wrap">
          <TablaCrecimiento />
        </Box>
      </Box>

      {/* Modal Nuevo Prestador */}
      <DialogPrestador
        abierto={openPrestador}
        valorInicial={null}
        onCerrar={() => setOpenPrestador(false)}
        onGuardar={async (nuevo) => {
          await dispatch(crearPrestador(nuevo));
          setOpenPrestador(false);
        }}
      />

      {/* Modal Nuevo plan médico */}
      <DialogoPlan
        abierto={dialogOpen}
        onCerrar={handleClosePlan}
        onGuardar={handleSubmitPlan}
      />
      <SnackbarMini
        open={snackbarOpen}
        message={snackbarMessage}
        severity={snackbarSeverity}
        onClose={() => setSnackbarOpen(false)}
      />

      {/* Modal Nuevo Afiliado */}
      <AfiliadoFormDialog
        open={openAfiliado}
        selectedAfiliado={null}
        isEditing={false}
        formData={newAfiliadoData}
        onFormChange={(field, value) =>
          setNewAfiliadoData((prev) => ({ ...prev, [field]: value }))
        }
        planesMedicos={planesMedicos}
        editTelefonos={[]}
        editEmails={[]}
        editDirecciones={[]}
        editSituaciones={[]}
        onEditTelefonosChange={() => {}}
        onEditEmailsChange={() => {}}
        onEditDireccionesChange={() => {}}
        onEditSituacionesChange={() => {}}
        onClose={() => setOpenAfiliado(false)}
        onSave={handleSaveAfiliado}
        onEdit={() => {}}
      />
    </Container>
  );
}

export default Dashboard;
