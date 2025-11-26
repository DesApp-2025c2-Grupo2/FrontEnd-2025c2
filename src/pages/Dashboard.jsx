import React, { useMemo, useEffect } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  useMediaQuery,
} from "@mui/material";
import PageHeader from "../components/Ui/PageHeader.jsx";
import { useDispatch, useSelector } from "react-redux";
import { selectPlanes } from "../store/planesSlice";
import PeopleIcon from "@mui/icons-material/People";
import DescriptionIcon from "@mui/icons-material/Description";
import TarjetaEstadistica from "../components/TarjetaEstadistica.jsx";

// Recharts
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

// Dashboard slice
import {
  fetchEstadisticas,
  selectEstadisticas,
  selectDashboardLoading,
  selectDashboardError,
} from "../store/dashboardSlice";

function Dashboard() {
  const dispatch = useDispatch();

  // MediaQuery
  const isSmall = useMediaQuery("(max-width: 600px)");

  // Redux state
  const estadisticas = useSelector(selectEstadisticas);
  const loading = useSelector(selectDashboardLoading);
  const error = useSelector(selectDashboardError);
  const planesMedicos = useSelector(selectPlanes) || [];

  // Obtener estadísticas al cargar
  useEffect(() => {
    dispatch(fetchEstadisticas());
  }, [dispatch]);

  // Tarjetas
  const metrics = useMemo(() => {
    if (!estadisticas) return [];
    const total = estadisticas.totalAfiliados ?? 0;
    const activos = estadisticas.afiliadosActivos ?? 0;

    return [
      {
        title: "Afiliados Totales",
        value: total,
        icon: <PeopleIcon color="primary" />,
      },
      {
        title: "Afiliados Activos",
        value: activos,
        icon: <PeopleIcon color="secondary" />,
      },
      {
        title: "Afiliados Inactivos",
        value: total - activos,
        icon: <PeopleIcon color="error" />,
      },
      {
        title: "Planes Totales",
        value: estadisticas.totalPlanesMedicos ?? 0,
        icon: <DescriptionIcon color="secondary" />,
      },
    ];
  }, [estadisticas]);

  // Afiliados por plan
  const afiliadosPorPlanList = useMemo(() => {
    if (!estadisticas || !estadisticas.afiliadosPorPlan) return [];

    return Object.entries(estadisticas.afiliadosPorPlan).map(
      ([planId, cantidad]) => {
        const plan = planesMedicos.find((p) => String(p.id) === String(planId));
        return {
          planId,
          nombre: plan?.nombre ?? `Plan ${planId}`,
          cantidad: cantidad ?? 0,
        };
      }
    );
  }, [estadisticas, planesMedicos]);

  // PieChart: activos vs inactivos
  const pieData = useMemo(() => {
    if (!estadisticas) return [];

    const total = estadisticas.totalAfiliados ?? 0;
    const activos = estadisticas.afiliadosActivos ?? 0;
    const inactivos = total - activos;

    return [
      { name: "Activos", value: activos },
      { name: "Inactivos", value: inactivos },
    ];
  }, [estadisticas]);

  const pieColors = ["#22c55e", "#ef4444"];

  const renderLabel = ({ name,value, percent }) => {
    if (isSmall) {
      return `${(percent * 100).toFixed(1)}%(${value})`; // solo porcentaje en mobile
    }

    return `${name}: ${(percent * 100).toFixed(1)}%`; // desktop: nombre + %
  };

  return (
    <>
      <PageHeader title="Dashboard" />

      <Box>
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
          <>
            {/* Tarjetas de métricas */}
            <Box
              display="flex"
              gap={2}
              flexWrap="wrap"
              mb={4}
              justifyContent="space-between"
            >
              {metrics.map((m, i) => (
                <Box
                  key={i}
                  flex={isSmall ? "1 1 100%" : "1 1 calc(25% - 16px)"}
                >
                  <TarjetaEstadistica {...m} />
                </Box>
              ))}
            </Box>

            {/* Gráfico de barras */}
            <Box mt={2}>
              <Typography variant="h6" mb={2}>
                Afiliados por Plan
              </Typography>

              {afiliadosPorPlanList.length === 0 ? (
                <Typography variant="body2">
                  No hay datos de afiliados por plan.
                </Typography>
              ) : (
                <ResponsiveContainer width="100%" height={isSmall ? 300 : 350}>
                  <BarChart
                    layout="vertical"
                    data={afiliadosPorPlanList}
                    margin={{
                      top: 10,
                      right: isSmall ? 10 : 30,
                      left: isSmall ? 50 : 120,
                      bottom: 10,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis
                      type="category"
                      dataKey="nombre"
                      width={isSmall ? 80 : 160}
                    />
                    <Tooltip />
                    <Bar dataKey="cantidad" fill="#2563eb" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Box>

            {/* PieChart */}
            <Box mt={6}>
              <Typography variant="h6" mb={2}>
                Afiliados Activos vs Inactivos
              </Typography>

              <ResponsiveContainer width="100%" height={isSmall ? 260 : 300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={isSmall ? 80 : 110}
                    dataKey="value"
                    label={renderLabel}
                  >
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={pieColors[i]} />
                    ))}
                  </Pie>
                  {!isSmall && <Legend />}
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </>
        )}
      </Box>
    </>
  );
}

export default Dashboard;
