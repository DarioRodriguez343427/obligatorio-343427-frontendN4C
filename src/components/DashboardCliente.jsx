import InformeUso from './InformeUso';
import Grafica from './Grafica';
import { Container } from 'react-bootstrap';
import Clases from './Clases';
import AgregarClase from './AgregarClase';
import CambiarPlan from './CambiarPlan';
import Clima from './Clima';

const DashboardCliente = () => (
  <Container as="main" className="dashboard dashboard-cliente">
    <h1>Mi entrenamiento</h1>
    <p className="page-intro">Organizá tus clases y seguí tu actividad.</p>
    <div className="cliente-grid">
    <InformeUso />
    <CambiarPlan />
    <Clases />
    <AgregarClase />
    <Grafica />
    <Clima />
    </div>
  </Container>
);
export default DashboardCliente;
