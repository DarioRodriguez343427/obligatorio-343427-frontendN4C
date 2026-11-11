import InformeUso from './InformeUso';
import Grafica from './Grafica';
import { Container } from 'react-bootstrap';
import Clases from './Clases';
import AgregarClase from './AgregarClase';
import CambiarPlan from './CambiarPlan';
import Clima from './Clima';

const DashboardCliente = () => (
  <Container as="main">
    <h1>Dashboard del cliente</h1>
    <InformeUso />
    <CambiarPlan />
    <Clases />
    <AgregarClase />
    <Grafica />
    <Clima />
  </Container>
);
export default DashboardCliente;
