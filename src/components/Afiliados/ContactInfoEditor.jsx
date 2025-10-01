"use client";

import { Box, Typography, Card, TextField, IconButton } from "@mui/material";
import { Add as AddIcon, Delete as DeleteIcon } from "@mui/icons-material";

export default function ContactInfoEditor({
  icon,
  title,
  items,
  newValue,
  placeholder,
  inputType = "text",
  onNewValueChange,
  onAdd,
  onRemove,
}) {
  return (
    <Card sx={{ p: 2, backgroundColor: "#f8f9fa" }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        {icon}
        <Typography variant="subtitle2">{title}</Typography>
      </Box>

      <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
        <TextField
          fullWidth
          size="small"
          type={inputType}
          placeholder={placeholder}
          value={newValue}
          onChange={(e) => onNewValueChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onAdd()}
        />
        <IconButton onClick={onAdd} color="primary">
          <AddIcon />
        </IconButton>
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        {items.map((item, index) => (
          <Card
            key={index}
            sx={{
              p: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              minHeight: 48,
            }}
          >
            <Typography variant="body1">{item}</Typography>
            <IconButton
              size="small"
              onClick={() => onRemove(index)}
              color="error"
            >
              <DeleteIcon />
            </IconButton>
          </Card>
        ))}
      </Box>
    </Card>
  );
}
