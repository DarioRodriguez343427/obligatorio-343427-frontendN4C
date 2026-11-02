import React from 'react'
import { useNavigate } from 'react-router-dom'
import { cancelarVencimiento } from '../utils/sesion';

const Menu = () => {
  
  const navigate = useNavigate();

  const handleCerrarSesion = () => {
    cancelarVencimiento();
    window.localStorage.removeItem("token");
    navigate("/login", {replace: true});  
  }

  return (
    <div className='menu'>
      <p>desde menu</p>
      <button onClick={handleCerrarSesion}>Cerrar sesion</button>
    </div>
  )
}

export default Menu
