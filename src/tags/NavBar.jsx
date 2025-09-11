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
  Typography,
} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import PeopleIcon from "@mui/icons-material/People";
import PersonIcon from "@mui/icons-material/Person";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PollIcon from "@mui/icons-material/Poll";
import HealingIcon from "@mui/icons-material/Healing";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import MenuIcon from "@mui/icons-material/Menu";
import { Link } from "react-router-dom";

import CloseIcon from "@mui/icons-material/Close";

const drawerWidth = 220;

// Array de enlaces del menú con iconos
const menuItems = [
  { text: "Inicio", path: "/", icon: <HomeIcon /> },
  { text: "Grupos Familiares", path: "/grupos", icon: <PeopleIcon /> },
  { text: "Afiliados", path: "/afiliados", icon: <PersonIcon /> },
  { text: "Prestadores", path: "/prestadores", icon: <MedicalServicesIcon /> },
  {
    text: "Especialidades",
    path: "/especialidades",
    icon: <LocalHospitalIcon />,
  },
  { text: "Turnos", path: "/turnos", icon: <AccessTimeIcon /> },
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
  const drawerContent = (
    <Box sx={{ bgcolor: "primary.main", height: "100%" }}>
      <List>
        {/* Logo */}
        <ListItem>
          <ListItemIcon>
            <Box
              sx={{
                color: "white",
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
        {menuItems.map((item) => (
          <ListItemButton
            key={item.text}
            component={Link}
            to={item.path}
            onClick={handleDrawerToggle}
            sx={{
              color: "text.secondary",
              "&:hover": {
                color: "text.primary",
                "& .MuiListItemIcon-root": {
                  color: "text.primary",
                },
              },
            }}
          >
            <ListItemIcon sx={{ color: "inherit", paddingLeft: 1 }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItemButton>
        ))}
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
        {drawerContent}
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
        {drawerContent}
      </Drawer>
    </>
  );
}
