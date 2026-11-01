import React from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Login from './Login';
import Dashboard from './Dashboard';
import App from '../App';

const Rutas = () => {
  return (
    <BrowserRouter>
        <Routes>
            <Route path="login" element={<Login />} />
            <Route path="dashboard" element={<App />} />
            {/**redireccion cuando la ruta no existe o no coincide */}
            <Route path="*" element={<Navigate to="/login" replace></Navigate>}></Route>
        </Routes>
    </BrowserRouter>
    );
};

export default Rutas;