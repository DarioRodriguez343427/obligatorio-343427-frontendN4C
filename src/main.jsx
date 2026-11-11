import { createRoot } from 'react-dom/client'
import { ToastContainer } from 'react-toastify'
import { Provider } from 'react-redux'
import { store } from './redux/store.js'
import Rutas from './components/Rutas.jsx'
import SpinnerGlobal from './components/SpinnerGlobal.jsx'
import 'bootstrap/dist/css/bootstrap.min.css'
import './styles.css'

document.documentElement.setAttribute('data-bs-theme', 'dark')

createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <SpinnerGlobal />
    <ToastContainer theme="dark" />
    <Rutas />
  </Provider>,
)
