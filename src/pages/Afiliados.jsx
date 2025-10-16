// src/pages/Afiliados.jsx
import { useState, useEffect, useCallback } from "react";
import { useSelector, useDispatch, shallowEqual } from "react-redux";
import { Box, Typography, Fab, Snackbar, Alert } from "@mui/material";
import { Add as AddIcon, Person as PersonIcon } from "@mui/icons-material";

import AdvancedSearchBar from "../components/Afiliados/AdvancedSearchBar";
import AfiliadoCard from "../components/Afiliados/AfiliadosCard";
import AfiliadoFormDialog from "../components/Afiliados/AfiliadoFormDialog";
import PersonaFormDialog from "../components/Afiliados/PersonaFormDialog";
import BajaDialog from "../components/Afiliados/BajaDialog";
import AltaDialog from "../components/Afiliados/AltaDialog";

import {
  fetchAfiliados,
  createAfiliado,
  updateAfiliado,
} from "../store/afiliadosSlice";

import { selectSituaciones } from "../store/situacionesTerapeuticasSlice";
import { cargarPlanes, selectPlanes } from "../store/planesSlice";

const startOfDay = (d) => {
  const dt = new Date(d);
  dt.setHours(0, 0, 0, 0);
  return dt;
};
const hoyISO = () => new Date().toISOString().split("T")[0];

const estaActivo = (alta, baja) => {
  const hoy = startOfDay(new Date());
  if (baja) {
    const fechaBaja = startOfDay(new Date(baja));
    if (fechaBaja <= hoy) return false;
  }
  if (alta) {
    const fechaAlta = startOfDay(new Date(alta));
    if (fechaAlta > hoy) return false;
  }
  return true;
};

const tieneBajaProgramada = (baja) => {
  if (!baja) return false;
  return startOfDay(new Date(baja)) > startOfDay(new Date());
};

const tieneAltaProgramada = (alta) => {
  if (!alta) return false;
  return startOfDay(new Date(alta)) > startOfDay(new Date());
};

// helpers puros (no usan estado)
const getTitularDelAfiliado = (afiliado) => {
  if (!afiliado) return null;
  const titularId = afiliado.titularID ?? afiliado.titularId;
  if (!afiliado.integrantes) return null;
  return afiliado.integrantes.find((i) => String(i.id) === String(titularId));
};

const getFamiliaresDelAfiliado = (afiliado) => {
  if (!afiliado || !afiliado.integrantes) return [];
  const titularId = afiliado.titularID ?? afiliado.titularId;
  return afiliado.integrantes.filter((i) => String(i.id) !== String(titularId));
};

const getPlanMedicoNombre = (planMedicoId, planesMedicos) => {
  const plan = (planesMedicos || []).find(
    (p) => String(p.id) === String(planMedicoId)
  );
  return plan ? plan.nombre : "Desconocido";
};

