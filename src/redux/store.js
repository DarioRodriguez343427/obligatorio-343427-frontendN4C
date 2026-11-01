import { configureStore } from '@reduxjs/toolkit'
import disciplinaSlice from "./features/disciplinaSlice"

export const store = configureStore({
    reducer: {
        disciplinaSlice
    },
})