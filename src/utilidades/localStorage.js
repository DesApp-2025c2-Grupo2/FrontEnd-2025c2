// Cargar estado desde sessionStorage
export const loadState = () => {
  try {
    const serializedState = sessionStorage.getItem('reduxState');
    if (serializedState === null) {
      return undefined;
    }
    return JSON.parse(serializedState);
  } catch (err) {
    console.error('Error al cargar estado desde sessionStorage:', err);
    return undefined;
  }
};

// Guardar estado en sessionStorage
export const saveState = (state) => {
  try {
    const serializedState = JSON.stringify(state);
    sessionStorage.setItem('reduxState', serializedState);
  } catch (err) {
    console.error('Error al guardar estado en sessionStorage:', err);
  }
};

// Limpiar sessionStorage
export const clearState = () => {
  try {
    sessionStorage.removeItem('reduxState');
  } catch (err) {
    console.error('Error al limpiar sessionStorage:', err);
  }
};

