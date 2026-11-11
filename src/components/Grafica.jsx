import Icono from "./Icono";
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
    datasets: [{ label: 'Cantidad de clases', data: Object.values(cantidades), backgroundColor: ['#f5c518', '#77818e', '#4e5968'], borderRadius: 5, maxBarThickness: 48 }],
  };
  return (
    <Card className="panel-grafica"><Card.Body>
      <Card.Title as="h2"><Icono nombre="bar_chart" /> Clases por disciplina</Card.Title>
      <p>Datos de la página actual, antes del filtro por nombre.</p>
      {!cargada ? <p>Cargando gráfica...</p> : clases.length === 0 ? <p>No hay clases para graficar.</p> : (
        <div className="chart-container"><Bar data={datos} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { ticks: { color: "#adb5c2" }, grid: { display: false } }, y: { beginAtZero: true, ticks: { precision: 0, color: "#adb5c2" }, grid: { color: "#303640" } } } }} /></div>
      )}
    </Card.Body></Card>
  );
};
export default Grafica;
