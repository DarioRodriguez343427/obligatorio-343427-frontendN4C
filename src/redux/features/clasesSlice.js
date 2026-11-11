import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  clases: [],
  pagina: 1,
  limite: 10,
  total: 0,
  totalPaginas: 0,
};

const clasesSlice = createSlice({
  name: "clasesSlice",
  initialState,
  reducers: {
    cargarClasesInicialesSlice: (state, action) => {
      state.clases = action.payload.clases;
      state.pagina = action.payload.pagina;
      state.limite = action.payload.limite;
      state.total = action.payload.total;
      state.totalPaginas = action.payload.totalPaginas;
    },
    limpiarClasesSlice: () => initialState,
  },
});

export const { cargarClasesInicialesSlice, limpiarClasesSlice } = clasesSlice.actions;
export default clasesSlice.reducer;
