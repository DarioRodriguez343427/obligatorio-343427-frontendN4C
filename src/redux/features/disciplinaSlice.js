import { createSlice } from '@reduxjs/toolkit';
const disciplinasSlice = createSlice({
  name: 'disciplinasSlice',
  initialState: [],
  reducers: {
    cargarDisciplinasSlice: (state, action) => action.payload,
    agregarDisciplinaSlice: (state, action) => { state.push(action.payload); },
    actualizarDisciplinaSlice: (state, action) => {
      const indice = state.findIndex((d) => d.id === action.payload.id);
      if (indice !== -1) state[indice] = action.payload;
    },
    eliminarDisciplinaSlice: (state, action) => state.filter((d) => d.id !== action.payload),
  },
});
export const { cargarDisciplinasSlice, agregarDisciplinaSlice, actualizarDisciplinaSlice, eliminarDisciplinaSlice } = disciplinasSlice.actions;
export default disciplinasSlice.reducer;
