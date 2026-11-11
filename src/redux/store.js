import { configureStore } from '@reduxjs/toolkit'
import clasesSlice from './features/clasesSlice.js'
import disciplinasSlice from './features/disciplinaSlice.js'
import usuariosAdmin from './features/usuariosAdminSlice.js'

export const store = configureStore({
    reducer: {
        clasesSlice,
        disciplinasSlice,
        usuariosAdmin,
    },
})
