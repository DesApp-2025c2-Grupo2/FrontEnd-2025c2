export const Parentesco = {
  Titular: 0,
  Conyuge: 1,
  Hijo_a: 2,
  FamiliarACargo: 3,
};

export const parentescos = [
  { id: Parentesco.Titular, nombre: "Titular" },
  { id: Parentesco.Conyuge, nombre: "Cónyuge" },
  { id: Parentesco.Hijo_a, nombre: "Hijo/a" },
  { id: Parentesco.FamiliarACargo, nombre: "Familiar a Cargo" },
];

export const getParentescoNombre = (parentescoId) => {
  const parentesco = parentescos.find((p) => p.id === parentescoId);
  return parentesco ? parentesco.nombre : "Desconocido";
};
