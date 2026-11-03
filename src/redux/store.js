import { configureStore } from '@reduxjs/toolkit'
import clasesSlice from './features/clasesSlice.js'

export const store = configureStore({
    reducer: {
        clasesSlice,
    },
})