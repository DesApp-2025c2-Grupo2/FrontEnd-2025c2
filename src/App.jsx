import './App.css';
import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Documents from "./pages/Documents.jsx";
import Clients from "./pages/Clients.jsx";
import Destinations from "./pages/Destinations.jsx";
import Reports from "./pages/Reports.jsx";
import Varios from "./pages/Varios.jsx";
import Header from "./tags/Header.jsx";
import Footer from "./tags/Footer.jsx";

function Layout() {
  return (
    <div>
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />, 
    children: [
      { path: '', element: <Home /> },
    ]
  }
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;

