import { useDispatch } from "react-redux";
import { limpiarClienteSlice } from "../redux/features/clienteSlice";
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { cancelarVencimiento } from '../utils/sesion';
import { Col, Container, Row } from 'react-bootstrap';

const Menu = () => {
  
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleCerrarSesion = () => {
    cancelarVencimiento();
    dispatch(limpiarClienteSlice());
    window.localStorage.removeItem("token");
    window.localStorage.removeItem("imageUrl");
    navigate("/login", {replace: true});  
  }

  return (
    <Container>
      <Row style={{}}>
        <Col>
          <p>desde menu</p>
        </Col>
        <Col>
          <button onClick={handleCerrarSesion}>Cerrar sesion</button>
        </Col>
      </Row>
    </Container>
  )
}

export default Menu