export default function Afiliados() {
  const dispatch = useDispatch();

  // NO crear literales dentro de useSelector: devolvemos valores del estado tal cual
  const afiliadosState = useSelector(
    (state) => state.afiliados.lista,
    shallowEqual
  );
  const afiliados = afiliadosState ?? [];

  const planesMedicos = useSelector(selectPlanes, shallowEqual) ?? [];
  const situacionesCatalogo =
    useSelector(selectSituaciones, shallowEqual) ?? [];

  // Si manejabas parentescos en otro slice, reemplazá la siguiente línea por la fuente real
  const parentescos = [];

  const [filteredAfiliados, setFilteredAfiliados] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedAfiliado, setSelectedAfiliado] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // integrants local: titular + familiares (se mantiene local mientras editás)
  const [integrantes, setIntegrantes] = useState([]);

  const [openFamiliarDialog, setOpenFamiliarDialog] = useState(false);
  const [selectedFamiliarIndex, setSelectedFamiliarIndex] = useState(null);
  const [isEditingFamiliar, setIsEditingFamiliar] = useState(false);

  const [openBajaDialog, setOpenBajaDialog] = useState(false);
  const [openAltaDialog, setOpenAltaDialog] = useState(false);
  const [afiliadoParaBaja, setAfiliadoParaBaja] = useState(null);
  const [afiliadoParaAlta, setAfiliadoParaAlta] = useState(null);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const [formAfiliado, setFormAfiliado] = useState({
    nombre: "",
    apellido: "",
    tipoDocumento: "DNI",
    numeroDocumento: "",
    fechaNacimiento: "",
    planMedicoId: "1",
    alta: hoyISO(),
  });

  const [formFamiliar, setFormFamiliar] = useState({
    id: undefined,
    numeroIntegrante: 0,
    nombre: "",
    apellido: "",
    tipoDocumento: "DNI",
    numeroDocumento: "",
    fechaNacimiento: "",
    parentesco: 2,
    alta: hoyISO(),
    telefonos: [],
    emails: [],
    direcciones: [],
    situacionesTerapeuticasIds: [],
  });

  // fetch inicial (dependencias estables)
  useEffect(() => {
    dispatch(fetchAfiliados());
    dispatch(cargarPlanes());
  }, [dispatch]);

  // sincronizar filtered cuando cambien afiliados
  useEffect(() => {
    setFilteredAfiliados(afiliados);
  }, [afiliados]);

  const showSnackbar = (message, severity = "success") =>
    setSnackbar({ open: true, message, severity });

  // callback memoizado que recibe la lista filtrada desde AdvancedSearchBar
  const handleFilteredChange = useCallback((lista) => {
    // evitamos set si es exactamente la misma referencia
    setFilteredAfiliados((prev) => (prev === lista ? prev : lista));
  }, []);

  // Abrir diálogo nuevo afiliado (titular)
  const handleAddAfiliado = useCallback(() => {
    setSelectedAfiliado(null);
    setIsEditing(false);
    setFormAfiliado({
      nombre: "",
      apellido: "",
      tipoDocumento: "DNI",
      numeroDocumento: "",
      fechaNacimiento: "",
      planMedicoId: "1",
      alta: hoyISO(),
    });
    setIntegrantes([]); // integrants vacíos; el titular se construye desde formAfiliado al guardar
    setOpenDialog(true);
  }, []);

  // Editar afiliado: precargar titular y familiares en estado local
  const handleEditAfiliado = useCallback((afiliado) => {
    if (!afiliado) return showSnackbar("Afiliado inválido", "error");
    setSelectedAfiliado(afiliado);
    setIsEditing(true);

    const titular = getTitularDelAfiliado(afiliado) ?? null;

    setFormAfiliado({
      nombre: titular?.nombre ?? "",
      apellido: titular?.apellido ?? "",
      tipoDocumento:
        titular?.documentacion?.tipoDocumento ??
        titular?.tipoDocumento ??
        "DNI",
      numeroDocumento:
        titular?.documentacion?.numero ?? titular?.numeroDocumento ?? "",
      fechaNacimiento: titular?.fechaNacimiento ?? "",
      planMedicoId: afiliado.planMedicoId ?? "1",
      alta: afiliado.alta ?? hoyISO(),
    });

    // Aseguramos que el arreglo de integrantes tenga al titular en la posición 0
    const miembros = Array.isArray(afiliado.integrantes)
      ? [...afiliado.integrantes]
      : [];
    if (titular && !miembros.some((m) => String(m.id) === String(titular.id))) {
      miembros.unshift(titular);
    }
    setIntegrantes(miembros);
    setOpenDialog(true);
  }, []);

  const handleViewAfiliado = useCallback((afiliado) => {
    setSelectedAfiliado(afiliado);
    setIsEditing(false);

    const titular = getTitularDelAfiliado(afiliado) ?? null;

    setFormAfiliado({
      nombre: titular?.nombre ?? "",
      apellido: titular?.apellido ?? "",
      tipoDocumento:
        titular?.documentacion?.tipoDocumento ??
        titular?.tipoDocumento ??
        "DNI",
      numeroDocumento:
        titular?.documentacion?.numero ?? titular?.numeroDocumento ?? "",
      fechaNacimiento: titular?.fechaNacimiento ?? "",
      planMedicoId: afiliado.planMedicoId ?? "1",
      alta: afiliado.alta ?? hoyISO(),
    });

    setIntegrantes(
      Array.isArray(afiliado.integrantes) ? [...afiliado.integrantes] : []
    );
    setOpenDialog(true);
  }, []);

  // ---------- Familiares (manejo local) ----------
  const handleAddFamiliar = useCallback(
    (afiliado) => {
      setSelectedAfiliado(afiliado);
      setSelectedFamiliarIndex(null);
      setIsEditingFamiliar(false);

      const maxIntegrante = integrantes.length
        ? Math.max(...integrantes.map((i) => Number(i.numeroIntegrante) || 1))
        : 1;

      setFormFamiliar({
        id: undefined,
        numeroIntegrante: maxIntegrante + 1,
        nombre: "",
        apellido: "",
        tipoDocumento: "DNI",
        numeroDocumento: "",
        fechaNacimiento: "",
        parentesco: 2,
        alta: hoyISO(),
        telefonos: [],
        emails: [],
        direcciones: [],
        situacionesTerapeuticasIds: [],
      });
      setOpenFamiliarDialog(true);
    },
    [integrantes]
  );

  const handleEditFamiliar = useCallback(
    (index) => {
      const fam = integrantes[index];
      if (!fam) return showSnackbar("Familiar no encontrado", "error");
      setSelectedFamiliarIndex(index);
      setIsEditingFamiliar(true);

      setFormFamiliar({
        id: fam.id,
        numeroIntegrante: fam.numeroIntegrante,
        nombre: fam.nombre,
        apellido: fam.apellido,
        tipoDocumento:
          fam.documentacion?.tipoDocumento ?? fam.tipoDocumento ?? "DNI",
        numeroDocumento: fam.documentacion?.numero ?? fam.numeroDocumento ?? "",
        fechaNacimiento: fam.fechaNacimiento,
        parentesco: fam.parentesco,
        alta: fam.alta ?? hoyISO(),
        telefonos: fam.telefonos ?? [],
        emails: fam.emails ?? [],
        direcciones: fam.direcciones ?? [],
        situacionesTerapeuticasIds: (
          fam.situacionesTerapeuticas ||
          fam.situacionesTerapeuticasIds ||
          []
        ).map((s) => s.id ?? s),
      });

      setOpenFamiliarDialog(true);
    },
    [integrantes]
  );

  const handleDeleteFamiliar = useCallback(
    (index) => {
      if (!integrantes[index]) return;
      if (
        window.confirm(
          `¿Eliminar a ${integrantes[index].nombre} ${integrantes[index].apellido}?`
        )
      ) {
        const copy = [...integrantes];
        copy.splice(index, 1);
        setIntegrantes(copy);
        showSnackbar("Familiar eliminado (local)");
      }
    },
    [integrantes]
  );

  const handleSaveFamiliar = useCallback(() => {
    if (!formFamiliar.nombre || !formFamiliar.apellido) {
      showSnackbar("Complete los campos del familiar", "error");
      return;
    }

    const famPayload = {
      id: formFamiliar.id ?? `new-${Date.now()}`, // id temporal si no existe
      numeroIntegrante: formFamiliar.numeroIntegrante,
      nombre: formFamiliar.nombre,
      apellido: formFamiliar.apellido,
      fechaNacimiento: formFamiliar.fechaNacimiento,
      parentesco: formFamiliar.parentesco,
      afiliadoId: selectedAfiliado ? selectedAfiliado.id : undefined,
      alta: formFamiliar.alta,
      baja: formFamiliar.baja ?? null,
      documentacion:
        formFamiliar.tipoDocumento || formFamiliar.documentacion
          ? {
              tipoDocumento:
                formFamiliar.tipoDocumento ??
                formFamiliar.documentacion?.tipoDocumento,
              numero:
                formFamiliar.numeroDocumento ??
                formFamiliar.documentacion?.numero,
            }
          : null,
      telefonos: formFamiliar.telefonos ?? [],
      emails: formFamiliar.emails ?? [],
      direcciones: formFamiliar.direcciones ?? [],
      situacionesTerapeuticasIds: formFamiliar.situacionesTerapeuticasIds ?? [],
    };

    if (isEditingFamiliar && selectedFamiliarIndex !== null) {
      const copy = [...integrantes];
      copy[selectedFamiliarIndex] = {
        ...copy[selectedFamiliarIndex],
        ...famPayload,
      };
      setIntegrantes(copy);
      showSnackbar("Familiar actualizado (local)");
    } else {
      setIntegrantes((prev) => [...prev, famPayload]);
      showSnackbar("Familiar agregado (local)");
    }

    setOpenFamiliarDialog(false);
    setSelectedFamiliarIndex(null);
    setIsEditingFamiliar(false);
  }, [
    formFamiliar,
    integrantes,
    isEditingFamiliar,
    selectedFamiliarIndex,
    selectedAfiliado,
  ]);

  // ---------- Construcción del payload para enviar al backend ----------
  const buildAfiliadoPayload = useCallback(
    (afiliadoToEdit = null) => {
      // titular desde formAfiliado
      const titularFromForm = {
        id: afiliadoToEdit
          ? getTitularDelAfiliado(afiliadoToEdit)?.id ?? undefined
          : undefined,
        numeroIntegrante: 1,
        nombre: formAfiliado.nombre,
        apellido: formAfiliado.apellido,
        fechaNacimiento: formAfiliado.fechaNacimiento,
        parentesco: 0,
        afiliadoId: afiliadoToEdit ? afiliadoToEdit.id : undefined,
        alta: formAfiliado.alta,
        baja: null,
        documentacion:
          formAfiliado.tipoDocumento || formAfiliado.documentacion
            ? {
                tipoDocumento:
                  formAfiliado.tipoDocumento ??
                  formAfiliado.documentacion?.tipoDocumento,
                numero:
                  formAfiliado.numeroDocumento ??
                  formAfiliado.documentacion?.numero,
              }
            : null,
        telefonos: (formAfiliado.telefonos || []).map((t) => ({
          numero: t.numero ?? t.Numero ?? t ?? "",
        })),
        emails: (formAfiliado.emails || []).map((e) => ({
          correo: e.correo ?? e.Correo ?? e ?? "",
        })),
        direcciones: (formAfiliado.direcciones || []).map((d) => ({
          calle: d.calle ?? d.Calle ?? "",
          altura: d.altura ?? d.Altura ?? "",
          piso: d.piso ?? d.Piso ?? "",
          departamento: d.departamento ?? d.Departamento ?? "",
          provinciaCiudad: d.provinciaCiudad ?? d.ProvinciaCiudad ?? "",
        })),
        situacionesTerapeuticasIds: (
          formAfiliado.situacionesTerapeuticasIds ||
          formAfiliado.situacionesTerapeuticas ||
          []
        ).map((s) => s.id ?? s),
      };

      // resto integrants (excluir posible titular duplicado)
      const resto = integrantes.filter(
        (i) =>
          !(
            i.numeroIntegrante === 1 ||
            String(i.id) === String(titularFromForm.id)
          )
      );

      const integrantsPayload = [titularFromForm, ...resto].map((i) => ({
        id: i.id && String(i.id).startsWith("new-") ? undefined : i.id,
        numeroIntegrante: i.numeroIntegrante,
        nombre: i.nombre,
        apellido: i.apellido,
        fechaNacimiento: i.fechaNacimiento,
        parentesco: i.parentesco ?? 0,
        afiliadoId: afiliadoToEdit ? afiliadoToEdit.id : undefined,
        alta: i.alta ?? hoyISO(),
        baja: i.baja ?? null,
        documentacion: i.documentacion
          ? {
              tipoDocumento: i.documentacion.tipoDocumento,
              numero: i.documentacion.numero,
            }
          : i.tipoDocumento || i.numeroDocumento
          ? {
              tipoDocumento: i.tipoDocumento,
              numero: i.numeroDocumento,
            }
          : null,
        telefonos: (i.telefonos || []).map((t) => ({
          numero: t.numero ?? t.Numero ?? t ?? "",
        })),
        emails: (i.emails || []).map((e) => ({
          correo: e.correo ?? e.Correo ?? e ?? "",
        })),
        direcciones: (i.direcciones || []).map((d) => ({
          calle: d.calle ?? d.Calle ?? "",
          altura: d.altura ?? d.Altura ?? "",
          piso: d.piso ?? d.Piso ?? "",
          departamento: d.departamento ?? d.Departamento ?? "",
          provinciaCiudad: d.provinciaCiudad ?? d.ProvinciaCiudad ?? "",
        })),
        situacionesTerapeuticasIds: (
          i.situacionesTerapeuticasIds ||
          i.situacionesTerapeuticas ||
          []
        ).map((s) => s.id ?? s),
      }));

      return {
        numeroAfiliado: afiliadoToEdit
          ? afiliadoToEdit.numeroAfiliado
          : undefined,
        planMedicoId: formAfiliado.planMedicoId,
        alta: formAfiliado.alta,
        baja: null,
        integrantes: integrantsPayload,
      };
    },
    [formAfiliado, integrantes]
  );

  // ---------- Guardar afiliado (crear o actualizar) ----------
  const handleSaveAfiliado = useCallback(async () => {
    if (
      !formAfiliado.nombre ||
      !formAfiliado.apellido ||
      !formAfiliado.tipoDocumento ||
      !formAfiliado.numeroDocumento ||
      !formAfiliado.fechaNacimiento
    ) {
      showSnackbar("Complete todos los campos requeridos", "error");
      return;
    }

    try {
      if (selectedAfiliado && isEditing) {
        const payload = buildAfiliadoPayload(selectedAfiliado);
        await dispatch(
          updateAfiliado({ id: selectedAfiliado.id, payload })
        ).unwrap();
        showSnackbar("Afiliado actualizado");
      } else {
        const maxNumero = Math.max(
          0,
          ...afiliados.map((a) => Number(a.numeroAfiliado) || 0)
        );
        const numeroAfiliado = maxNumero + 1;
        const payload = buildAfiliadoPayload(null);
        payload.numeroAfiliado = numeroAfiliado;
        await dispatch(createAfiliado(payload)).unwrap();
        showSnackbar("Afiliado creado");
      }
      dispatch(fetchAfiliados());
    } catch (err) {
      console.error(err);
      showSnackbar("Error al guardar en backend", "error");
    } finally {
      setOpenDialog(false);
      setSelectedAfiliado(null);
      setIntegrantes([]);
    }
  }, [
    formAfiliado,
    selectedAfiliado,
    isEditing,
    afiliados,
    buildAfiliadoPayload,
    dispatch,
  ]);

  // ---------- Alta / Baja handlers (actualizan afiliado con thunk) ----------
  const handleProgramarAltaAfiliado = useCallback(
    async (afiliado, fechaAlta) => {
      try {
        await dispatch(
          updateAfiliado({ id: afiliado.id, payload: { alta: fechaAlta } })
        ).unwrap();
        showSnackbar("Alta programada correctamente");
        dispatch(fetchAfiliados());
      } catch (err) {
        showSnackbar("Error al programar alta", "error");
      }
    },
    [dispatch]
  );

  const handleCancelarAltaProgramada = useCallback(
    async (afiliado) => {
      try {
        const hoy = hoyISO();
        await dispatch(
          updateAfiliado({ id: afiliado.id, payload: { alta: hoy } })
        ).unwrap();
        showSnackbar("Alta programada cancelada");
        dispatch(fetchAfiliados());
      } catch (err) {
        showSnackbar("Error al cancelar alta", "error");
      }
    },
    [dispatch]
  );

  const handleReactivarInmediatamente = useCallback(
    async (afiliado) => {
      try {
        const hoy = hoyISO();
        await dispatch(
          updateAfiliado({
            id: afiliado.id,
            payload: { alta: hoy, baja: null },
          })
        ).unwrap();
        showSnackbar("Afiliado reactivado inmediatamente");
        dispatch(fetchAfiliados());
      } catch (err) {
        showSnackbar("Error al reactivar", "error");
      }
    },
    [dispatch]
  );

  const handleSetBajaAfiliado = useCallback(
    async (afiliado, fechaBaja) => {
      try {
        await dispatch(
          updateAfiliado({ id: afiliado.id, payload: { baja: fechaBaja } })
        ).unwrap();
        showSnackbar("Baja programada");
        dispatch(fetchAfiliados());
      } catch (err) {
        showSnackbar("Error al programar baja", "error");
      }
    },
    [dispatch]
  );

  const handleCancelBajaAfiliado = useCallback(
    async (afiliado) => {
      try {
        await dispatch(
          updateAfiliado({ id: afiliado.id, payload: { baja: null } })
        ).unwrap();
        showSnackbar("Baja cancelada");
        dispatch(fetchAfiliados());
      } catch (err) {
        showSnackbar("Error al cancelar baja", "error");
      }
    },
    [dispatch]
  );

  // colores memoizados
  const getParentescoColor = useCallback(
    (parentescoId) =>
      ({ 1: "#1976d2", 2: "#2e7d32", 3: "#f57c00", 4: "#757575" }[
        parentescoId
      ] || "#757575"),
    []
  );

  const getPlanColor = useCallback(
    (planMedicoId) =>
      ({ 1: "#cd7f32", 2: "#c0c0c0", 3: "#ffd700", 4: "#e5e4e2" }[
        planMedicoId
      ] || "#757575"),
    []
  );

  return (
    <Box>
      <Typography
        variant="h4"
        gutterBottom
        sx={{ fontWeight: "bold", color: "#1976d2" }}
      >
        Afiliados
      </Typography>

      <AdvancedSearchBar
        afiliados={afiliados}
        personas={[]} // ya no usamos personas slice
        planesMedicos={planesMedicos}
        onFilteredAfiliadosChange={handleFilteredChange}
        estaActivo={estaActivo}
        tieneBajaProgramada={tieneBajaProgramada}
        tieneAltaProgramada={tieneAltaProgramada}
      />

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {filteredAfiliados.map((afiliado) => {
          const titular = getTitularDelAfiliado(afiliado);
          const familiares = getFamiliaresDelAfiliado(afiliado);
          if (!titular) return null;
          return (
            <AfiliadoCard
              key={afiliado.id}
              afiliado={afiliado}
              titular={titular}
              familiares={familiares}
              planMedico={getPlanMedicoNombre(
                afiliado.planMedicoId,
                planesMedicos
              )}
              estaActivo={estaActivo(afiliado.alta, afiliado.baja)}
              tieneBajaProgramada={tieneBajaProgramada(afiliado.baja)}
              tieneAltaProgramada={tieneAltaProgramada(afiliado.alta)}
              onView={() => handleViewAfiliado(afiliado)}
              onEdit={() => handleEditAfiliado(afiliado)}
              onSetBaja={(a) => {
                setAfiliadoParaBaja(a);
                setOpenBajaDialog(true);
              }}
              onSetAlta={(a) => {
                setAfiliadoParaAlta(a);
                setOpenAltaDialog(true);
              }}
              onAddFamiliar={() => handleAddFamiliar(afiliado)}
              onViewFamiliar={(fam) => {
                const idx = (integrantes || []).findIndex(
                  (i) => String(i.id) === String(fam.id)
                );
                if (idx >= 0) handleEditFamiliar(idx);
                else showSnackbar("Familiar no encontrado localmente");
              }}
              onEditFamiliar={(fam) => {
                const idx = (integrantes || []).findIndex(
                  (i) => String(i.id) === String(fam.id)
                );
                if (idx >= 0) handleEditFamiliar(idx);
                else showSnackbar("Familiar no encontrado localmente");
              }}
              onDeleteFamiliar={(fam) => {
                const idx = (integrantes || []).findIndex(
                  (i) => String(i.id) === String(fam.id)
                );
                if (idx >= 0) handleDeleteFamiliar(idx);
              }}
              getParentescoColor={getParentescoColor}
              getPlanColor={getPlanColor}
              parentescos={parentescos}
            />
          );
        })}
      </Box>

      {filteredAfiliados.length === 0 && (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <PersonIcon sx={{ fontSize: 64, color: "#ccc", mb: 2 }} />
          <Typography variant="h6" color="textSecondary">
            No se encontraron afiliados
          </Typography>
        </Box>
      )}

      <Fab
        color="primary"
        sx={{ position: "fixed", bottom: 16, right: 16 }}
        onClick={handleAddAfiliado}
      >
        <AddIcon />
      </Fab>

      <AfiliadoFormDialog
        open={openDialog}
        selectedAfiliado={selectedAfiliado}
        isEditing={isEditing}
        formData={formAfiliado}
        planesMedicos={planesMedicos}
        integrantes={integrantes}
        setIntegrantes={setIntegrantes}
        situacionesCatalogo={situacionesCatalogo}
        onClose={() => setOpenDialog(false)}
        onSave={handleSaveAfiliado}
        onFormChange={(field, value) =>
          setFormAfiliado((prev) => ({ ...prev, [field]: value }))
        }
      />

      <PersonaFormDialog
        open={openFamiliarDialog}
        selectedAfiliado={selectedAfiliado}
        selectedFamiliar={formFamiliar}
        isEditing={isEditingFamiliar}
        formData={formFamiliar}
        parentescos={parentescos}
        situacionesCatalogo={situacionesCatalogo}
        editTelefonos={formFamiliar.telefonos}
        editEmails={formFamiliar.emails}
        editDirecciones={formFamiliar.direcciones}
        editSituaciones={formFamiliar.situacionesTerapeuticasIds}
        onEditTelefonosChange={(t) =>
          setFormFamiliar((prev) => ({ ...prev, telefonos: t }))
        }
        onEditEmailsChange={(e) =>
          setFormFamiliar((prev) => ({ ...prev, emails: e }))
        }
        onEditDireccionesChange={(d) =>
          setFormFamiliar((prev) => ({ ...prev, direcciones: d }))
        }
        onEditSituacionesChange={(s) =>
          setFormFamiliar((prev) => ({
            ...prev,
            situacionesTerapeuticasIds: s,
          }))
        }
        onClose={() => setOpenFamiliarDialog(false)}
        onSave={handleSaveFamiliar}
        onFormChange={(field, value) =>
          setFormFamiliar((prev) => ({ ...prev, [field]: value }))
        }
      />

      <BajaDialog
        open={openBajaDialog}
        afiliado={afiliadoParaBaja}
        onClose={() => setOpenBajaDialog(false)}
        onConfirm={(a, fecha) => {
          handleSetBajaAfiliado(a, fecha);
          setOpenBajaDialog(false);
        }}
        onCancelBaja={(a) => {
          handleCancelBajaAfiliado(a);
          setOpenBajaDialog(false);
        }}
      />

      <AltaDialog
        open={openAltaDialog}
        afiliado={afiliadoParaAlta}
        onClose={() => setOpenAltaDialog(false)}
        onConfirm={(a, fecha) => {
          handleProgramarAltaAfiliado(a, fecha);
          setOpenAltaDialog(false);
        }}
        onCancelAlta={(a) => {
          handleCancelarAltaProgramada(a);
          setOpenAltaDialog(false);
        }}
        onReactivar={(a) => {
          handleReactivarInmediatamente(a);
          setOpenAltaDialog(false);
        }}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
