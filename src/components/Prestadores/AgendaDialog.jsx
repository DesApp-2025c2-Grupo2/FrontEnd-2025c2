import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Divider,
  Card,
} from "@mui/material";

import { useEffect, useState, useMemo } from "react";
import AgendaHorarioItem from "./AgendaHorarioItem";
import AgendaHorarioForm from "./AgendaHorarioForm";

export default function AgendaDialog({
  open,
  onClose,
  prestador,
  prestadores = [],
  onSaveAgenda,
}) {
  const [agendas, setAgendas] = useState([]);
  const [editingHorario, setEditingHorario] = useState(null);

  // Estado para bloquear doble click
  const [saving, setSaving] = useState(false);

  // Inicializar agendas a partir del prestador
  useEffect(() => {
    if (!prestador) {
      setAgendas([]);
      return;
    }

    const mapped = (prestador.agendas || []).map((ag) => ({
      ...ag,
      horarios: (ag.horarios || []).map((h) => ({
        ...h,
        agendaId: ag.id,
        direccionAtencion: ag.direccionAtencion,
      })),
    }));

    setAgendas(mapped);
  }, [prestador]);

  // Profesionales del centro: se derivan desde TODOS los prestadores por centroId
  const profesionalesCentro = useMemo(() => {
    if (!prestador || prestador.tipo !== "Centro Médico") return [];

    return (prestadores || [])
      .filter((p) => p.centroId === prestador.id)
      .map((p) => ({
        id: p.id,
        nombreCompleto: p.nombreCompleto,
        especialidades: p.especialidades || [],
      }));
  }, [prestador, prestadores]);

  // ------------------------------------------
  //  AGREGAR HORARIO
  // ------------------------------------------
  const handleAgregarHorario = (agendaId) => {
    const agenda = agendas.find((a) => a.id === agendaId);

    setEditingHorario({
      id: 0,
      agendaId,
      diasAtencion: [],
      horaInicio: "",
      horaFin: "",
      duracionMinutos: 30,
      especialidad: null,
      profesionalAsignado: null,
      direccionAtencion: agenda?.direccionAtencion || "",
      especialidadesDisponibles: prestador?.especialidades || [],
      profesionalesDisponibles: profesionalesCentro,
      editIndex: null,
    });
  };

  const handleSaveHorario = (horario) => {
    setAgendas((prev) =>
      prev.map((ag) =>
        ag.id === horario.agendaId
          ? { ...ag, horarios: [...(ag.horarios || []), horario] }
          : ag
      )
    );

    setEditingHorario(null);
  };

  // ------------------------------------------
  //  EDITAR HORARIO
  // ------------------------------------------
  const handleEditHorario = (agendaId, horarioIndex) => {
    const ag = agendas.find((a) => a.id === agendaId);
    if (!ag) return;

    const h = ag.horarios[horarioIndex];
    if (!h) return;

    setEditingHorario({
      ...h,
      agendaId,
      especialidadesDisponibles: prestador?.especialidades || [],
      profesionalesDisponibles: profesionalesCentro,
      editIndex: horarioIndex,
    });
  };

  const handleSaveHorarioEdit = (horario) => {
    setAgendas((prev) =>
      prev.map((ag) =>
        ag.id === horario.agendaId
          ? {
              ...ag,
              horarios: ag.horarios.map((h, i) =>
                i === editingHorario.editIndex ? horario : h
              ),
            }
          : ag
      )
    );

    setEditingHorario(null);
  };

  // ------------------------------------------
  //  ELIMINAR HORARIO
  // ------------------------------------------
  const handleDeleteHorario = (agendaId, index) => {
    setAgendas((prev) =>
      prev.map((ag) =>
        ag.id === agendaId
          ? {
              ...ag,
              horarios: ag.horarios.filter((_, i) => i !== index),
            }
          : ag
      )
    );
  };

  // ------------------------------------------
  //  GUARDAR TODA LA AGENDA (CON PROTECCIÓN)
  // ------------------------------------------
  const handleSave = async () => {
    if (saving) return;
    setSaving(true);

    const payloads = agendas.map((ag) => ({
      id: ag.id,
      horariosAtencion: (ag.horarios || []).map((h) => ({
        id: h.id,
        diasAtencion: (h.diasAtencion || []).map((d) => ({
          id: d.id || 0,
          dia: d.dia,
        })),
        horaInicio: h.horaInicio,
        horaFin: h.horaFin,
        duracionMinutos: h.duracionMinutos,
        especialidad: h.especialidad
          ? { id: h.especialidad.id, nombre: h.especialidad.nombre }
          : null,
        profesionalAsignado: h.profesionalAsignado
          ? {
              id: h.profesionalAsignado.id,
              nombreCompleto: h.profesionalAsignado.nombreCompleto,
            }
          : null,
      })),
    }));

    await onSaveAgenda(payloads);

    setSaving(false);
  };

  return (
    <Dialog
      open={open}
      onClose={saving ? null : onClose}
      fullWidth
      maxWidth="md"
    >
      <DialogTitle>Agendas de {prestador?.nombreCompleto}</DialogTitle>

      <DialogContent dividers>
        {agendas.map((agenda) => (
          <Card key={agenda.id} sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              {agenda.direccionAtencion}
            </Typography>

            <Divider sx={{ mb: 2 }} />

            {(agenda.horarios || []).map((h, index) => (
              <AgendaHorarioItem
                key={index}
                data={h}
                agendaId={agenda.id}
                index={index}
                onEdit={() => handleEditHorario(agenda.id, index)}
                onDelete={() => handleDeleteHorario(agenda.id, index)}
              />
            ))}

            <Button
              variant="outlined"
              sx={{ mt: 2 }}
              onClick={() => handleAgregarHorario(agenda.id)}
              disabled={saving}
            >
              Agregar horario
            </Button>
          </Card>
        ))}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={saving}>
          Cancelar
        </Button>
        <Button variant="contained" onClick={handleSave} disabled={saving}>
          {saving ? "Guardando..." : "Guardar cambios"}
        </Button>
      </DialogActions>

      {editingHorario && (
        <AgendaHorarioForm
          data={editingHorario}
          onClose={() => (saving ? null : setEditingHorario(null))}
          onSave={(form) =>
            editingHorario.editIndex != null
              ? handleSaveHorarioEdit(form)
              : handleSaveHorario(form)
          }
        />
      )}
    </Dialog>
  );
}
