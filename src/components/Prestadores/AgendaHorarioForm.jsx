import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  MenuItem,
  Typography,
} from "@mui/material";

import { useState, useEffect } from "react";
import AgendaDiasSelector from "./AgendaDiasSelector";

// ---------------------------------------------------------
//  Normalización de horas
// ---------------------------------------------------------
const normalizarParaInput = (h) => {
  if (!h) return "";
  return h.length === 8 ? h.substring(0, 5) : h;
};

const normalizarParaBackend = (h) => {
  if (!h) return "00:00:00";
  if (h.length === 5) return h + ":00";
  return h;
};

// Comparación de horas en formato HH:mm u HH:mm:ss
const normalizarParaComparar = (h) => {
  if (!h) return "";
  return h.length === 5 ? `${h}:00` : h;
};

const nombreDiaCorto = (d) => {
  switch (d) {
    case 1:
      return "Lunes";
    case 2:
      return "Martes";
    case 3:
      return "Miércoles";
    case 4:
      return "Jueves";
    case 5:
      return "Viernes";
    case 6:
      return "Sábado";
    case 7:
      return "Domingo";
    default:
      return String(d);
  }
};

export default function AgendaHorarioForm({
  data,
  onSave,
  onClose,
  horariosExistentes = [],
}) {
  const [form, setForm] = useState({
    ...data,
    horaInicio: normalizarParaInput(data.horaInicio),
    horaFin: normalizarParaInput(data.horaFin),
  });

  const [errores, setErrores] = useState({});

  const profesionales = data.profesionalesDisponibles || [];
  const especialidadesPrestador = data.especialidadesDisponibles || [];

  const [especialidadesFiltradas, setEspecialidadesFiltradas] = useState(
    especialidadesPrestador
  );

  useEffect(() => {
    if (!form.profesionalAsignado) {
      setEspecialidadesFiltradas(especialidadesPrestador);
      return;
    }

    const profesional = profesionales.find(
      (p) => p.id === form.profesionalAsignado.id
    );

    if (!profesional || !profesional.especialidades) {
      setEspecialidadesFiltradas(especialidadesPrestador);
      return;
    }

    const idsProfesional = new Set(profesional.especialidades.map((x) => x.id));

    setEspecialidadesFiltradas(
      especialidadesPrestador.filter((e) => idsProfesional.has(e.id))
    );
  }, [form.profesionalAsignado]);

  const cambiar = (key, value) =>
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));

  // ---------------------------------------------------------
  // VALIDACIÓN
  // ---------------------------------------------------------
  const validar = () => {
    const e = {};
    const esCentroConProfesionales = profesionales.length > 0;

    if (esCentroConProfesionales && !form.profesionalAsignado)
      e.profesionalAsignado = "Debe seleccionar un profesional";

    if (!form.especialidad?.id)
      e.especialidad = "Debe seleccionar una especialidad";

    if (!form.diasAtencion || form.diasAtencion.length === 0)
      e.diasAtencion = "Debe seleccionar al menos un día";

    if (!form.horaInicio) e.horaInicio = "Debe seleccionar una hora de inicio";

    if (!form.horaFin) e.horaFin = "Debe seleccionar una hora de fin";

    if (form.horaInicio && form.horaFin) {
      if (form.horaInicio >= form.horaFin)
        e.horas = "La hora de inicio debe ser menor que la hora de fin";
    }

    if (!form.duracionMinutos || form.duracionMinutos <= 0)
      e.duracionMinutos = "La duración debe ser mayor a 0";

    // Validar que no haya horarios que se solapen
    if (
      !e.horas && // solo si no hay error previo de rango
      Array.isArray(horariosExistentes) &&
      horariosExistentes.length > 0 &&
      form.diasAtencion &&
      form.diasAtencion.length > 0
    ) {
      const diasForm = form.diasAtencion.map((d) => d.dia);
      const hiForm = normalizarParaComparar(form.horaInicio);
      const hfForm = normalizarParaComparar(form.horaFin);

      const conflictos = [];

      const seSolapaConOtro = horariosExistentes.some((h) => {
        // Si es centro con varios profesionales, filtrar por profesionalAsignado
        if (esCentroConProfesionales) {
          if (!form.profesionalAsignado) return false;
          if (!h.profesionalAsignado) return false;
          if (h.profesionalAsignado.id !== form.profesionalAsignado.id)
            return false;
        }

        const diasOtro = (h.diasAtencion || []).map((d) => d.dia);
        const mismoDia = diasForm.some((d) => diasOtro.includes(d));
        if (!mismoDia) return false;

        const hiOtro = normalizarParaComparar(h.horaInicio);
        const hfOtro = normalizarParaComparar(h.horaFin);

        if (!hiOtro || !hfOtro) return false;

        // Intervalos [hiForm, hfForm) y [hiOtro, hfOtro) se solapan si:
        // hiForm < hfOtro && hiOtro < hfForm
        const overlap = hiForm < hfOtro && hiOtro < hfForm;
        if (overlap) {
          const diasOtroSet = new Set((h.diasAtencion || []).map((d) => d.dia));
          const diasCruce = diasForm.filter((d) => diasOtroSet.has(d));
          conflictos.push({
            dias: diasCruce,
            hi: hiOtro,
            hf: hfOtro,
          });
        }
        return overlap;
      });

      if (seSolapaConOtro) {
        const detalleLista = conflictos
          .map((c) => {
            const diasTexto = c.dias.map(nombreDiaCorto).join(", ");
            const hiConf = normalizarParaInput(c.hi || "");
            const hfConf = normalizarParaInput(c.hf || "");
            const rango =
              hiConf && hfConf ? `${hiConf} a ${hfConf}` : "(hora desconocida)";
            return `- ${diasTexto}: ${rango}`;
          })
          .join("\n");

        e.horas = esCentroConProfesionales
          ? `El profesional ya tiene horarios que se solapan:\n${detalleLista}`
          : `Ya existen horarios que se solapan:\n${detalleLista}`;
      }
    }

    setErrores(e);
    return Object.keys(e).length === 0;
  };

  const handleGuardar = () => {
    if (!validar()) return;

    onSave({
      ...form,
      horaInicio: normalizarParaBackend(form.horaInicio),
      horaFin: normalizarParaBackend(form.horaFin),
    });
  };

  return (
    <Dialog open fullWidth maxWidth="sm" onClose={onClose}>
      <DialogTitle>
        {form.id === 0 ? "Agregar horario" : "Editar horario"}
      </DialogTitle>

      <DialogContent dividers>
        <Typography variant="body2" sx={{ mb: 2, fontWeight: "bold" }}>
          {form.direccionAtencion}
        </Typography>

        {/* Profesional asignado */}
        {profesionales.length > 0 && (
          <Box sx={{ mb: 1 }}>
            <TextField
              fullWidth
              select
              label="Profesional asignado"
              value={form.profesionalAsignado?.id || ""}
              onChange={(e) => {
                const id = Number(e.target.value);
                cambiar(
                  "profesionalAsignado",
                  profesionales.find((p) => p.id === id)
                );
              }}
              error={!!errores.profesionalAsignado}
            >
              {profesionales.map((p) => (
                <MenuItem key={p.id} value={p.id}>
                  {p.nombreCompleto}
                </MenuItem>
              ))}
            </TextField>
            {errores.profesionalAsignado && (
              <Typography color="error" variant="caption">
                {errores.profesionalAsignado}
              </Typography>
            )}
          </Box>
        )}

        {/* Especialidad */}
        <Box sx={{ mb: 1 }}>
          <TextField
            fullWidth
            select
            label="Especialidad"
            value={form.especialidad?.id || ""}
            onChange={(e) => {
              const id = Number(e.target.value);
              const esp = especialidadesFiltradas.find((x) => x.id === id);
              cambiar("especialidad", { id, nombre: esp?.nombre || "" });
            }}
            error={!!errores.especialidad}
          >
            {especialidadesFiltradas.map((e) => (
              <MenuItem key={e.id} value={e.id}>
                {e.nombre}
              </MenuItem>
            ))}
          </TextField>
          {errores.especialidad && (
            <Typography color="error" variant="caption">
              {errores.especialidad}
            </Typography>
          )}
        </Box>

        {/* Días */}
        <AgendaDiasSelector
          value={form.diasAtencion}
          onChange={(v) => cambiar("diasAtencion", v)}
        />
        {errores.diasAtencion && (
          <Typography color="error" variant="caption">
            {errores.diasAtencion}
          </Typography>
        )}

        {/* Horas */}
        <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
          <TextField
            fullWidth
            type="time"
            label="Inicio"
            value={form.horaInicio}
            onChange={(e) => cambiar("horaInicio", e.target.value)}
            InputLabelProps={{ shrink: true }}
            error={!!errores.horaInicio || !!errores.horas}
          />

          <TextField
            fullWidth
            type="time"
            label="Fin"
            value={form.horaFin}
            onChange={(e) => cambiar("horaFin", e.target.value)}
            InputLabelProps={{ shrink: true }}
            error={!!errores.horaFin || !!errores.horas}
          />
        </Box>

        {(errores.horaInicio || errores.horaFin || errores.horas) && (
          <Typography
            color="error"
            variant="caption"
            sx={{ whiteSpace: "pre-line" }}
          >
            {errores.horaInicio || errores.horaFin || errores.horas}
          </Typography>
        )}

        {/* Duración */}
        <Box sx={{ mt: 2 }}>
          <TextField
            fullWidth
            type="number"
            label="Duración (minutos)"
            value={form.duracionMinutos}
            onChange={(e) => cambiar("duracionMinutos", Number(e.target.value))}
            error={!!errores.duracionMinutos}
          />
          {errores.duracionMinutos && (
            <Typography color="error" variant="caption">
              {errores.duracionMinutos}
            </Typography>
          )}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" onClick={handleGuardar}>
          Guardar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
