import Icono from "./Icono";
import { useDispatch } from "react-redux";
import { limpiarClienteSlice } from "../redux/features/clienteSlice";
import { useState } from 'react'
import { jwtDecode } from 'jwt-decode'
import { useNavigate } from 'react-router-dom'
import { cancelarVencimiento } from '../utils/sesion';
import { Container } from 'react-bootstrap';

const Menu = () => {

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [fotoFallida, setFotoFallida] = useState(false);
  let usuario = {};
  try { usuario = jwtDecode(localStorage.getItem('token')); } catch { /* Dashboard controla el acceso. */ }
  const nombre = usuario.username || usuario.name || (usuario.role === 'admin' ? 'Administrador' : 'Cliente');
  const foto = localStorage.getItem('imageUrl');
  const handlerErrorFoto = () => setFotoFallida(true);

  const handleCerrarSesion = () => {
    cancelarVencimiento();
    dispatch(limpiarClienteSlice());
    window.localStorage.removeItem("token");
    window.localStorage.removeItem("imageUrl");
    navigate("/login", {replace: true});
  }

  return (
    <header className="app-header">
      <Container className="header-content">
        <img className="header-logo" src="/logo.svg" alt="GYM FIT" />
        <div className="header-account">
          {foto && !fotoFallida ? <img className="avatar" src={foto} alt="Foto de perfil" onError={handlerErrorFoto} /> : <span className="avatar avatar-placeholder" aria-hidden="true">{nombre.charAt(0).toUpperCase()}</span>}
          <div className="account-info"><strong>{nombre}</strong><small>{usuario.role === 'admin' ? 'Administrador' : 'Cliente'}</small></div>
          <button type="button" className="btn btn-outline-secondary" onClick={handleCerrarSesion}><Icono nombre="logout" /> Cerrar sesión</button>
        </div>
      </Container>
    </header>
  )
}

export default Menu
