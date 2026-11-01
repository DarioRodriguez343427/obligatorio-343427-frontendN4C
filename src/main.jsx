import { createRoot } from 'react-dom/client'
import { ToastContainer } from 'react-toastify'
import { Provider } from 'react-redux'
import { store } from './redux/store.js'
import Rutas from './components/Rutas.jsx'
import 'bootstrap/dist/css/bootstrap.min.css'

createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <ToastContainer />
    <Rutas />
  </Provider>,
)
