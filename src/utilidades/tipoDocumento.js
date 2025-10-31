export const tiposDocumento = {
  1: "Documento Nacional de Identidad",
  2: "Cédula de Identidad",
  3: "Matrícula Nacional",
  4: "CUIL",
  5: "RUT",
  6: "CUIT"
};

// Función auxiliar para obtener el valor numérico
export const getTipoDocumentoValor = (label) => {
  const entry = Object.entries(tiposDocumento).find(([key, value]) => value === label);
  return entry ? entry[0] : "1"; // default a DNI
};
