import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  IconButton,
  Stack,
  Divider,
  Grid,
  Card,
  CardContent,
  FormHelperText,
  Alert,
  Autocomplete,
  FormControlLabel,
  Switch,
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  LocationOn as LocationOnIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  MedicalServices as MedicalServicesIcon,
} from "@mui/icons-material";
import { selectEspecialidades } from "../store/especialidadesSlice";
import { selectPrestadores } from "../store/prestadoresSlice";
import ContactInfoEditor from "./ContactInfoEditor";

const diasSemana = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
];

// Función para verificar si dos rangos horarios se solapan
const horariosSeSuperponen = (horario1, horario2) => {
  const h1Inicio = horario1.horaInicio;
  const h1Fin = horario1.horaFin;
  const h2Inicio = horario2.horaInicio;
  const h2Fin = horario2.horaFin;

  // Si alguno de los horarios está incompleto, no validar
  if (!h1Inicio || !h1Fin || !h2Inicio || !h2Fin) return false;

  // Verificar si hay solapamiento
  return (
    (h1Inicio < h2Fin && h1Fin > h2Inicio) || // h1 solapa con h2
    (h2Inicio < h1Fin && h2Fin > h1Inicio) // h2 solapa con h1
  );
};

// Función para detectar conflictos de horarios en un lugar de atención
const detectarConflictosHorarios = (horarios) => {
  const conflictos = [];

  for (let i = 0; i < horarios.length; i++) {
    const horario1 = horarios[i];
    if (!horario1.dias || horario1.dias.length === 0) continue;

    for (let j = i + 1; j < horarios.length; j++) {
      const horario2 = horarios[j];
      if (!horario2.dias || horario2.dias.length === 0) continue;

      // Verificar si comparten días
      const diasComunes = horario1.dias.filter((dia) =>
        horario2.dias.includes(dia)
      );

      if (diasComunes.length > 0) {
        // Si comparten días, verificar si los horarios se solapan
        if (horariosSeSuperponen(horario1, horario2)) {
          conflictos.push({
            indice1: i,
            indice2: j,
            dias: diasComunes,
            horario1: `${horario1.horaInicio}-${horario1.horaFin}`,
            horario2: `${horario2.horaInicio}-${horario2.horaFin}`,
          });
        }
      }
    }
  }

  return conflictos;
};

// Función para detectar conflictos de horarios ENTRE DIFERENTES lugares de atención
const detectarConflictosEntreLugares = (lugaresAtencion) => {
  const conflictos = [];

  // Comparar cada lugar con los demás
  for (let i = 0; i < lugaresAtencion.length; i++) {
    const lugar1 = lugaresAtencion[i];

    for (let j = i + 1; j < lugaresAtencion.length; j++) {
      const lugar2 = lugaresAtencion[j];

      // Comparar todos los horarios del lugar1 con todos los del lugar2
      lugar1.horarios.forEach((horario1, h1Index) => {
        if (!horario1.dias || horario1.dias.length === 0) return;

        lugar2.horarios.forEach((horario2, h2Index) => {
          if (!horario2.dias || horario2.dias.length === 0) return;

          // Verificar si comparten días
          const diasComunes = horario1.dias.filter((dia) =>
            horario2.dias.includes(dia)
          );

          if (
            diasComunes.length > 0 &&
            horariosSeSuperponen(horario1, horario2)
          ) {
            conflictos.push({
              lugar1Index: i,
              lugar2Index: j,
              horario1Index: h1Index,
              horario2Index: h2Index,
              lugar1Dir: lugar1.direccion || `Lugar ${i + 1}`,
              lugar2Dir: lugar2.direccion || `Lugar ${j + 1}`,
              dias: diasComunes,
              horario1: `${horario1.horaInicio}-${horario1.horaFin}`,
              horario2: `${horario2.horaInicio}-${horario2.horaFin}`,
            });
          }
        });
      });
    }
  }

  return conflictos;
};

