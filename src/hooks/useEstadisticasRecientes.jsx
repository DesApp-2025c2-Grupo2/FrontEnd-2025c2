import { useState, useEffect } from 'react';
import { PersonAdd, LocalHospital } from '@mui/icons-material';

export const useEstadisticasRecientes = (tipo = 'dashboard') => {
  const [stats, setStats] = useState([]);

  useEffect(() => {
    const datos = {
      dashboard: [
        {
          title: "Grupos Familiares",
          count: "3",
          icon: <PersonAdd sx={{ color: '#007bff' }} />,
          subtitle: "Últimos 5 agregados hoy:",
          items: [
            "Familia Martinez",
            "310",
            "Familia Perez",
            "510",
            "Familia Lopez",
            "Oro"
          ],
          showMoreText: "MOSTRAR MÁS",
          showMoreColor: "#007bff",
          onShowMore: () => console.log("Mostrar más Grupos Familiares")
        },
        {
          title: "Afiliados Activos",
          count: "3",
          icon: <PersonAdd sx={{ color: '#28a745' }} />,
          subtitle: "Últimos 5 agregados hoy:",
          items: [
            "Pedro Gómez",
            "0000001-01",
            "María Gómez",
            "0000001-02",
            "Ana López",
            "0000002-01"
          ],
          showMoreText: "MOSTRAR MÁS",
          showMoreColor: "#28a745",
          onShowMore: () => console.log("Mostrar más Afiliados Activos")
        },
        {
          title: "Prestadores",
          count: "3",
          icon: <LocalHospital sx={{ color: '#6f42c1' }} />,
          subtitle: "Últimos 5 agregados hoy:",
          items: [
            "Dr. Julia Torres",
            "Cardiología",
            "Dr. Juan Perez",
            "Traumatología",
            "Dr. Maria Lopez",
            "Múltiples"
          ],
          showMoreText: "MOSTRAR MÁS",
          showMoreColor: "#6f42c1",
          onShowMore: () => console.log("Mostrar más Prestadores")
        }
      ]
    };
    
    setStats(datos[tipo] || []);
  }, [tipo]);

  return { stats };
};
