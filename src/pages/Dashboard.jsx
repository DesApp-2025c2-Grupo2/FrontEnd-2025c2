import React, { useMemo, useState } from "react";
import { Box, Container } from "@mui/material";
import SeccionAccionesRapidas from "../components/SeccionAccionesRapidas";
import SeccionEstadisticasRecientes from "../components/SeccionEstadisticasRecientes";
import { useEstadisticasRecientes } from "../hooks/useEstadisticasRecientes.jsx";
import { PersonAdd, LocalHospital, MedicalServices } from "@mui/icons-material";
import DialogPrestador from "../components/DialogPrestador";
import DialogEspecialidad from "../components/DialogEspecialidad";
import AfiliadoFormDialog from "../components/Afiliados/AfiliadoFormDialog";
import { useDispatch, useSelector } from "react-redux";
import { crearPrestador } from "../store/prestadoresSlice";
import { addEspecialidad } from "../store/especialidadesSlice";
import { selectPlanes } from "../store/planesSlice"; // ejemplo

function Dashboard() {
  const { stats: recentStats } = useEstadisticasRecientes("dashboard");
  const dispatch = useDispatch();

  const planesMedicos = useSelector(selectPlanes) || [];

  const [openPrestador, setOpenPrestador] = useState(false);
  const [openEspecialidad, setOpenEspecialidad] = useState(false);
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
        title: "Nueva Especialidad",
        subtitle: "Agregar especialidad médica",
        icon: <MedicalServices />,
        backgroundColor: "#007bff",
        onClick: () => setOpenEspecialidad(true),
      },
    ],
    []
  );

  const handleSaveAfiliado = () => {
    // Aquí iría la lógica para guardar el afiliado en Redux o backend
    console.log("Crear afiliado con datos:", newAfiliadoData);
    setOpenAfiliado(false);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Box>
        <SeccionAccionesRapidas actions={actions} />
        <SeccionEstadisticasRecientes stats={recentStats} />
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

      {/* Modal Nueva Especialidad */}
      <DialogEspecialidad
        abierto={openEspecialidad}
        valorInicial={null}
        onCerrar={() => setOpenEspecialidad(false)}
        onGuardar={async (esp) => {
          await dispatch(
            addEspecialidad({
              nombre: esp.nombre,
              descripcion: esp.descripcion,
            })
          );
          setOpenEspecialidad(false);
        }}
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
