export const validarNumeroMayorACero = (valor, campo = "Este campo") => {
  const numero = Number(valor);
  if (valor === "" || valor === null || valor === undefined) {
    return `${campo} es obligatorio.`;
  }
  if (isNaN(numero)) {
    return `${campo} debe ser un número válido.`;
  }
  if (numero <= 0) {
    return `${campo} debe ser mayor a 0.`;
  }
  return "";
};

export const validarEmail = (valor) => {
  if (!valor || valor.trim() === "") return "El email es obligatorio.";
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!regex.test(valor)) return "El formato del email no es válido.";
  return "";
};

export const validarTelefono = (valor) => {
  if (!valor || valor.trim() === "") return "El teléfono es obligatorio.";
  const regex = /^[0-9]{8,15}$/;
  if (!regex.test(valor))
    return "El teléfono debe tener entre 8 y 15 dígitos numéricos.";
  return "";
};

export const validarStringObligatorio = (valor, campo = "Este campo") => {
  if (typeof valor !== "string" || valor.trim() === "") {
    return `${campo} es obligatorio.`;
  }
  return "";
};

// Validaciones específicas para clientes
export const validarCUIT = (valor) => {
  if (!valor || valor.trim() === "") return "El CUIT/RUT es obligatorio.";

  // Formato CUIT: XX-XXXXXXXX-X
  const regexCUIT = /^\d{2}-\d{8}-\d{1}$/;
  // Formato RUT: XX.XXX.XXX-X
  const regexRUT = /^\d{2}\.\d{3}\.\d{3}-\d{1}$/;

  if (!regexCUIT.test(valor) && !regexRUT.test(valor)) {
    return "El CUIT debe tener formato XX-XXXXXXXX-X o el RUT formato XX.XXX.XXX-X";
  }
  return "";
};

export const validarTelefonoCliente = (valor) => {
  if (!valor || valor.trim() === "") return "El teléfono es obligatorio.";

  // Permitir formatos como: 011-1234-5678, 011 1234 5678, 01112345678
  const regex = /^[\d\s-]{8,20}$/;
  if (!regex.test(valor)) {
    return "El teléfono debe contener entre 8 y 20 caracteres.";
  }
  return "";
};
