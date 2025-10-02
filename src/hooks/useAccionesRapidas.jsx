import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PersonAdd, LocalHospital, MedicalServices } from '@mui/icons-material';

export const useAccionesRapidas = (tipo = 'dashboard') => {
  const [actions, setActions] = useState([]);
  const navigate = useNavigate();

  const handleActionClick = (actionTitle) => {
    // fallback
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
          onClick: () => navigate('/afiliados?nuevo=1')
        },
        {
          title: "Nuevo Prestador",
          subtitle: "Registrar prestador médico",
          icon: <LocalHospital />,
          backgroundColor: "#6f42c1",
          onClick: () => navigate('/prestadores?nuevo=1')
        },
        {
          title: "Nueva Especialidad",
          subtitle: "Agregar especialidad médica",
          icon: <MedicalServices />,
          backgroundColor: "#007bff",
          onClick: () => navigate('/especialidades?nuevo=1')
        }
      ]
    };
    
    setActions(datos[tipo] || []);
  }, [tipo]);

  return { actions };
};
