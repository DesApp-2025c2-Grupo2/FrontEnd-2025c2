import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { Provider } from "react-redux";
import { store } from "./utilidades/store.js";
import { createTheme, ThemeProvider } from "@mui/material";

const theme = createTheme({
  palette: {
    primary: { main: "#2563eb", dark: "#1D4ED8" },
    secondary: { main: "#0FA97D" },
    background: { default: "#ffffff", paper: "#f8fafc" }, 
    action: { selected: "rgba(37, 99, 235, 0.10)" },
    text: {
      primary: "#111827",
      secondary: "#6b7280",
    },
  },
  typography: {
    fontFamily: "'Inter', system-ui, Avenir, Helvetica, Arial, sans-serif",
    fontSize: 14,
    h1: { fontSize: "2rem", fontWeight: 700 },
    h2: { fontSize: "1.5rem", fontWeight: 700 },
    h3: { fontSize: "1.25rem", fontWeight: 700 },
    h4: { fontSize: "1.125rem", fontWeight: 700 },
    h5: { fontSize: "1rem", fontWeight: 700 },
    h6: { fontSize: "0.875rem", fontWeight: 700 },
    body1: { fontSize: "1rem" },
    body2: { fontSize: "0.875rem" },
  },
  components: {
    MuiTypography: {
      styleOverrides: {
        root: ({ ownerState, theme }) => ({
          ...(ownerState.variant &&
            ["h1", "h2", "h3", "h4", "h5", "h6"].includes(ownerState.variant) && {
              color: theme.palette.text.primary,
              fontWeight: 700,
            }),
        }),
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: ({ theme }) => ({
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: theme.palette.primary.main,
          },
        }),
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: ({ theme }) => ({
          "&.Mui-focused": {
            color: theme.palette.text.primary,
          },
        }),
      },
    },
    MuiButton: {
      styleOverrides: {
        outlinedPrimary: ({ theme }) => ({
          borderColor: theme.palette.primary.main,
          color: theme.palette.primary.main,
          "&:hover": {
            backgroundColor: "rgba(37, 99, 235, 0.08)",
          },
        }),
      },
    },
  },
});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <App />
      </ThemeProvider>
    </Provider>
  </StrictMode>
);
