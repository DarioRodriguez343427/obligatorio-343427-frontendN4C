import { createSlice } from '@reduxjs/toolkit';
const usuariosAdminSlice = createSlice({
  name: 'usuariosAdmin',
  initialState: { lista: [], seleccionado: null },
  reducers: {
    cargarUsuarios: (state, action) => { state.lista = action.payload; state.seleccionado = null; },
    seleccionarUsuario: (state, action) => { state.seleccionado = action.payload; },
    actualizarUsuario: (state, action) => {
      if (state.seleccionado?.id === action.payload.id) state.seleccionado = action.payload;
      const usuario = state.lista.find((u) => u.id === action.payload.id);
      if (usuario) usuario.username = action.payload.username;
    },
    eliminarUsuario: (state, action) => {
      state.lista = state.lista.filter((u) => u.id !== action.payload);
      if (state.seleccionado?.id === action.payload) state.seleccionado = null;
    },
  },
});
export const { cargarUsuarios, seleccionarUsuario, actualizarUsuario, eliminarUsuario } = usuariosAdminSlice.actions;
export default usuariosAdminSlice.reducer;
