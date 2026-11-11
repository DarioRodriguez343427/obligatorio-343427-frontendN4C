import { createSlice } from '@reduxjs/toolkit';

const loadingSlice = createSlice({
  name: 'loadingSlice',
  initialState: { contadorPeticiones: 0 },
  reducers: {
    aumentarContadorPeticiones: (state) => {
      state.contadorPeticiones += 1;
    },
    disminuirContadorPeticiones: (state) => {
      if (state.contadorPeticiones > 0) state.contadorPeticiones -= 1;
    },
  },
});

export const { aumentarContadorPeticiones, disminuirContadorPeticiones } = loadingSlice.actions;
export default loadingSlice.reducer;
