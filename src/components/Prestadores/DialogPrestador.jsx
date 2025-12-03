import { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Divider,
} from "@mui/material";

import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import HomeIcon from "@mui/icons-material/Home";

import ContactInfoEditor from "../ContactInfoEditor";
import EspecialidadesSelector from "./EspecialidadesSelector";
import DireccionesEditor from "../Afiliados/DireccionesEditor";
import {
  soloLetrasYEspacios,
  soloNumeros,
} from "../../utilidades/input-filters";

import {
  cargarEspecialidades,
  selectEspecialidades,
} from "../../store/especialidadesSlice";

import { tiposDocumento } from "../../utilidades/tipoDocumento";

export default function DialogPrestador({
  open,
  prestador,
  prestadores = [],
  modoInicialVista = true,
  onClose,
  onSave,
}) {
  const dispatch = useDispatch();
  const especialidadesFromStore = useSelector(selectEspecialidades);

  const [modoVista, setModoVista] = useState(true);

  const [errores, setErrores] = useState({});

  const [saving, setSaving] = useState(false); // 🔐 NUEVO: estado anti-doble-click

  const [form, setForm] = useState({
    nombreCompleto: "",
    cuilCuit: "",
    tipoDocumento: 4,
    tipo: "Profesional Independiente",
    telefonos: [],
    emails: [],
    direcciones: [],
    especialidadesIds: [],
    integraCentro: false,
    centroId: null,
    documentacion: { id: 0, tipoDocumento: 4, numero: "" },
  });

  const [newTel, setNewTel] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newDireccion, setNewDireccion] = useState({
    calle: "",
    altura: "",
    piso: "",
    departamento: "",
    provinciaCiudad: "",
    codigoPostal: "",
  });

  useEffect(() => {
    if (open) dispatch(cargarEspecialidades());
  }, [open, dispatch]);

  const centrosDisponibles = useMemo(
    () => prestadores.filter((p) => p.tipo === "Centro Médico"),
    [prestadores]
  );

  useEffect(() => {
    if (!open) return;

    setErrores({});

    if (prestador) {
      setModoVista(modoInicialVista);

      setForm({
        nombreCompleto: prestador.nombreCompleto || "",
        cuilCuit: prestador.cuilCuit || prestador.documentacion?.numero || "",
        tipoDocumento:
          prestador.tipoDocumento ||
          prestador.documentacion?.tipoDocumento ||
          4,
        tipo: prestador.tipo || "Profesional Independiente",
        telefonos: prestador.telefonos || [],
        emails: prestador.emails || [],
        direcciones: prestador.direcciones || [],
        especialidadesIds: prestador.especialidadesIds || [],
        integraCentro: !!prestador.centroId,
        centroId: prestador.centroId || null,

        documentacion: {
          id: prestador.documentacion?.id ?? 0,
          tipoDocumento:
            prestador.documentacion?.tipoDocumento ||
            prestador.tipoDocumento ||
            4,
          numero: prestador.cuilCuit || prestador.documentacion?.numero || "",
        },
      });
    } else {
      setModoVista(false);

      setForm({
        nombreCompleto: "",
        cuilCuit: "",
        tipoDocumento: 4,
        tipo: "Profesional Independiente",
        telefonos: [],
        emails: [],
        direcciones: [],
        especialidadesIds: [],
        integraCentro: false,
        centroId: null,
        documentacion: {
          id: 0,
          tipoDocumento: 4,
          numero: "",
        },
      });
    }
  }, [open, prestador, modoInicialVista]);

  const setField = (f, v) => setForm((prev) => ({ ...prev, [f]: v }));

  function validar() {
    const e = {};

    // Nombre obligatorio y sin números
    const nombre = form.nombreCompleto?.trim() || "";
    if (!nombre) {
      e.nombreCompleto = "El nombre es obligatorio";
    } else if (/\d/.test(nombre)) {
      e.nombreCompleto = "El nombre no debe contener números";
    }

    if (!form.tipoDocumento)
      e.tipoDocumento = "Debe seleccionar el tipo de documento";

    // CUIL/CUIT obligatorio y de exactamente 11 dígitos numéricos
    const cuilDigits = (form.cuilCuit || "").replace(/\D/g, "");
    if (!cuilDigits) {
      e.cuilCuit = "El CUIL/CUIT es obligatorio";
    } else if (cuilDigits.length !== 11) {
      e.cuilCuit = "El CUIL/CUIT debe tener exactamente 11 dígitos numéricos";
    }

    if (!form.tipo) e.tipo = "Debe seleccionar el tipo";

    // Mínimo una especialidad
    if (!form.especialidadesIds.length)
      e.especialidades = "Debe seleccionar al menos una especialidad";

    // Debe existir al menos una dirección (los campos obligatorios se validan en DireccionesEditor)
    if (!form.direcciones.length)
      e.direcciones = "Debe agregar al menos una dirección";

    // Teléfonos: si hay, deben ser de 8 o 10 dígitos numéricos
    if (Array.isArray(form.telefonos) && form.telefonos.length > 0) {
      const telefonoInvalido = form.telefonos.some((t) => {
        const valor =
          (typeof t === "string" ? t : t?.numero ?? "").toString() || "";
        const digits = valor.replace(/\D/g, "");
        return !(digits.length === 8 || digits.length === 10);
      });
      if (telefonoInvalido) {
        e.telefonos =
          "Cada teléfono debe tener exactamente 8 o 10 dígitos numéricos";
      }
    }

    // Emails: si hay, cada uno debe contener un '@'
    if (Array.isArray(form.emails) && form.emails.length > 0) {
      const emailInvalido = form.emails.some((emailItem) => {
        const valor =
          (typeof emailItem === "string"
            ? emailItem
            : emailItem?.correo ?? ""
          ).toString() || "";
        return !valor.includes("@");
      });
      if (emailInvalido) {
        e.emails = "Todos los emails deben contener un '@'";
      }
    }

    setErrores(e);
    return Object.keys(e).length === 0;
  }

  const renderVista = () => (
    <Box sx={{ pt: 2 }}>
      <Typography variant="h6">{form.nombreCompleto}</Typography>

      <Typography variant="body2" sx={{ mb: 1 }}>
        <strong>Tipo Documento:</strong> {tiposDocumento[form.tipoDocumento]}
      </Typography>

      <Typography variant="body2" sx={{ mb: 1 }}>
        <strong>Número:</strong> {form.cuilCuit}
      </Typography>

      <Typography variant="body2" sx={{ mb: 1 }}>
        <strong>Tipo Prestador:</strong> {form.tipo}
      </Typography>
      {form.centroId && prestador?.centro && (
        <Typography variant="body2" sx={{ mb: 1 }}>
          <strong>Centro Médico:</strong> {prestador.centro.nombreCompleto}
        </Typography>
      )}
      {form.tipo === "Centro Médico" &&
        prestador?.profesionales?.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography sx={{ fontWeight: "bold" }}>
              Profesionales del centro:
            </Typography>

            {prestador.profesionales.map((p) => (
              <Typography key={p.id} sx={{ ml: 1 }}>
                • {p.nombreCompleto}
              </Typography>
            ))}
          </Box>
        )}

      <Divider sx={{ my: 2 }} />

      <Box sx={{ mb: 2 }}>
        <Typography sx={{ fontWeight: "bold" }}>Teléfonos:</Typography>
        {form.telefonos.length ? (
          form.telefonos.map((t, i) => (
            <Box key={i} sx={{ display: "flex", gap: 1 }}>
              <PhoneIcon fontSize="small" color="primary" />
              <Typography>{t.numero ?? t}</Typography>
            </Box>
          ))
        ) : (
          <Typography color="textSecondary">Sin teléfonos</Typography>
        )}
      </Box>

      <Box sx={{ mb: 2 }}>
        <Typography sx={{ fontWeight: "bold" }}>Emails:</Typography>
        {form.emails.length ? (
          form.emails.map((e, i) => (
            <Box key={i} sx={{ display: "flex", gap: 1 }}>
              <EmailIcon fontSize="small" color="primary" />
              <Typography>{e.correo ?? e}</Typography>
            </Box>
          ))
        ) : (
          <Typography color="textSecondary">Sin emails</Typography>
        )}
      </Box>

      <Box sx={{ mb: 2 }}>
        <Typography sx={{ fontWeight: "bold" }}>Direcciones:</Typography>
        {form.direcciones.length ? (
          form.direcciones.map((d, i) => (
            <Box key={i} sx={{ display: "flex", gap: 1 }}>
              <HomeIcon fontSize="small" color="primary" />
              <Typography>
                {d.calle} {d.altura}, {d.provinciaCiudad} — CP {d.codigoPostal}
              </Typography>
            </Box>
          ))
        ) : (
          <Typography color="textSecondary">Sin direcciones</Typography>
        )}
      </Box>

      <Box sx={{ mb: 2 }}>
        <Typography sx={{ fontWeight: "bold" }}>Especialidades:</Typography>
        {form.especialidadesIds.length ? (
          form.especialidadesIds.map((id) => {
            const esp = especialidadesFromStore.find((e) => e.id === id);
            return (
              <Typography key={id}>• {esp?.nombre || "Desconocida"}</Typography>
            );
          })
        ) : (
          <Typography color="textSecondary">Sin especialidades</Typography>
        )}
      </Box>
    </Box>
  );

  const renderEdicion = () => (
    <Box sx={{ pt: 2 }}>
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth error={!!errores.tipoDocumento}>
            <InputLabel>Tipo de Documento *</InputLabel>
            <Select
              label="Tipo de Documento *"
              value={form.tipoDocumento}
              disabled={saving}
              onChange={(e) => {
                setField("tipoDocumento", e.target.value);
                setField("documentacion", {
                  ...form.documentacion,
                  tipoDocumento: e.target.value,
                });
              }}
            >
              {Object.entries(tiposDocumento)
                .filter(([key]) => key === "4" || key === "6")
                .map(([key, value]) => (
                  <MenuItem key={key} value={Number(key)}>
                    {value}
                  </MenuItem>
                ))}
            </Select>
            {errores.tipoDocumento && (
              <Typography variant="caption" color="error">
                {errores.tipoDocumento}
              </Typography>
            )}
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            disabled={saving}
            label="Número *"
            value={form.cuilCuit}
            onChange={(e) => {
              const soloNums = soloNumeros(e.target.value).slice(0, 11);
              setField("cuilCuit", soloNums);
              setField("documentacion", {
                ...form.documentacion,
                numero: soloNums,
              });
            }}
            error={!!errores.cuilCuit}
            helperText={errores.cuilCuit}
          />
        </Grid>
      </Grid>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            disabled={saving}
            label="Nombre Completo *"
            value={form.nombreCompleto}
            onChange={(e) =>
              setField("nombreCompleto", soloLetrasYEspacios(e.target.value))
            }
            error={!!errores.nombreCompleto}
            helperText={errores.nombreCompleto}
          />
        </Grid>
      </Grid>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12}>
          <FormControl fullWidth error={!!errores.tipo}>
            <InputLabel>Tipo *</InputLabel>
            <Select
              label="Tipo *"
              value={form.tipo}
              disabled={!!prestador || saving}
              onChange={(e) => setField("tipo", e.target.value)}
            >
              <MenuItem value="Profesional Independiente">
                Profesional Independiente
              </MenuItem>
              <MenuItem value="Centro Médico">Centro Médico</MenuItem>
            </Select>
            {errores.tipo && (
              <Typography color="error" variant="caption">
                {errores.tipo}
              </Typography>
            )}
          </FormControl>
        </Grid>

        {form.tipo === "Profesional Independiente" && (
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={form.integraCentro}
                  disabled={saving}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setField("integraCentro", checked);
                    // Si deja de integrar un centro, limpiar la referencia
                    if (!checked) {
                      setField("centroId", null);
                    }
                  }}
                />
              }
              label="Integra un Centro Médico"
            />
          </Grid>
        )}
      </Grid>

      {form.tipo === "Profesional Independiente" && form.integraCentro && (
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Centro Médico</InputLabel>
              <Select
                value={form.centroId || ""}
                disabled={saving}
                onChange={(e) => {
                  const value = e.target.value;
                  // Normalizar: string vacío -> null
                  setField("centroId", value === "" ? null : value);
                }}
              >
                <MenuItem value="">Seleccione</MenuItem>
                {centrosDisponibles.map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.nombreCompleto}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      )}

      <Box sx={{ mb: 2 }}>
        <EspecialidadesSelector
          items={form.especialidadesIds.map((id) => {
            const esp = especialidadesFromStore.find((e) => e.id === id);
            return esp
              ? { id: esp.id, nombre: esp.nombre }
              : { id, nombre: "?" };
          })}
          opciones={especialidadesFromStore}
          disabled={saving}
          onAdd={(id) =>
            setField("especialidadesIds", [...form.especialidadesIds, id])
          }
          onRemove={(idx) =>
            setField(
              "especialidadesIds",
              form.especialidadesIds.filter((_, i) => i !== idx)
            )
          }
        />

        {errores.especialidades && (
          <Typography color="error" variant="caption">
            {errores.especialidades}
          </Typography>
        )}
      </Box>

      <Box sx={{ mb: 2 }}>
        <ContactInfoEditor
          icon={<PhoneIcon sx={{ mr: 1 }} color="primary" />}
          title="Teléfonos"
          disabled={saving}
          items={form.telefonos}
          keyProp="numero"
          placeholder="Agregar teléfonos"
          newValue={newTel}
          onNewValueChange={(valor) => setNewTel(soloNumeros(valor))}
          onAdd={() => {
            const limpio = soloNumeros(newTel || "");
            if (!limpio) return;

            // Validar longitud 8 o 10 dígitos
            if (!(limpio.length === 8 || limpio.length === 10)) {
              setErrores((prev) => ({
                ...prev,
                telefonos:
                  "Cada teléfono debe tener exactamente 8 o 10 dígitos numéricos",
              }));
              return;
            }

            setField("telefonos", [...form.telefonos, { numero: limpio }]);
            setErrores((prev) => ({ ...prev, telefonos: undefined }));
            setNewTel("");
          }}
          onRemove={(idx) =>
            setField(
              "telefonos",
              form.telefonos.filter((_, i) => i !== idx)
            )
          }
        />
        {errores.telefonos && (
          <Typography color="error" variant="caption">
            {errores.telefonos}
          </Typography>
        )}
      </Box>

      <Box sx={{ mb: 2 }}>
        <ContactInfoEditor
          icon={<EmailIcon sx={{ mr: 1 }} color="primary" />}
          title="Emails"
          disabled={saving}
          items={form.emails}
          placeholder="Agregar email"
          keyProp="correo"
          newValue={newEmail}
          inputType="email"
          onNewValueChange={setNewEmail}
          onAdd={() => {
            const valor = (newEmail || "").trim();
            if (!valor) return;

            if (!valor.includes("@")) {
              setErrores((prev) => ({
                ...prev,
                emails: "El email debe contener un '@'",
              }));
              return;
            }

            setField("emails", [...form.emails, { correo: valor }]);
            setErrores((prev) => ({ ...prev, emails: undefined }));
            setNewEmail("");
          }}
          onRemove={(idx) =>
            setField(
              "emails",
              form.emails.filter((_, i) => i !== idx)
            )
          }
        />
        {errores.emails && (
          <Typography color="error" variant="caption">
            {errores.emails}
          </Typography>
        )}
      </Box>

      <Box sx={{ mb: 1 }}>
        <DireccionesEditor
          items={form.direcciones}
          disabled={saving}
          newValue={newDireccion}
          onNewValueChange={setNewDireccion}
          onAdd={(d) => setField("direcciones", [...form.direcciones, d])}
          onRemove={(idx) =>
            setField(
              "direcciones",
              form.direcciones.filter((_, i) => i !== idx)
            )
          }
        />

        {errores.direcciones && (
          <Typography color="error" variant="caption">
            {errores.direcciones}
          </Typography>
        )}
      </Box>
    </Box>
  );

  // 🔐 PREVENT CLOSE WHILE SAVING
  const handleRequestClose = () => {
    if (saving) return;
    onClose();
  };

  const handleSaveClick = async () => {
    if (!validar()) return;
    if (saving) return;

    setSaving(true);
    await onSave(form);
    setSaving(false);
  };

  return (
    <Dialog open={open} onClose={handleRequestClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {prestador
          ? modoVista
            ? "Detalle del Prestador"
            : "Editar Prestador"
          : "Nuevo Prestador"}
      </DialogTitle>

      <DialogContent>
        {modoVista ? renderVista() : renderEdicion()}
      </DialogContent>

      <DialogActions>
        <Button
          variant="outlined"
          onClick={handleRequestClose}
          disabled={saving}
        >
          {modoVista ? "Cerrar" : "Cancelar"}
        </Button>

        {!modoVista && (
          <Button
            variant="contained"
            color="primary"
            disabled={saving}
            onClick={handleSaveClick}
          >
            {saving
              ? "Guardando..."
              : prestador
              ? "Guardar Cambios"
              : "Crear Prestador"}
          </Button>
        )}

        {modoVista && prestador && (
          <Button
            variant="contained"
            color="secondary"
            disabled={saving}
            onClick={() => setModoVista(false)}
          >
            Editar
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
