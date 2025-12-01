import { Box, Chip } from "@mui/material";

const dias = [
  { dia: 1, nombre: "Lun" },
  { dia: 2, nombre: "Mar" },
  { dia: 3, nombre: "Mié" },
  { dia: 4, nombre: "Jue" },
  { dia: 5, nombre: "Vie" },
  { dia: 6, nombre: "Sáb" },
  { dia: 7, nombre: "Dom" },
];

export default function AgendaDiasSelector({ value, onChange }) {
  const toggle = (d) => {
    if (value.some((x) => x.dia === d))
      onChange(value.filter((x) => x.dia !== d));
    else onChange([...value, { id: 0, dia: d }]);
  };

  return (
    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
      {dias.map((d) => (
        <Chip
          key={d.dia}
          label={d.nombre}
          color={value.some((x) => x.dia === d.dia) ? "primary" : "default"}
          onClick={() => toggle(d.dia)}
        />
      ))}
    </Box>
  );
}
