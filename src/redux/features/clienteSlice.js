import { createSlice } from '@reduxjs/toolkit';

const clienteSlice = createSlice({
  name: 'clienteSlice',
  initialState: { plan: null, clima: null },
  reducers: {
    actualizarPlanSlice: (state, action) => { state.plan = action.payload; },
    cargarClimaSlice: (state, action) => { state.clima = action.payload; },
    limpiarClienteSlice: () => ({ plan: null, clima: null }),
  },
});
export const { actualizarPlanSlice, cargarClimaSlice, limpiarClienteSlice } = clienteSlice.actions;
export default clienteSlice.reducer;
