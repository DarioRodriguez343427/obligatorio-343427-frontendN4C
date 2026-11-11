export const mensajeErrorApi = (error) => {
  const datos = error.response?.data;
  return datos?.errors?.map((detalle) => detalle.message).filter(Boolean).join('. ')
    || datos?.message || datos?.error || error.message || 'No se pudo completar la operación.';
};
