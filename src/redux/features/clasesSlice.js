import { createSlice } from "@reduxjs/toolkit";


const initialState = [];
const clasesSlice = createSlice({
    name: "clasesSlice",
    initialState,
    reducers: {
        cargarClasesInicialesSlice: (state, action) => {
            const listaClases = action.payload;
            return listaClases;
        }
    }
})

export const {cargarClasesInicialesSlice} = clasesSlice.actions;
export default clasesSlice.reducer;