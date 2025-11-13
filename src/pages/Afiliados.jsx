import { useState, useEffect, useCallback, useMemo } from "react";
import { useSelector, useDispatch, shallowEqual } from "react-redux";
import { Box, Typography, Fab, Snackbar, Alert } from "@mui/material";
import PageHeader from "../components/Ui/PageHeader.jsx";

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
  toggleAfiliadoStatus,
} from "../store/afiliadosSlice";

import {
  selectSituaciones,
  cargarSituaciones,
} from "../store/situacionesTerapeuticasSlice";
import { cargarPlanes, selectPlanes } from "../store/planesSlice";
import { personasService } from "../services/personasService";

import { parentescos } from "../utilidades/parentesco";
import { updatePersona, createMember } from "../store/personasSlice";

const hoyISO = () => new Date().toISOString().split("T")[0];

// Reemplazar la función actual por esta versión que compara fecha y hora completa
const estaActivo = (alta, baja) => {
  const ahora = new Date();

  // Si no tiene fecha de alta, no está activo
  if (!alta) return false;

  const fechaAlta = new Date(alta);
  const fechaBaja = baja ? new Date(baja) : null;

  // Si la fecha de alta es futura, no está activo
  if (fechaAlta > ahora) return false;

  // Si tiene fecha de baja y es anterior o igual al momento actual, no está activo
  if (fechaBaja && fechaBaja <= ahora) return false;

  // En cualquier otro caso, está activo
  return true;
};

// También actualizar las funciones auxiliares para usar comparación completa
const tieneBajaProgramada = (baja) => {
  if (!baja) return false;
  return new Date(baja) > new Date();
};

