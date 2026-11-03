import { createSlice } from "@reduxjs/toolkit";


const initialState = [];
const clasesSlice = createSlice({
    name: "clasesSlice",
    initialState,
    reducers: {
        cargarClasesSlice: (state, action) => {
            const listaClases = action.payload;
            return listaClases;
        }
    }
})

export const {cargarClasesSlice} = clasesSlice.actions;
export default clasesSlice.reducer;