import "./App.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Dashboard from "./pages/Dashboard.jsx";
import Afiliados from "./pages/Afiliados.jsx";
import Prestadores from "./pages/Prestadores.jsx";
import Especialidades from "./pages/Especialidades.jsx";
import Planes from "./pages/Planes.jsx";
import Layout from "./layouts/Layout.jsx";
import GruposFamiliares from "./pages/GruposFamiliares.jsx";
import Turnos from "./pages/Turnos.jsx";
import ConsultasReportes from "./pages/ConsultasReportes.jsx";
import SituacionesTerapeuticas from "./pages/SituacionesTerapeuticas.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { path: "", element: <Dashboard /> },
      { path: "grupos", element: <GruposFamiliares /> },
      { path: "afiliados", element: <Afiliados /> },
      { path: "prestadores", element: <Prestadores /> },
      { path: "especialidades", element: <Especialidades /> },
      { path: "turnos", element: <Turnos /> },
      { path: "consultas-reportes", element: <ConsultasReportes /> },
      { path: "situaciones", element: <SituacionesTerapeuticas /> },
      { path: "planes", element: <Planes /> },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