const tieneAltaProgramada = (alta) => {
  if (!alta) return false;
  return new Date(alta) > new Date();
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
    dispatch(cargarSituaciones());
  }, [dispatch]);

  useEffect(() => {
    setFilteredAfiliados(afiliados);
  }, [afiliados]);

  const showSnackbar = (message, severity = "success") =>
    setSnackbar({ open: true, message, severity });

  const handleFilteredChange = useCallback((lista) => {
    setFilteredAfiliados((prev) => (prev === lista ? prev : lista));
  }, []);

  // Función helper para convertir situaciones a objeto (debe estar en el scope del componente)
  const convertirSituacionesAObjeto = (situacionesArray) => {
    const obj = {};
    situacionesArray.forEach((sit) => {
      obj[sit.id] = sit.fechaFin ? new Date(sit.fechaFin).toISOString() : null;
    });
    return obj;
  };

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
      planMedicoId: "",
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
      planMedicoId: afiliado.planMedicoId ?? 1,
      alta: afiliado.alta ?? hoyISO(),
      telefonos: titular?.telefonos?.map((t) => t.numero) ?? [],
      emails: titular?.emails?.map((e) => e.correo) ?? [],
      // CAMBIO: Mantener direcciones como objetos, no como strings
      direcciones:
        titular?.direcciones?.map((d) => ({
          calle: d.calle ?? "",
          altura: d.altura ?? "",
          piso: d.piso ?? "",
          departamento: d.departamento ?? "",
          provinciaCiudad: d.provinciaCiudad ?? "",
        })) ?? [],
      situacionesTerapeuticasIds: Array.isArray(
        titular?.situacionesTerapeuticas
      )
        ? titular.situacionesTerapeuticas.map((s) =>
            typeof s === "object" ? s : { id: s, nombre: "", fechaFin: null }
          )
        : [],
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
      planMedicoId: afiliado.planMedicoId ?? 1,
      alta: afiliado.alta ?? hoyISO(),
      telefonos: titular?.telefonos?.map((t) => t.numero) ?? [],
      emails: titular?.emails?.map((e) => e.correo) ?? [],
      // CAMBIO: Mantener direcciones como objetos, no como strings
      direcciones:
        titular?.direcciones?.map((d) => ({
          calle: d.calle ?? "",
          altura: d.altura ?? "",
          piso: d.piso ?? "",
          departamento: d.departamento ?? "",
          provinciaCiudad: d.provinciaCiudad ?? "",
        })) ?? [],
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
      const familiarCompleto = await personasService.getPersona(fam.id);
      {
        console.log("fam", fam, fam.id);
      }
      {
        console.log("afiliado", afiliado, afiliado.id);
      }
      setSelectedAfiliado(afiliado);
      setSelectedFamiliar(familiarCompleto); // solo vista
      setIsEditingFamiliar(false);
      setOpenFamiliarDialog(true);
    } catch (error) {
      showSnackbar("Error al cargar los datos del familiar", "error", error);
    }
  }, []);

  // Para edición de familiares existentes
  const handleEditFamiliar = useCallback(async (afiliado, fam) => {
    try {
      const familiarCompleto = await personasService.getPersona(fam.id);
      setSelectedAfiliado(afiliado);
      setFormFamiliar(familiarCompleto);
      setSelectedFamiliar(familiarCompleto);
      setIsEditingFamiliar(true);
      setOpenFamiliarDialog(true);
    } catch (error) {
      showSnackbar("Error al cargar el familiar para edición", "error", error);
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
      showSnackbar("Error al preparar formulario de familiar", "error", error);
    }
  }, []);

  const handleSaveFamiliar = useCallback(async () => {
    if (!formFamiliar.nombre || !formFamiliar.apellido) {
      showSnackbar("Complete los campos del familiar", "error");
      return;
    }

    try {
      // Función helper para convertir situaciones a objeto
      const convertirSituacionesAObjeto = (situacionesArray) => {
        const obj = {};
        situacionesArray.forEach((sit) => {
          obj[sit.id] = sit.fechaFin
            ? new Date(sit.fechaFin).toISOString()
            : null;
        });
        return obj;
      };

      // Construimos el payload base común
      const payloadBase = {
        numeroIntegrante: formFamiliar.numeroIntegrante,
        nombre: formFamiliar.nombre.trim(),
        apellido: formFamiliar.apellido.trim(),
        fechaNacimiento: formFamiliar.fechaNacimiento
          ? new Date(formFamiliar.fechaNacimiento).toISOString()
          : new Date().toISOString(),
        parentesco: parseInt(formFamiliar.parentesco) || 2,
        afiliadoId: selectedAfiliado.id,
        alta: formFamiliar.alta
          ? new Date(formFamiliar.alta).toISOString()
          : new Date().toISOString(),
        baja: formFamiliar.baja
          ? new Date(formFamiliar.baja).toISOString()
          : null,
        documentacion: {
          id: formFamiliar.documentacion?.id || 0,
          tipoDocumento: parseInt(formFamiliar.tipoDocumento) || 1,
          numero: (formFamiliar.numeroDocumento || "").toString(),
        },
        telefonos: (formFamiliar.telefonos || []).map((t, index) => ({
          id: t.id || 0,
          numero: typeof t === "string" ? t.trim() : (t.numero || "").trim(),
        })),
        emails: (formFamiliar.emails || []).map((e, index) => ({
          id: e.id || 0,
          correo: typeof e === "string" ? e.trim() : (e.correo || "").trim(),
        })),
        direcciones: (formFamiliar.direcciones || []).map((d, index) => ({
          id: d.id || 0,
          calle: d.calle || "",
          altura: d.altura || "",
          piso: d.piso || "",
          departamento: d.departamento || "",
          provinciaCiudad: d.provinciaCiudad || "",
        })),
        situacionesTerapeuticas: convertirSituacionesAObjeto(
          formFamiliar.situacionesTerapeuticasIds || []
        ),
      };

      let result;

      if (isEditingFamiliar && formFamiliar.id) {
        // 🟢 EDITAR familiar existente - Usar PUT /Personas/update
        const updatePayload = {
          ...payloadBase,
          id: formFamiliar.id, // ID existente del familiar
        };

        console.log(
          "🎯 [EDIT FAMILIAR] Payload a enviar:",
          JSON.stringify(updatePayload, null, 2)
        );

        result = await dispatch(updatePersona(updatePayload)).unwrap();
        showSnackbar("Familiar actualizado correctamente");
      } else {
        // 🟢 CREAR nuevo familiar - Usar POST /Personas/addMember/{afiliadoID}
        const createPayload = {
          ...payloadBase,
          id: 0, // Nuevo registro
        };

        console.log(
          "🎯 [ADD FAMILIAR] Payload a enviar:",
          JSON.stringify(createPayload, null, 2)
        );

        result = await dispatch(
          createMember({
            afiliadoID: selectedAfiliado.id,
            memberData: createPayload,
          })
        ).unwrap();
        showSnackbar("Familiar agregado correctamente");
      }

      // Recargar los afiliados para reflejar los cambios
      await dispatch(fetchAfiliados()).unwrap();

      setOpenFamiliarDialog(false);
      setSelectedFamiliar(null);
      setIsEditingFamiliar(false);
      setFormFamiliar({});
    } catch (error) {
      console.error("❌ Error al guardar familiar:", error);
      showSnackbar(
        "Error al guardar el familiar: " +
          (error.message || "Error desconocido"),
        "error"
      );
    }
  }, [formFamiliar, selectedAfiliado, isEditingFamiliar, dispatch]);

  // ---------- Construcción payload afiliado ----------
  const buildAfiliadoPayload = useCallback(
    (afiliadoToEdit = null) => {
      console.log("🔧 [DEBUG] Construyendo payload...");
      console.log("🔧 [DEBUG] formAfiliado:", formAfiliado);

      // Función helper para convertir situaciones a objeto
      const convertirSituacionesAObjeto = (situacionesArray) => {
        const obj = {};
        situacionesArray.forEach((sit) => {
          obj[sit.id] = sit.fechaFin
            ? new Date(sit.fechaFin).toISOString()
            : null;
        });
        return obj;
      };

      // Asegurar que el tipo de documento sea numérico (1, 2, 3, etc.)
      const tipoDocumentoNumerico =
        formAfiliado.tipoDocumento && !isNaN(formAfiliado.tipoDocumento)
          ? formAfiliado.tipoDocumento
          : 1; // Default a DNI si no es numérico

      // 1. Construir el TITULAR desde formAfiliado
      const titularPayload = {
        numeroIntegrante: 1,
        nombre: formAfiliado.nombre?.trim() || "",
        apellido: formAfiliado.apellido?.trim() || "",
        fechaNacimiento: formAfiliado.fechaNacimiento
          ? new Date(formAfiliado.fechaNacimiento).toISOString()
          : new Date().toISOString(),
        parentesco: 0, // 0 = Titular - CORREGIDO: debe ser número, no string
        alta: formAfiliado.alta
          ? new Date(formAfiliado.alta).toISOString()
          : new Date().toISOString(),
        baja: null,
        documentacion: {
          tipoDocumento: parseInt(tipoDocumentoNumerico),
          numero: formAfiliado.numeroDocumento?.toString() || "",
        },
        telefonos: (formAfiliado.telefonos || [])
          .filter((t) => t && t.trim())
          .map((t) => ({
            numero: typeof t === "string" ? t.trim() : (t.numero || "").trim(),
          })),
        emails: (formAfiliado.emails || [])
          .filter((e) => e && e.trim())
          .map((e) => ({
            correo: typeof e === "string" ? e.trim() : (e.correo || "").trim(),
          })),
        direcciones: (formAfiliado.direcciones || [])
          .filter((d) => d)
          .map((d) => {
            if (typeof d === "string") {
              return {
                calle: d,
                altura: "0",
                piso: "",
                departamento: "",
                provinciaCiudad: "Buenos Aires",
              };
            }
            return {
              calle: d.calle || "",
              altura: d.altura || "",
              piso: d.piso || "",
              departamento: d.departamento || "",
              provinciaCiudad: d.provinciaCiudad || "",
            };
          }),
        situacionesTerapeuticas: convertirSituacionesAObjeto(
          formAfiliado.situacionesTerapeuticasIds || []
        ),
      };

      console.log("🔧 [DEBUG] Titular payload:", titularPayload);

      // 2. Construir otros integrantes (familiares)
      const otrosIntegrantesPayload = (integrantes || [])
        .filter((i) => i && i.numeroIntegrante !== 1) // Excluir titular
        .map((i, index) => ({
          numeroIntegrante: i.numeroIntegrante || index + 2,
          nombre: i.nombre?.trim() || "",
          apellido: i.apellido?.trim() || "",
          fechaNacimiento: i.fechaNacimiento
            ? new Date(i.fechaNacimiento).toISOString()
            : new Date().toISOString(),
          parentesco: parseInt(i.parentesco) || 2, // CORREGIDO: asegurar que sea número
          alta: i.alta
            ? new Date(i.alta).toISOString()
            : new Date().toISOString(),
          baja: i.baja ? new Date(i.baja).toISOString() : null,
          documentacion:
            i.tipoDocumento || i.numeroDocumento
              ? {
                  tipoDocumento:
                    i.tipoDocumento && !isNaN(i.tipoDocumento)
                      ? parseInt(i.tipoDocumento)
                      : 1,
                  numero: i.numeroDocumento?.toString() || "",
                }
              : null,
          telefonos: (i.telefonos || [])
            .filter((t) => t && t.trim())
            .map((t) => ({
              numero:
                typeof t === "string" ? t.trim() : (t.numero || "").trim(),
            })),
          emails: (i.emails || [])
            .filter((e) => e && e.trim())
            .map((e) => ({
              correo:
                typeof e === "string" ? e.trim() : (e.correo || "").trim(),
            })),
          direcciones: (i.direcciones || [])
            .filter((d) => d)
            .map((d) => {
              if (typeof d === "string") {
                return {
                  calle: d,
                  altura: "",
                  piso: "",
                  departamento: "",
                  provinciaCiudad: "",
                };
              }
              return {
                calle: d.calle || "",
                altura: d.altura || "",
                piso: d.piso || "",
                departamento: d.departamento || "",
                provinciaCiudad: d.provinciaCiudad || "",
              };
            }),
          situacionesTerapeuticas: convertirSituacionesAObjeto(
            i.situacionesTerapeuticasIds || []
          ),
        }));

      console.log(
        "🔧 [DEBUG] Otros integrantes payload:",
        otrosIntegrantesPayload
      );

      // 3. Payload final - Asegurar que numeroAfiliado esté presente
      const finalPayload = {
        numeroAfiliado: afiliadoToEdit
          ? afiliadoToEdit.numeroAfiliado
          : undefined,
        planMedicoId: parseInt(formAfiliado.planMedicoId) || 1,
        alta: formAfiliado.alta
          ? new Date(formAfiliado.alta).toISOString()
          : new Date().toISOString(),
        baja: null,
        // NUEVO: Incluir titularID - aunque en creación puede ser 0, el backend lo asignará
        titularID: 0,
        integrantes: [titularPayload, ...otrosIntegrantesPayload],
      };

      // Para creación nueva, asegurar que numeroAfiliado tenga valor
      if (!afiliadoToEdit && !finalPayload.numeroAfiliado) {
        const maxNumero = Math.max(
          0,
          ...afiliados.map((a) => Number(a.numeroAfiliado) || 0)
        );
        finalPayload.numeroAfiliado = maxNumero + 1;
      }

      console.log(
        "🔧 [DEBUG] Payload final antes de enviar:",
        JSON.stringify(finalPayload, null, 2)
      );
      console.log(
        "🔧 [DEBUG] Cantidad de integrantes:",
        finalPayload.integrantes.length
      );
      console.log("🔧 [DEBUG] numeroAfiliado:", finalPayload.numeroAfiliado);
      console.log("🔧 [DEBUG] titularID:", finalPayload.titularID);

      return finalPayload;
    },
    [formAfiliado, integrantes, afiliados]
  );

  // ---------- Guardar afiliado ----------
  // En Afiliados.jsx - handleSaveAfiliado
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
        // ===== ESTRATEGIA DE ACTUALIZACIÓN SEPARADA =====

        // 1. Obtener el titular actual del afiliado
        const titularActual = getTitularDelAfiliado(selectedAfiliado);
        if (!titularActual) {
          throw new Error("No se encontró el titular del afiliado");
        }

        // 2. Construir payload para actualizar el AFILIADO (solo datos del afiliado)
        const afiliadoPayload = {
          numeroAfiliado: selectedAfiliado.numeroAfiliado,
          planMedicoId: parseInt(formAfiliado.planMedicoId) || 1,
          alta: formAfiliado.alta
            ? new Date(formAfiliado.alta).toISOString().split("T")[0]
            : new Date().toISOString().split("T")[0],

          baja: null,
          // Mantener el TitularID original
          titularID: selectedAfiliado.titularID || selectedAfiliado.titularId,
        };

        console.log("🎯 [AFILIADO] Payload a enviar:", afiliadoPayload);

        // 3. Construir payload para actualizar el TITULAR (datos personales)
        const titularPayload = {
          id: titularActual.id, // ID del titular existente
          numeroIntegrante: 1,
          nombre: formAfiliado.nombre?.trim() || "",
          apellido: formAfiliado.apellido?.trim() || "",
          fechaNacimiento: formAfiliado.fechaNacimiento
            ? new Date(formAfiliado.fechaNacimiento).toISOString().split("T")[0]
            : new Date().toISOString().split("T")[0],
          parentesco: 0, // Titular
          afiliadoId: selectedAfiliado.id, // ID del afiliado
          alta: formAfiliado.alta
            ? new Date(formAfiliado.alta).toISOString().split("T")[0]
            : new Date().toISOString().split("T")[0],
          baja: null,
          documentacion: {
            tipoDocumento: parseInt(formAfiliado.tipoDocumento) || 1,
            numero: formAfiliado.numeroDocumento?.toString() || "",
          },
          telefonos: (formAfiliado.telefonos || [])
            .filter((t) => t && t.trim())
            .map((t) => ({
              numero:
                typeof t === "string" ? t.trim() : (t.numero || "").trim(),
            })),
          emails: (formAfiliado.emails || [])
            .filter((e) => e && e.trim())
            .map((e) => ({
              correo:
                typeof e === "string" ? e.trim() : (e.correo || "").trim(),
            })),
          direcciones: (formAfiliado.direcciones || [])
            .filter((d) => d && d.calle) // Solo direcciones con calle
            .map((d) => ({
              calle: (d.calle || "").substring(0, 100),
              altura: d.altura || "",
              piso: d.piso || "",
              departamento: d.departamento || "",
              provinciaCiudad: d.provinciaCiudad || "Bs As",
            })),
          situacionesTerapeuticas: convertirSituacionesAObjeto(
            formAfiliado.situacionesTerapeuticasIds || []
          ),
        };

        console.log("🎯 [TITULAR] Payload a enviar:", titularPayload);

        // 4. Ejecutar ambas actualizaciones en paralelo
        await Promise.all([
          dispatch(
            updateAfiliado({
              id: selectedAfiliado.id,
              payload: afiliadoPayload,
            })
          ).unwrap(),
          dispatch(updatePersona(titularPayload)).unwrap(),
        ]);

        showSnackbar("Afiliado actualizado correctamente");

        // 5. ACTUALIZACIÓN CRÍTICA: Refrescar los datos del afiliado
        await dispatch(fetchAfiliados()).unwrap();

        // Obtener el afiliado actualizado de la lista
        const afiliadosActualizados = await dispatch(fetchAfiliados()).unwrap();
        const afiliadoActualizado =
          afiliadosActualizados.payload?.find(
            (a) => a.id === selectedAfiliado.id
          ) || afiliadosActualizados.find((a) => a.id === selectedAfiliado.id);

        if (afiliadoActualizado) {
          setSelectedAfiliado(afiliadoActualizado);
        }
      } else {
        // ===== CREACIÓN NUEVA (se mantiene igual) =====
        const payload = buildAfiliadoPayload(selectedAfiliado);
        console.log(
          "🎯 [CREACIÓN] Payload a enviar:",
          JSON.stringify(payload, null, 2)
        );
        await dispatch(createAfiliado(payload)).unwrap();
        showSnackbar("Afiliado creado");
        await dispatch(fetchAfiliados()).unwrap();
      }
    } catch (err) {
      console.error("❌ Error al guardar afiliado:", err);
      console.error("❌ Error details:", err.response?.data);
      showSnackbar(
        "Error al guardar: " + (err.message || "Error desconocido"),
        "error"
      );
    } finally {
      setOpenDialog(false);
      setSelectedAfiliado(null);
      setIntegrantes([]);
    }
  }, [
    formAfiliado,
    selectedAfiliado,
    isEditing,
    buildAfiliadoPayload,
    dispatch,
  ]);

  // ---------- Alta / Baja ----------
  // ---------- Reemplazar estas funciones ----------

  const handleProgramarAltaAfiliado = useCallback(
    async (afiliado, fechaAlta) => {
      try {
        await dispatch(
          toggleAfiliadoStatus({
            id: afiliado.id,
            activo: true,
            fecha: fechaAlta,
          })
        ).unwrap();
        showSnackbar("Alta programada correctamente");
        await dispatch(fetchAfiliados()).unwrap();
      } catch (err) {
        showSnackbar("Error al programar alta", "error", err);
      }
    },
    [dispatch]
  );

  const handleCancelarAltaProgramada = useCallback(
    async (afiliado) => {
      try {
        const hoy = hoyISO();
        await dispatch(
          toggleAfiliadoStatus({
            id: afiliado.id,
            activo: true,
            fecha: hoy,
          })
        ).unwrap();
        showSnackbar("Alta programada cancelada");
        await dispatch(fetchAfiliados()).unwrap();
      } catch (err) {
        showSnackbar("Error al cancelar alta", "error", err);
      }
    },
    [dispatch]
  );

  const handleReactivarInmediatamente = useCallback(
    async (afiliado) => {
      try {
        const hoy = hoyISO();
        await dispatch(
          toggleAfiliadoStatus({
            id: afiliado.id,
            activo: true,
            fecha: hoy,
          })
        ).unwrap();
        showSnackbar("Afiliado reactivado inmediatamente");
        await dispatch(fetchAfiliados()).unwrap();
      } catch (err) {
        showSnackbar("Error al reactivar", "error", err);
      }
    },
    [dispatch]
  );

  const handleSetBajaAfiliado = useCallback(
    async (afiliado, fechaBaja) => {
      try {
        await dispatch(
          toggleAfiliadoStatus({
            id: afiliado.id,
            activo: false,
            fecha: fechaBaja,
          })
        ).unwrap();
        showSnackbar("Baja programada");
        await dispatch(fetchAfiliados()).unwrap();
      } catch (err) {
        showSnackbar("Error al programar baja", "error", err);
      }
    },
    [dispatch]
  );

  const handleCancelBajaAfiliado = useCallback(
    async (afiliado) => {
      try {
        await dispatch(
          toggleAfiliadoStatus({
            id: afiliado.id,
            activo: true,
            fecha: hoyISO(),
          })
        ).unwrap();
        showSnackbar("Baja cancelada");
        await dispatch(fetchAfiliados()).unwrap();
      } catch (err) {
        showSnackbar("Error al cancelar baja", "error", err);
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
    <>
      <PageHeader title="Afiliados" subtitle="Gestión de afiliados" />

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
              //onDeleteFamiliar={(fam) => handleDeleteFamiliar(afiliado, fam)}
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
        situacionesCatalogo={situacionesCatalogo}
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
        selectedFamiliar={selectedFamiliar}
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
    </>
  );
}
