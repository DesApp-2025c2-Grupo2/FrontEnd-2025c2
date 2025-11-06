import React, { useMemo, useState, useEffect } from "react";
import { Box, Container, Typography, CircularProgress } from "@mui/material";
import SeccionAccionesRapidas from "../components/SeccionAccionesRapidas";
import {
  PersonAdd,
  LocalHospital,
  Description as DescriptionIcon,
} from "@mui/icons-material";
import DialogPrestador from "../components/DialogPrestador";
import DialogoPlan from "../components/DialogoPlan.jsx";
import AfiliadoFormDialog from "../components/Afiliados/AfiliadoFormDialog";
import { useDispatch, useSelector } from "react-redux";
import { crearPrestador } from "../store/prestadoresSlice";
import { selectPlanes, crearPlan, editarPlan } from "../store/planesSlice";
import TablaCrecimiento from "../components/TablaCrecimiento.jsx";
import PeopleIcon from "@mui/icons-material/People";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import EventIcon from "@mui/icons-material/Event";
import TarjetaEstadistica from "../components/TarjetaEstadistica.jsx";
import SnackbarMini from "../components/Ui/SnackbarMini.jsx";

// Importar el slice del dashboard
import {
  fetchEstadisticas,
  selectEstadisticas,
  selectDashboardLoading,
  selectDashboardError,
} from "../store/dashboardSlice";

function Dashboard() {
  const dispatch = useDispatch();

  // Estado de Redux
  const estadisticas = useSelector(selectEstadisticas);
  const loading = useSelector(selectDashboardLoading);
  const error = useSelector(selectDashboardError);

  // Otros estados
  const planesMedicos = useSelector(selectPlanes) || [];
  const [openPrestador, setOpenPrestador] = useState(false);
  const [openAfiliado, setOpenAfiliado] = useState(false);
  const [newAfiliadoData, setNewAfiliadoData] = useState({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editPlan, setEditPlan] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  // Cargar estadísticas al montar
  useEffect(() => {
    dispatch(fetchEstadisticas());
  }, [dispatch]);

  const actions = useMemo(
    () => [
      {
        title: "Nuevo Afiliado",
        subtitle: "Agregar afiliado titular",
        icon: <PersonAdd />,
        backgroundColor: "#28a745",
        onClick: () => {
          setNewAfiliadoData({});
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

  const handleClosePlan = () => setDialogOpen(false);

  const handleSubmitPlan = (data) => {
    if (editPlan) {
      dispatch(editarPlan({ ...data, id: editPlan.id }));
      setSnackbarMessage("Plan actualizado correctamente");
    } else {
      dispatch(crearPlan(data));
      setSnackbarMessage("Plan agregado correctamente");
    }
    setSnackbarSeverity("success");
    setDialogOpen(false);
    setSnackbarOpen(true);
  };

  const handleSaveAfiliado = () => {
    console.log("Crear afiliado con datos:", newAfiliadoData);
    setOpenAfiliado(false);
  };

  // Construcción dinámica de métricas según backend
  const metrics = useMemo(() => {
    if (!estadisticas) return [];
    return [
      {
        title: "Afiliados Totales",
        value: estadisticas.totalAfiliados ?? 0,
        icon: <PeopleIcon color="secondary" />,
      },
      {
        title: "Afiliados Activos",
        value: estadisticas.afiliadosActivos ?? 0,
        icon: <PeopleIcon color="secondary" />,
      },
      {
        title: "Planes Totales",
        value: estadisticas.totalPlanesMedicos ?? 0,
        icon: <DescriptionIcon color="secondary" />,
      },
    ];
  }, [estadisticas]);

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

        {loading ? (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            height={200}
          >
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error" textAlign="center">
            Error al cargar estadísticas: {error}
          </Typography>
        ) : (
          <Box display="flex" gap={2} flexWrap="wrap" mb={4}>
            {metrics.map((m, i) => (
              <TarjetaEstadistica key={i} {...m} />
            ))}
          </Box>
        )}

        {/*<Box display="flex" gap={2} flexWrap="wrap">
          <TablaCrecimiento />
        </Box>*/}
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
