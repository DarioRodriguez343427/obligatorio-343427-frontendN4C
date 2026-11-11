import UsuariosAdmin from './UsuariosAdmin';
import DisciplinasAdmin from './DisciplinasAdmin';

const DashboardAdmin = () => {
  return (
    <main className="container">
      <h1>Administración</h1>
      <UsuariosAdmin />
      <DisciplinasAdmin />
    </main>
  );
};
export default DashboardAdmin;
