import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom'
import Login from './Login';
import App from '../App';
import Registro from './Registro';

const ContenidoRutas = () => {

    const location = useLocation(); //usamos location para poe leer el token cada vez que cambia la url
    const existeToken = window.localStorage.getItem("token");
  return (
        <Routes location={location}>
            <Route element={existeToken ? <Navigate to="/dashboard" replace /> : <Outlet />}>
                <Route path="/login" element={<Login />} />
                <Route path="/registro" element={<Registro />} />
            </Route>
            <Route path="/dashboard" element={ existeToken ? <App /> : <Navigate to="/login" replace /> } />
            <Route path="*" element={<Navigate to="/login" replace></Navigate>}></Route>
        </Routes>
    );
};

const Rutas = () => (
    <BrowserRouter>
        <ContenidoRutas />
    </BrowserRouter>
);

export default Rutas;
