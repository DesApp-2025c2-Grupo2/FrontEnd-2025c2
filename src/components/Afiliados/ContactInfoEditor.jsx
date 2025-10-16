import { Box, Typography, Card, TextField, IconButton } from "@mui/material";
import { Add as AddIcon, Delete as DeleteIcon } from "@mui/icons-material";

export default function ContactInfoEditor({
  icon,
  title,
  items = [],
  keyProp = null, // nueva prop opcional
  newValue = "",
  placeholder,
  inputType = "text",
  onNewValueChange = () => {},
  onAdd = () => {},
  onRemove = () => {},
  disabled = false,
}) {
  const list = Array.isArray(items) ? items : [];

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (!disabled) onAdd();
    }
  };

  return (
    <Card sx={{ p: 2, backgroundColor: "#f8f9fa" }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        {icon}
        <Typography variant="subtitle2" sx={{ ml: 1 }}>
          {title}
        </Typography>
      </Box>

      <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
        <TextField
          fullWidth
          size="small"
          type={inputType}
          placeholder={placeholder}
          value={newValue}
          onChange={(e) => onNewValueChange(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
        />
        <IconButton
          onClick={() => !disabled && onAdd()}
          color="secondary"
          aria-label={`Agregar ${title}`}
          disabled={disabled}
        >
          <AddIcon />
        </IconButton>
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        {list.length === 0 && (
          <Typography variant="body2" color="textSecondary">
            No hay {title.toLowerCase()} registrados
          </Typography>
        )}

        {list.map((item, index) => (
          <Card
            key={index}
            sx={{
              p: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              minHeight: 48,
            }}
            variant="outlined"
          >
            <Typography variant="body1" sx={{ wordBreak: "break-word" }}>
              {keyProp && item[keyProp]
                ? item[keyProp]
                : typeof item === "string"
                ? item
                : JSON.stringify(item)}
            </Typography>
            <IconButton
              size="small"
              onClick={() => onRemove(index)}
              color="error"
              aria-label={`Eliminar ${title} ${index + 1}`}
            >
              <DeleteIcon />
            </IconButton>
          </Card>
        ))}
      </Box>
    </Card>
  );
}
