import UsuariosAdmin from './UsuariosAdmin';
import DisciplinasAdmin from './DisciplinasAdmin';

const DashboardAdmin = () => {
  return (
    <main className="container dashboard dashboard-admin">
      <h1>Administración</h1>
      <p className="page-intro">Gestioná los usuarios y las disciplinas del gimnasio.</p>
      <div className="admin-grid">
        <UsuariosAdmin />
        <DisciplinasAdmin />
      </div>
    </main>
  );
};
export default DashboardAdmin;
