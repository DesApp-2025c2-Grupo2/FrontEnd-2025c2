import { AppBar, Toolbar, IconButton, Typography } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";

export default function Header({ onMenuClick }) {
  return (
    <AppBar
      position="fixed"
      sx={{
        display: { xs: "flex", md: "none" },
        bgcolor: "background.paper",
        color: "text.primary",
      }}
    >
      <Toolbar>
        <IconButton
          edge="start"
          color="inherit"
          aria-label="menu"
          onClick={onMenuClick}
        >
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" sx={{ ml: 2 }}>
          AesMed
        </Typography>
      </Toolbar>
    </AppBar>
  );
}
