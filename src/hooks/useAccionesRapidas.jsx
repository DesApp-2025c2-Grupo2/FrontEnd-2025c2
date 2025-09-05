import { useState, useEffect } from 'react';
import { PersonAdd, LocalHospital, MedicalServices } from '@mui/icons-material';

export const useAccionesRapidas = (tipo = 'dashboard') => {
  const [actions, setActions] = useState([]);

  const handleActionClick = (actionTitle) => {
    alert(`Crear ${actionTitle} `);
  };

  useEffect(() => {
    const datos = {
      dashboard: [
        {
          title: "Nuevo Afiliado",
          subtitle: "Agregar afiliado titular",
          icon: <PersonAdd />,
          backgroundColor: "#28a745",
          onClick: () => handleActionClick("Nuevo Afiliado")
        },
        {
          title: "Nuevo Prestador",
          subtitle: "Registrar prestador médico",
          icon: <LocalHospital />,
          backgroundColor: "#6f42c1",
          onClick: () => handleActionClick("Nuevo Prestador")
        },
        {
          title: "Nueva Especialidad",
          subtitle: "Agregar especialidad médica",
          icon: <MedicalServices />,
          backgroundColor: "#007bff",
          onClick: () => handleActionClick("Nueva Especialidad")
        }
      ]
    };
    
    setActions(datos[tipo] || []);
  }, [tipo]);

  return { actions };
};
