import { Col, Container, Row } from "react-bootstrap";
import Clases from "./Clases";
import Grafica from "./Grafica";

const Contenido = () => {
  return (
    <Container>
      <Row>
        <Col><Grafica /></Col>
        <Col><Clases /></Col>
      </Row>
    </Container>
  );
};

export default Contenido;
