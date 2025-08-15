export const soloNumeros = (valor) => {
  return valor.replace(/[^0-9]/g, "");
};

export const sinNumeros = (valor) => {
  return valor.replace(/[0-9]/g, "");
};

export const soloNumerosYGuiones = (valor) => {
  return valor.replace(/[^0-9-]/g, "");
};

export const soloNumerosGuionesEspacios = (valor) => {
  return valor.replace(/[^0-9\-\s]/g, "");
};

export const formatearCUIT = (valor) => {
  // Remover todo excepto números
  const numeros = valor.replace(/[^0-9]/g, "");

  // Aplicar formato XX-XXXXXXXX-X
  if (numeros.length <= 2) {
    return numeros;
  } else if (numeros.length <= 10) {
    return `${numeros.slice(0, 2)}-${numeros.slice(2)}`;
  } else {
    return `${numeros.slice(0, 2)}-${numeros.slice(2, 10)}-${numeros.slice(
      10,
      11
    )}`;
  }
};

export const soloLetrasYEspacios = (valor) => {
  return valor.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, "");
};
