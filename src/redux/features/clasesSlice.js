import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  clases: [], primeraPagina: [], pagina: 1, limite: 10, paginaSolicitada: 1, limiteSolicitado: 10, total: 0,
  totalPaginas: 0, cargada: false, claseEditando: null, filtro: '',
};
const resumirClase = (clase) => ({
  id: clase.id, nombre: clase.nombre, descripcion: clase.descripcion,
  disciplina: { id: clase.disciplina.id, nombre: clase.disciplina.nombre },
});
const clasesSlice = createSlice({
  name: 'clasesSlice', initialState,
  reducers: {
    modificarFiltroSlice: (state, action) => { state.filtro = action.payload; },
    cargarClasesInicialesSlice: (state, action) => {
      const datos = action.payload;
      state.clases = datos.clases;
      state.pagina = datos.pagina;
      state.limite = datos.limite;
      state.total = datos.total;
      state.totalPaginas = datos.totalPaginas;
      state.cargada = true;
      if (datos.pagina === 1) state.primeraPagina = datos.clases;
    },
    solicitarPaginaSlice: (state, action) => { state.paginaSolicitada = action.payload; },
    solicitarLimiteSlice: (state, action) => { state.limiteSolicitado = action.payload; state.paginaSolicitada = 1; },
    seleccionarClaseSlice: (state, action) => { state.claseEditando = action.payload; },
    agregarClaseSlice: (state, action) => {
      const clase = resumirClase(action.payload);
      state.primeraPagina = [clase, ...state.primeraPagina].slice(0, state.limite);
      state.clases = state.primeraPagina;
      state.pagina = 1;
      state.paginaSolicitada = 1;
      state.total += 1;
      state.totalPaginas = Math.ceil(state.total / state.limite);
      state.claseEditando = null;
    },
    actualizarClaseSlice: (state, action) => {
      const clase = resumirClase(action.payload);
      state.clases = state.clases.map((c) => c.id === clase.id ? clase : c);
      state.primeraPagina = state.primeraPagina.map((c) => c.id === clase.id ? clase : c);
      state.claseEditando = null;
    },
    eliminarClaseSlice: (state, action) => {
      state.clases = state.clases.filter((c) => c.id !== action.payload);
      state.primeraPagina = state.primeraPagina.filter((c) => c.id !== action.payload);
      state.total = Math.max(0, state.total - 1);
      state.totalPaginas = Math.ceil(state.total / state.limite);
      if (state.claseEditando?.id === action.payload) state.claseEditando = null;
    },
    completarPaginaSlice: (state, action) => {
      // El GET de un único registro solo completa el hueco dejado por un borrado.
      if (action.payload && !state.clases.some((c) => c.id === action.payload.id)) {
        state.clases.push(resumirClase(action.payload));
        if (state.pagina === 1) state.primeraPagina = state.clases;
      }
    },
    limpiarClasesSlice: () => initialState,
  },
});
export const { modificarFiltroSlice, solicitarPaginaSlice, solicitarLimiteSlice, cargarClasesInicialesSlice, seleccionarClaseSlice, agregarClaseSlice, actualizarClaseSlice, eliminarClaseSlice, completarPaginaSlice, limpiarClasesSlice } = clasesSlice.actions;
export default clasesSlice.reducer;

// Tabla y gráfica comparten el filtro sobre la página cargada, sin consultar la API.
export const filtrarClasesPorNombre = (state) => {
  const { clases, filtro } = state.clasesSlice;
  const texto = filtro.trim().toLowerCase();
  if (texto === '') return clases;
  return clases.filter((clase) => clase.nombre.toLowerCase().includes(texto));
};
