import { createSlice } from "@reduxjs/toolkit";


const initialState = [];
const disciplinasSlice = createSlice({
    name: "disciplinasSlice",
    initialState,
    reducers: {
        cargarDisciplinasSlice: (state, action) => {
            const listaDisciplinas = action.payload;
            return listaDisciplinas;
        }
    }
})

export const {cargarDisciplinasSlice} = disciplinasSlice.actions;
export default disciplinasSlice.reducer;