import React from 'react'
import { useNavigate } from 'react-router-dom'
import { cancelarVencimiento } from '../utils/sesion';
import { Col, Container, Row } from 'react-bootstrap';

const Menu = () => {
  
  const navigate = useNavigate();

  const handleCerrarSesion = () => {
    cancelarVencimiento();
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
