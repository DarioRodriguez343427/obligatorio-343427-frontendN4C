import { useSelector } from 'react-redux';
import { Card } from 'react-bootstrap';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Grafica = () => {
  const clases = useSelector((state) => state.clasesSlice.clases);
  const cargada = useSelector((state) => state.clasesSlice.cargada);
  const cantidades = Object.create(null);
  for (const clase of clases) {
    const nombre = clase.disciplina?.nombre || 'Sin disciplina';
    cantidades[nombre] = (cantidades[nombre] || 0) + 1;
  }
  const datos = {
    labels: Object.keys(cantidades),
    datasets: [{ label: 'Cantidad de clases', data: Object.values(cantidades), backgroundColor: '#0d6efd' }],
  };
  return (
    <Card className="mb-3"><Card.Body>
      <Card.Title as="h2">Clases por disciplina</Card.Title>
      <p>Datos de la página actual, antes del filtro por nombre.</p>
      {!cargada ? <p>Cargando gráfica...</p> : clases.length === 0 ? <p>No hay clases para graficar.</p> : (
        <Bar data={datos} options={{ responsive: true, scales: { y: { beginAtZero: true, ticks: { precision: 0 } } } }} />
      )}
    </Card.Body></Card>
  );
};
export default Grafica;
