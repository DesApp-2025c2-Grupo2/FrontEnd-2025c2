export const Parentesco = {
  Titular: 1,
  Conyuge: 2,
  Hijo_a: 3,
  FamiliarACargo: 4,
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
