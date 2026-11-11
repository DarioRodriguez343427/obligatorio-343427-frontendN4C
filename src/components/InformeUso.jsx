import Icono from "./Icono";
import { useSelector } from 'react-redux';
import { Card, ProgressBar } from 'react-bootstrap';

const InformeUso = () => {
  const total = useSelector((state) => state.clasesSlice.total);
  const cargada = useSelector((state) => state.clasesSlice.cargada);
  const plan = useSelector((state) => state.clienteSlice.plan);
  const porcentaje = Math.round(total / 4 * 100);
  return (
    <Card className="panel-uso"><Card.Body>
      <Card.Title as="h2"><Icono nombre="monitoring" /> Uso de clases</Card.Title>
      {!cargada ? <p>Cargando uso...</p> : plan === 'plus' ? <>
        <p>{total} de 4 clases utilizadas ({porcentaje}%).</p>
        <ProgressBar now={Math.min(100, porcentaje)} label={`${porcentaje}%`} />
      </> : <p>{total} clases registradas. Plan Premium.</p>}
    </Card.Body></Card>
  );
};
export default InformeUso;
