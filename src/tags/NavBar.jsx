import {
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import PersonIcon from "@mui/icons-material/Person";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PollIcon from "@mui/icons-material/Poll";
import HealingIcon from "@mui/icons-material/Healing";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import { Link, useLocation } from "react-router-dom";

import CloseIcon from "@mui/icons-material/Close";

const drawerWidth = 220;

// Array de enlaces del menú con iconos
const menuItems = [
  { text: "Inicio", path: "/", icon: <HomeIcon /> },
  { text: "Afiliados", path: "/afiliados", icon: <PersonIcon /> },
  { text: "Prestadores", path: "/prestadores", icon: <MedicalServicesIcon /> },
  {
    text: "Especialidades",
    path: "/especialidades",
    icon: <LocalHospitalIcon />,
  },
  {
    text: "Consultas y Reportes",
    path: "/consultas-reportes",
    icon: <PollIcon />,
  },
  {
    text: "Situaciones Terapéuticas",
    path: "/situaciones",
    icon: <HealingIcon />,
  },
  { text: "Planes", path: "/planes", icon: <CreditCardIcon /> },
];

export default function NavBar({ mobileOpen, handleDrawerToggle }) {
  const location = useLocation();
  const renderDrawerContent = (closeOnClick = false) => (
    <Box sx={{ bgcolor: "background.paper", height: "100%" }}>
      <List>
        {/* Logo */}
        <ListItem>
          <ListItemIcon>
            <Box
              sx={{
                color: "common.white",
                bgcolor: "text.primary",
                p: 1,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <LocalHospitalIcon />
            </Box>
          </ListItemIcon>
          <ListItemText primary="AesMed" secondary="Medicina Integral" />
          {/* Botón de cierre solo visible en móviles */}
          <IconButton
            edge="end"
            color="inherit"
            onClick={handleDrawerToggle}
            aria-label="Cerrar menú"
            sx={{
              display: { xs: "flex", md: "none" },
              justifyContent: "flex-end",
              px: 2,
            }}
          >
            <CloseIcon />
          </IconButton>
        </ListItem>
        <Divider />

        {/* Menú */}
        {menuItems.map((item) => {
          const isActive = item.path === "/" ? location.pathname === "/" : location.pathname.startsWith(item.path);
          return (
            <ListItemButton
              key={item.text}
              component={Link}
              to={item.path}
              onClick={closeOnClick ? handleDrawerToggle : undefined}
              selected={isActive}
              sx={{
                color: "text.secondary",
                "&.Mui-selected": {
                  bgcolor: "primary.main",
                  color: "common.white",
                  "& .MuiListItemIcon-root": { color: "common.white" },
                },
                "&.Mui-selected:hover": {
                  bgcolor: "primary.main",
                  color: "common.white",
                  "& .MuiListItemIcon-root": { color: "common.white" },
                },
                "&:not(.Mui-selected):hover": {
                  bgcolor: "action.selected",
                  color: "text.primary",
                  "& .MuiListItemIcon-root": { color: "text.primary" },
                },
              }}
            >
              <ListItemIcon sx={{ color: "inherit", paddingLeft: 1 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          );
        })}
      </List>
    </Box>
  );

  return (
    <>
      {/* Drawer temporal para móviles */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": { width: drawerWidth },
        }}
      >
        {renderDrawerContent(true)}
      </Drawer>

      {/* Drawer permanente para desktop */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", md: "block" },
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
          },
        }}
        open
      >
        {renderDrawerContent(false)}
      </Drawer>
    </>
  );
}
