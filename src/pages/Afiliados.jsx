// src/pages/Afiliados.jsx
import { useState, useEffect, useCallback, useMemo } from "react";
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
import { personasService } from "../services/personasService";

import { parentescos } from "../utilidades/parentesco";

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

// helpers puros
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

  const afiliadosState = useSelector(
    (state) => state.afiliados.lista,
    shallowEqual
  );
  const afiliados = useMemo(() => afiliadosState ?? [], [afiliadosState]);

  const planesMedicos = useSelector(selectPlanes, shallowEqual) ?? [];
  const situacionesCatalogo =
    useSelector(selectSituaciones, shallowEqual) ?? [];

  const [filteredAfiliados, setFilteredAfiliados] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedAfiliado, setSelectedAfiliado] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const [integrantes, setIntegrantes] = useState([]);

  // Familiares
  const [openFamiliarDialog, setOpenFamiliarDialog] = useState(false);
  const [isEditingFamiliar, setIsEditingFamiliar] = useState(false);
  const [selectedFamiliar, setSelectedFamiliar] = useState(null); // solo vista
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

  // Alta / Baja
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

  // fetch inicial
  useEffect(() => {
    dispatch(fetchAfiliados());
    dispatch(cargarPlanes());
  }, [dispatch]);

  useEffect(() => {
    setFilteredAfiliados(afiliados);
  }, [afiliados]);

  const showSnackbar = (message, severity = "success") =>
    setSnackbar({ open: true, message, severity });

  const handleFilteredChange = useCallback((lista) => {
    setFilteredAfiliados((prev) => (prev === lista ? prev : lista));
  }, []);

  // ---------- Afiliados: agregar/editar/ver ----------
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
    setIntegrantes([]);
    setOpenDialog(true);
  }, []);

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
      telefonos: titular?.telefonos?.map((t) => t.numero) ?? [],
      emails: titular?.emails?.map((e) => e.correo) ?? [],
      direcciones:
        titular?.direcciones?.map((d) =>
          `${d.calle ?? ""} ${d.altura ?? ""}${
            d.piso ? `, Piso ${d.piso}` : ""
          }${d.departamento ? `, Dpto ${d.departamento}` : ""}${
            d.provinciaCiudad ? `, ${d.provinciaCiudad}` : ""
          }`.trim()
        ) ?? [],
      situacionesTerapeuticasIds:
        titular?.situacionesTerapeuticas?.map((s) => s.id ?? s) ?? [],
    });

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
      telefonos: titular?.telefonos?.map((t) => t.numero) ?? [],
      emails: titular?.emails?.map((e) => e.correo) ?? [],
      direcciones:
        titular?.direcciones?.map((d) =>
          `${d.calle ?? ""} ${d.altura ?? ""}${
            d.piso ? `, Piso ${d.piso}` : ""
          }${d.departamento ? `, Dpto ${d.departamento}` : ""}${
            d.provinciaCiudad ? `, ${d.provinciaCiudad}` : ""
          }`.trim()
        ) ?? [],
      situacionesTerapeuticasIds:
        titular?.situacionesTerapeuticas?.map((s) => s.id ?? s) ?? [],
    });

    setIntegrantes(
      Array.isArray(afiliado.integrantes) ? [...afiliado.integrantes] : []
    );
    setOpenDialog(true);
  }, []);

  // ---------- Familiares ----------
  const handleViewFamiliar = useCallback(async (afiliado, fam) => {
    try {
      const familiarCompleto = await personasService.getPersona(fam.id); {console.log("fam",fam,fam.id)} {console.log("afiliado",afiliado, afiliado.id)}
      setSelectedAfiliado(afiliado);
      setSelectedFamiliar(familiarCompleto); // solo vista
      setIsEditingFamiliar(false);
      setOpenFamiliarDialog(true);
    } catch (error) {
      showSnackbar("Error al cargar los datos del familiar", "error");
    }
  }, []);

  const handleEditFamiliar = useCallback(async (afiliado, fam) => {
    try {
      const familiarCompleto = await personasService.getPersona(fam.id);
      setSelectedAfiliado(afiliado);
      setFormFamiliar(familiarCompleto); // edición
      setSelectedFamiliar(familiarCompleto);
      setIsEditingFamiliar(true);
      setOpenFamiliarDialog(true);
    } catch (error) {
      showSnackbar("Error al cargar el familiar para edición", "error");
    }
  }, []);

  const handleAddFamiliar = useCallback(async (afiliado) => {
    try {
      const maxIntegrante = afiliado.integrantes?.length
        ? Math.max(
            ...afiliado.integrantes.map((i) => Number(i.numeroIntegrante) || 1)
          )
        : 1;

      setSelectedAfiliado(afiliado);
      setIsEditingFamiliar(false);
      setSelectedFamiliar(null);
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
    } catch (error) {
      showSnackbar("Error al preparar formulario de familiar", "error");
    }
  }, []);

  const handleSaveFamiliar = useCallback(async () => {
    if (!formFamiliar.nombre || !formFamiliar.apellido) {
      showSnackbar("Complete los campos del familiar", "error");
      return;
    }

    try {
      const familiarPayload = {
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
        telefonos: (formFamiliar.telefonos || []).map((t) => ({
          numero: t.numero ?? t.Numero ?? t ?? "",
        })),
        emails: (formFamiliar.emails || []).map((e) => ({
          correo: e.correo ?? e.Correo ?? e ?? "",
        })),
        direcciones: (formFamiliar.direcciones || []).map((d) => ({
          calle: d.calle ?? d.Calle ?? "",
          altura: d.altura ?? d.Altura ?? "",
          piso: d.piso ?? d.Piso ?? "",
          departamento: d.departamento ?? d.Departamento ?? "",
          provinciaCiudad: d.provinciaCiudad ?? d.ProvinciaCiudad ?? "",
        })),
        situacionesTerapeuticasIds:
          formFamiliar.situacionesTerapeuticasIds ?? [],
      };

      if (isEditingFamiliar && formFamiliar.id) {
        await personasService.updatePersona(formFamiliar.id, familiarPayload);
        showSnackbar("Familiar actualizado correctamente");
      } else {
        await personasService.createPersona(familiarPayload);
        showSnackbar("Familiar agregado correctamente");
      }

      await dispatch(fetchAfiliados()).unwrap();

      setOpenFamiliarDialog(false);
      setSelectedFamiliar(null);
      setIsEditingFamiliar(false);
    } catch (error) {
      console.error("Error al guardar familiar:", error);
      showSnackbar("Error al guardar el familiar", "error");
    }
  }, [formFamiliar, isEditingFamiliar, selectedAfiliado, dispatch]);

  const handleDeleteFamiliar = useCallback(
    async (afiliado, fam) => {
      if (!fam.id) {
        showSnackbar("No se puede eliminar un familiar sin ID", "error");
        return;
      }

      if (window.confirm(`¿Eliminar a ${fam.nombre} ${fam.apellido}?`)) {
        try {
          await personasService.deletePersona(fam.id);
          showSnackbar("Familiar eliminado correctamente");
          await dispatch(fetchAfiliados()).unwrap();
        } catch (error) {
          console.error("Error al eliminar familiar:", error);
          showSnackbar("Error al eliminar el familiar", "error");
        }
      }
    },
    [dispatch]
  );

  // ---------- Construcción payload afiliado ----------
  const buildAfiliadoPayload = useCallback(
    (afiliadoToEdit = null) => {
      const titularFromForm = {
        id: afiliadoToEdit
          ? getTitularDelAfiliado(afiliadoToEdit)?.id ?? undefined
          : undefined,
        numeroIntegrante: 1,
        nombre: formAfiliado.nombre,
        apellido: formAfiliado.apellido,
        fechaNacimiento: formAfiliado.fechaNacimiento,
        parentesco: 0, // ajusta según catálogo
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

  // ---------- Guardar afiliado ----------
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
      await dispatch(fetchAfiliados()).unwrap();
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

  // ---------- Alta / Baja ----------
  const handleProgramarAltaAfiliado = useCallback(
    async (afiliado, fechaAlta) => {
      try {
        await dispatch(
          updateAfiliado({ id: afiliado.id, payload: { alta: fechaAlta } })
        ).unwrap();
        showSnackbar("Alta programada correctamente");
        await dispatch(fetchAfiliados()).unwrap();
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
        await dispatch(fetchAfiliados()).unwrap();
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
        await dispatch(fetchAfiliados()).unwrap();
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
        await dispatch(fetchAfiliados()).unwrap();
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
        await dispatch(fetchAfiliados()).unwrap();
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
        personas={[]}
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
              onViewFamiliar={(fam) => handleViewFamiliar(afiliado, fam)}
              onEditFamiliar={(fam) => handleEditFamiliar(afiliado, fam)}
              onDeleteFamiliar={(fam) => handleDeleteFamiliar(afiliado, fam)}
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
        personas={integrantes}
        editTelefonos={formAfiliado.telefonos}
        editEmails={formAfiliado.emails}
        editDirecciones={formAfiliado.direcciones}
        editSituaciones={formAfiliado.situacionesTerapeuticasIds}
        onEditTelefonosChange={(t) =>
          setFormAfiliado((prev) => ({ ...prev, telefonos: t }))
        }
        onEditEmailsChange={(e) =>
          setFormAfiliado((prev) => ({ ...prev, emails: e }))
        }
        onEditDireccionesChange={(d) =>
          setFormAfiliado((prev) => ({ ...prev, direcciones: d }))
        }
        onEditSituacionesChange={(s) =>
          setFormAfiliado((prev) => ({
            ...prev,
            situacionesTerapeuticasIds: s,
          }))
        }
        onClose={() => setOpenDialog(false)}
        onSave={handleSaveAfiliado}
        onEdit={() => setIsEditing(true)}
        onFormChange={(field, value) =>
          setFormAfiliado((prev) => ({ ...prev, [field]: value }))
        }
      />

      <PersonaFormDialog
        open={openFamiliarDialog}
        selectedAfiliado={selectedAfiliado}
        selectedFamiliar={isEditingFamiliar ? null : selectedFamiliar}
        isEditing={isEditingFamiliar}
        formData={formFamiliar}
        parentescos={parentescos}
        editTelefonos={formFamiliar.telefonos || []}
        editEmails={formFamiliar.emails || []}
        editDirecciones={formFamiliar.direcciones || []}
        editSituaciones={formFamiliar.situacionesTerapeuticasIds || []}
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
        onClose={() => {
          setOpenFamiliarDialog(false);
          setSelectedFamiliar(null);
          setFormFamiliar({});
          setIsEditingFamiliar(false);
        }}
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