export default function DialogPrestador({
  abierto,
  valorInicial,
  onCerrar,
  onGuardar,
  soloDirecciones = false,
}) {
  const [form, setForm] = useState({
    cuilCuit: "",
    nombreCompleto: "",
    tipo: "Profesional Independiente",
    especialidades: [],
    telefonos: [],
    emails: [],
    lugaresAtencion: [],
    integraCentroMedicoId: null,
    vinculaCentro: false,
  });

  const [conflictosHorarios, setConflictosHorarios] = useState({});
  const [conflictosEntreLugares, setConflictosEntreLugares] = useState([]);
  const [intentoGuardar, setIntentoGuardar] = useState(false);

  // Estados para ContactInfoEditor
  const [newTelefono, setNewTelefono] = useState("");
  const [newEmail, setNewEmail] = useState("");

  const especialidadesDisponibles = useSelector(selectEspecialidades);
  const todosPrestadores = useSelector(selectPrestadores);

  const centrosMedicos = (todosPrestadores || []).filter(
    (p) => p.tipo === "Centro Médico"
  );

  // Inicializar formulario
  useEffect(() => {
    if (abierto) {
      setForm({
        cuilCuit: valorInicial?.cuilCuit ?? "",
        nombreCompleto: valorInicial?.nombreCompleto ?? "",
        tipo: valorInicial?.tipo ?? "Profesional Independiente",
        especialidades: valorInicial?.especialidades ?? [],
        telefonos: valorInicial?.telefonos ?? [],
        emails: valorInicial?.emails ?? [],
        lugaresAtencion: valorInicial?.lugaresAtencion ?? [],
        id: valorInicial?.id,
        integraCentroMedicoId: valorInicial?.integraCentroMedicoId ?? null,
        vinculaCentro: !!(
          valorInicial?.tipo === "Profesional Independiente" &&
          valorInicial?.integraCentroMedicoId
        ),
      });
      setConflictosHorarios({});
      setConflictosEntreLugares([]);
      setIntentoGuardar(false);
      setNewTelefono("");
      setNewEmail("");
    }
  }, [abierto, valorInicial]);

  // Detectar conflictos de horarios dentro de cada lugar Y entre lugares diferentes
  useEffect(() => {
    // Conflictos dentro de cada lugar
    const nuevosConflictos = {};

    form.lugaresAtencion.forEach((lugar, index) => {
      const conflictos = detectarConflictosHorarios(lugar.horarios);
      if (conflictos.length > 0) {
        nuevosConflictos[index] = conflictos;
      }
    });

    setConflictosHorarios(nuevosConflictos);

    // Conflictos ENTRE diferentes lugares
    const conflictosLugares = detectarConflictosEntreLugares(
      form.lugaresAtencion
    );
    setConflictosEntreLugares(conflictosLugares);
  }, [form.lugaresAtencion]);

  const cambiar = (campo) => (e) => {
    setForm((prev) => ({ ...prev, [campo]: e.target.value }));
  };

  // ===== ESPECIALIDADES =====
  const agregarEspecialidad = () => {
    setForm((prev) => ({
      ...prev,
      especialidades: [...prev.especialidades, null],
    }));
  };

  const actualizarEspecialidad = (index, especialidad) => {
    setForm((prev) => {
      const nuevas = [...prev.especialidades];
      nuevas[index] = especialidad;
      return { ...prev, especialidades: nuevas };
    });
  };

  const eliminarEspecialidad = (index) => {
    setForm((prev) => ({
      ...prev,
      especialidades: prev.especialidades.filter((_, i) => i !== index),
    }));
  };

  // ===== TELÉFONOS con ContactInfoEditor =====
  const agregarTelefono = () => {
    if (!newTelefono.trim()) return;
    setForm((prev) => ({
      ...prev,
      telefonos: [...prev.telefonos, { numero: newTelefono.trim() }],
    }));
    setNewTelefono("");
  };

  const eliminarTelefono = (index) => {
    setForm((prev) => ({
      ...prev,
      telefonos: prev.telefonos.filter((_, i) => i !== index),
    }));
  };

  // ===== EMAILS con ContactInfoEditor =====
  const agregarEmail = () => {
    if (!newEmail.trim()) return;
    setForm((prev) => ({
      ...prev,
      emails: [...prev.emails, { email: newEmail.trim() }],
    }));
    setNewEmail("");
  };

  const eliminarEmail = (index) => {
    setForm((prev) => ({
      ...prev,
      emails: prev.emails.filter((_, i) => i !== index),
    }));
  };

  // ===== LUGARES DE ATENCIÓN =====
  const agregarLugarAtencion = () => {
    setForm((prev) => ({
      ...prev,
      lugaresAtencion: [
        ...prev.lugaresAtencion,
        {
          id: Date.now(),
          direccion: "",
          horarios: [],
        },
      ],
    }));
  };

  const eliminarLugarAtencion = (index) => {
    setForm((prev) => ({
      ...prev,
      lugaresAtencion: prev.lugaresAtencion.filter((_, i) => i !== index),
    }));
  };

  const actualizarLugarAtencion = (index, campo, valor) => {
    setForm((prev) => ({
      ...prev,
      lugaresAtencion: prev.lugaresAtencion.map((lugar, i) =>
        i === index ? { ...lugar, [campo]: valor } : lugar
      ),
    }));
  };

  // ===== HORARIOS =====
  const agregarHorario = (lugarIndex) => {
    setForm((prev) => ({
      ...prev,
      lugaresAtencion: prev.lugaresAtencion.map((lugar, i) =>
        i === lugarIndex
          ? {
              ...lugar,
              horarios: [
                ...lugar.horarios,
                {
                  dias: [],
                  horaInicio: "",
                  horaFin: "",
                  duracionMinutos: 30,
                },
              ],
            }
          : lugar
      ),
    }));
  };

  const eliminarHorario = (lugarIndex, horarioIndex) => {
    setForm((prev) => ({
      ...prev,
      lugaresAtencion: prev.lugaresAtencion.map((lugar, i) =>
        i === lugarIndex
          ? {
              ...lugar,
              horarios: lugar.horarios.filter((_, hi) => hi !== horarioIndex),
            }
          : lugar
      ),
    }));
  };

  const actualizarHorario = (lugarIndex, horarioIndex, campo, valor) => {
    setForm((prev) => ({
      ...prev,
      lugaresAtencion: prev.lugaresAtencion.map((lugar, i) =>
        i === lugarIndex
          ? {
              ...lugar,
              horarios: lugar.horarios.map((h, hi) =>
                hi === horarioIndex ? { ...h, [campo]: valor } : h
              ),
            }
          : lugar
      ),
    }));
  };

  // Validaciones
  const validar = () => {
    const errores = {};

    if (!form.cuilCuit.trim()) {
      errores.cuilCuit = "CUIL/CUIT requerido";
    }

    if (!form.nombreCompleto.trim()) {
      errores.nombreCompleto = "Nombre completo requerido";
    }

    if (form.especialidades.length === 0) {
      errores.especialidades = "Debe agregar al menos una especialidad";
    }

    if (form.lugaresAtencion.length === 0) {
      errores.lugaresAtencion = "Debe agregar al menos un lugar de atención";
    }

    // Validar conflictos de horarios dentro de cada lugar
    if (Object.keys(conflictosHorarios).length > 0) {
      errores.conflictosHorarios =
        "Hay conflictos en los horarios de atención que deben resolverse";
    }

    // Validar conflictos de horarios ENTRE diferentes lugares
    if (conflictosEntreLugares.length > 0) {
      errores.conflictosEntreLugares =
        "Hay conflictos de horarios entre diferentes lugares de atención";
    }

    if (
      form.tipo === "Profesional Independiente" &&
      form.vinculaCentro &&
      !form.integraCentroMedicoId
    ) {
      errores.integraCentroMedico = "Debe seleccionar un centro médico";
    }

    return errores;
  };

  const guardar = () => {
    setIntentoGuardar(true);
    const errores = validar();
    if (Object.keys(errores).length > 0) {
      if (errores.conflictosHorarios || errores.conflictosEntreLugares) {
        const mensajes = [];
        if (errores.conflictosHorarios) {
          mensajes.push(
            "- Hay conflictos en los horarios dentro de algunos lugares"
          );
        }
        if (errores.conflictosEntreLugares) {
          mensajes.push(
            "- Hay conflictos de horarios entre diferentes lugares"
          );
        }
        alert(
          "⚠️ No se puede guardar:\n\n" +
            mensajes.join("\n") +
            "\n\nDebe resolver estos conflictos antes de continuar."
        );
      } else {
        alert("Por favor complete todos los campos requeridos");
      }
      return;
    }

    // Sanear payload antes de guardar
    const especialidadesLimpias = (form.especialidades || []).filter(
      (e) => !!e
    );
    const telefonosLimpios = (form.telefonos || []).filter(
      (t) => String(t.numero || "").trim() !== ""
    );
    const emailsLimpios = (form.emails || []).filter(
      (e) => String(e.email || "").trim() !== ""
    );

    const lugaresAtencionLimpios = (form.lugaresAtencion || [])
      .map((l) => {
        const horariosLimpios = (l.horarios || [])
          .filter(
            (h) =>
              Array.isArray(h.dias) &&
              h.dias.length > 0 &&
              String(h.horaInicio || "").trim() !== "" &&
              String(h.horaFin || "").trim() !== ""
          )
          .map((h) => ({
            dias: h.dias,
            horaInicio: h.horaInicio,
            horaFin: h.horaFin,
            duracionMinutos: Number(h.duracionMinutos || 30),
          }));
        return {
          id: l.id,
          direccion: (l.direccion || "").trim(),
          horarios: horariosLimpios,
        };
      })
      .filter(
        (l) => l.direccion !== "" || (l.horarios && l.horarios.length > 0)
      );

    const integraCentroMedicoNormalizado =
      form.tipo === "Profesional Independiente" && form.vinculaCentro
        ? form.integraCentroMedicoId || null
        : null;

    const payload = {
      id: form.id,
      cuilCuit: (form.cuilCuit || "").trim(),
      nombreCompleto: (form.nombreCompleto || "").trim(),
      tipo: form.tipo,
      integraCentroMedicoId: integraCentroMedicoNormalizado,
      especialidades: especialidadesLimpias,
      telefonos: telefonosLimpios,
      emails: emailsLimpios,
      lugaresAtencion: lugaresAtencionLimpios,
      activo: form.activo,
    };

    onGuardar?.(payload);
  };

  const errores = intentoGuardar ? validar() : {};

  return (
    <>
      <Dialog open={abierto} onClose={onCerrar} fullWidth maxWidth="lg">
        <DialogTitle sx={{ fontWeight: 800, color: "#111827" }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <PersonIcon color="primary" />
            <Typography variant="h6">
              {form.id ? "Editar Prestador" : "Agregar Prestador"}
            </Typography>
          </Stack>
        </DialogTitle>

        <DialogContent
          dividers
        >
          {/* Alerta general de conflictos dentro de lugares */}
          {Object.keys(conflictosHorarios).length > 0 && (
            <Alert severity="error" sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                ⚠️ Hay conflictos en los horarios de atención
              </Typography>
              <Typography variant="body2">
                Por favor, revise y corrija los horarios que se solapan antes de
                guardar.
              </Typography>
            </Alert>
          )}

          {/* Alerta de conflictos ENTRE diferentes lugares */}
          {conflictosEntreLugares.length > 0 && (
            <Alert severity="error" sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: 700, mb: 1 }}>
                ⚠️ Conflictos entre diferentes lugares de atención:
              </Typography>
              {conflictosEntreLugares.map((conflicto, idx) => (
                <Typography key={idx} variant="body2" sx={{ ml: 2, mb: 0.5 }}>
                  • <strong>{conflicto.lugar1Dir}</strong> y{" "}
                  <strong>{conflicto.lugar2Dir}</strong> tienen horarios que se
                  solapan el/los día(s){" "}
                  <strong>{conflicto.dias.join(", ")}</strong> (
                  {conflicto.horario1} vs {conflicto.horario2})
                </Typography>
              ))}
              <Typography
                variant="caption"
                sx={{ display: "block", mt: 1, fontStyle: "italic" }}
              >
                Un prestador no puede estar en dos lugares diferentes al mismo
                tiempo.
              </Typography>
            </Alert>
          )}

          <Box sx={{ display: "flex", flexDirection: "column", gap: 3, pt: 1 }}>
            {/* DATOS BÁSICOS */}
            <Box>
              <Typography variant="h6">Datos Básicos</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="CUIL/CUIT"
                    value={form.cuilCuit}
                    onChange={cambiar("cuilCuit")}
                    fullWidth
                    error={!!errores.cuilCuit}
                    helperText={errores.cuilCuit}
                    placeholder="20-12345678-9"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Nombre Completo"
                    value={form.nombreCompleto}
                    onChange={cambiar("nombreCompleto")}
                    fullWidth
                    error={!!errores.nombreCompleto}
                    helperText={errores.nombreCompleto}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Tipo</InputLabel>
                    <Select
                      value={form.tipo}
                      onChange={(e) => {
                        const nuevoTipo = e.target.value;
                        setForm((prev) => ({
                          ...prev,
                          tipo: nuevoTipo,
                          // reset center link if becomes Centro Médico
                          vinculaCentro:
                            nuevoTipo === "Profesional Independiente"
                              ? prev.vinculaCentro
                              : false,
                          integraCentroMedicoId:
                            nuevoTipo === "Profesional Independiente"
                              ? prev.integraCentroMedicoId
                              : null,
                        }));
                      }}
                      label="Tipo"
                    >
                      <MenuItem value="Profesional Independiente">
                        Profesional Independiente
                      </MenuItem>
                      <MenuItem value="Centro Médico">Centro Médico</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                {form.tipo === "Profesional Independiente" && (
                  <Grid item xs={12}>
                    <Box>
                      <Stack
                        direction={{ xs: "column", sm: "row" }}
                        spacing={2}
                        alignItems={{ xs: "flex-start", sm: "center" }}
                      >
                        <FormControlLabel
                          control={
                            <Switch
                              checked={form.vinculaCentro}
                              color="secondary"
                              onChange={(e) =>
                                setForm((prev) => ({
                                  ...prev,
                                  vinculaCentro: e.target.checked,
                                }))
                              }
                            />
                          }
                          label={<Typography>Integra centro médico</Typography>}
                        />

                        {form.vinculaCentro && (
                          <FormControl size="small" sx={{ minWidth: 260 }}>
                            <InputLabel>Centro Médico</InputLabel>
                            <Select
                              value={form.integraCentroMedicoId || ""}
                              label="Centro Médico"
                              onChange={(e) =>
                                setForm((prev) => ({
                                  ...prev,
                                  integraCentroMedicoId: e.target.value,
                                }))
                              }
                            >
                              {centrosMedicos.length === 0 ? (
                                <MenuItem value="" disabled>
                                  No hay centros disponibles
                                </MenuItem>
                              ) : (
                                centrosMedicos.map((c) => (
                                  <MenuItem key={c.id} value={c.id}>
                                    {c.nombreCompleto}
                                  </MenuItem>
                                ))
                              )}
                            </Select>
                          </FormControl>
                        )}
                      </Stack>
                      {intentoGuardar &&
                        form.vinculaCentro &&
                        !form.integraCentroMedicoId && (
                          <FormHelperText error>
                            Debe seleccionar un centro médico
                          </FormHelperText>
                        )}
                    </Box>
                  </Grid>
                )}
              </Grid>
            </Box>

            <Divider />

            {/* ESPECIALIDADES */}
            <Box>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Stack direction="row" spacing={1} alignItems="center">
                  <MedicalServicesIcon color="secondary" />
                  <Typography variant="h6">Especialidades</Typography>
                </Stack>
                <Button
                  variant="outlined"
                  color="primary"
                  size="medium"
                  startIcon={<AddIcon />}
                  onClick={agregarEspecialidad}
                >
                  Agregar Especialidad
                </Button>
              </Box>

              {form.especialidades.map((especialidad, index) => (
                <Box
                  key={index}
                  sx={{
                    mb: 2,
                    display: "flex",
                    gap: 1,
                    alignItems: "flex-start",
                  }}
                >
                  <Box sx={{ flex: 1 }}>
                    <Autocomplete
                      size="small"
                      options={especialidadesDisponibles.filter(
                        (esp) =>
                          !form.especialidades.some(
                            (e, i) => i !== index && e?.id === esp.id
                          )
                      )}
                      getOptionLabel={(option) => option?.nombre || ""}
                      value={especialidad}
                      onChange={(e, newValue) => {
                        actualizarEspecialidad(index, newValue);
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label={`Especialidad ${index + 1}`}
                          placeholder="Seleccionar especialidad..."
                        />
                      )}
                      isOptionEqualToValue={(option, value) =>
                        option?.id === value?.id
                      }
                      noOptionsText="No hay más especialidades disponibles"
                    />
                  </Box>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => eliminarEspecialidad(index)}
                    sx={{ mt: 0.5 }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              ))}

              {form.especialidades.length === 0 && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontStyle: "italic" }}
                >
                  No hay especialidades agregadas. Haga clic en "Agregar
                  Especialidad" para comenzar.
                </Typography>
              )}

              {errores.especialidades && form.especialidades.length === 0 && (
                <Typography
                  variant="caption"
                  color="error"
                  sx={{ mt: 1, display: "block" }}
                >
                  {errores.especialidades}
                </Typography>
              )}
            </Box>

            <Divider />

            {/* TELÉFONOS con ContactInfoEditor */}
            <Box>
              <ContactInfoEditor
                icon={<PhoneIcon color="secondary" />}
                title="Teléfonos"
                items={form.telefonos}
                keyProp="numero"
                newValue={newTelefono}
                placeholder="Número de teléfono (ej: 011-4567-8901)"
                inputType="tel"
                onNewValueChange={setNewTelefono}
                onAdd={agregarTelefono}
                onRemove={eliminarTelefono}
              />
            </Box>

            <Divider />

            {/* EMAILS con ContactInfoEditor */}
            <Box>
              <ContactInfoEditor
                icon={<EmailIcon color="secondary" />}
                title="Emails"
                items={form.emails}
                keyProp="email"
                newValue={newEmail}
                placeholder="Correo electrónico"
                inputType="email"
                onNewValueChange={setNewEmail}
                onAdd={agregarEmail}
                onRemove={eliminarEmail}
              />
            </Box>

            <Divider />

            {/* LUGARES DE ATENCIÓN */}
            <Box>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Stack direction="row" spacing={1} alignItems="center">
                  <LocationOnIcon color="secondary" />
                  <Typography variant="h6">Lugares de Atención</Typography>
                </Stack>
                <Button
                  variant="outlined"
                  color="primary"
                  size="medium"
                  startIcon={<AddIcon />}
                  onClick={agregarLugarAtencion}
                >
                  Agregar Lugar
                </Button>
              </Box>

              {errores.lugaresAtencion && form.lugaresAtencion.length === 0 && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {errores.lugaresAtencion}
                </Alert>
              )}

              {form.lugaresAtencion.map((lugar, lugarIndex) => (
                <Card
                  key={lugarIndex}
                  sx={{ mb: 2, border: "2px solid #e0e0e0" }}
                >
                  <CardContent>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 2,
                      }}
                    >
                      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                        Lugar #{lugarIndex + 1}
                      </Typography>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => eliminarLugarAtencion(lugarIndex)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>

                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={8}>
                        <TextField
                          label="Dirección"
                          value={lugar.direccion}
                          onChange={(e) =>
                            actualizarLugarAtencion(
                              lugarIndex,
                              "direccion",
                              e.target.value
                            )
                          }
                          fullWidth
                          placeholder="Avenida Vergara 1908, CABA"
                        />
                      </Grid>
                    </Grid>

                    {!soloDirecciones && (
                      <>
                        <Divider sx={{ my: 2 }} />
                        {/* Horarios del lugar - se oculta si soloDirecciones es true */}
                        <Typography variant="body2" color="text.secondary">
                          Los horarios ahora se gestionan desde el modal
                          dedicado.
                        </Typography>
                      </>
                    )}
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Box>
        </DialogContent>

        <DialogActions>
          <Button color="secondary" variant="outlined" onClick={onCerrar}>
            CANCELAR
          </Button>
          <Button variant="contained" color="secondary" onClick={guardar}>
            {form.id ? "GUARDAR CAMBIOS" : "CREAR PRESTADOR"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
