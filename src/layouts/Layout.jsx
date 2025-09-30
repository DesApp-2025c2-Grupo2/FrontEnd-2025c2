import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Box, Toolbar } from "@mui/material";
import NavBar from "../tags/NavBar.jsx";
import Footer from "../tags/Footer.jsx";
import Header from "../tags/Header.jsx";

const drawerWidth = 220;

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <Header onMenuClick={handleDrawerToggle} />

      <NavBar mobileOpen={mobileOpen} handleDrawerToggle={handleDrawerToggle} />

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          flexGrow: 1,
          width: { xs: "100%", md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          minHeight: 0,
        }}
      >
        {/* Espacio para el AppBar en móviles */}
        <Toolbar sx={{ display: { xs: "block", md: "none" } }} />

        <Box sx={{ flexGrow: 1, p: 3, minHeight: 0, overflowY: 'auto' }}>
          <Outlet />
        </Box>
        <Footer />
      </Box>
    </Box>
  );
}
