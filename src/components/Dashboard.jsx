import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Menu from './Menu';
import DashboardAdmin from './DashboardAdmin';
import DashboardCliente from './DashboardCliente';

const Dashboard = () => {
  const navigate = useNavigate();
  const [momentoIngreso] = useState(() => Date.now());
  const token = localStorage.getItem('token');
  let role;
  try {
    const datos = jwtDecode(token);
    if (datos.exp * 1000 > momentoIngreso) role = datos.role;
  } catch {
    // Un token ausente o mal formado no permite entrar al dashboard.
  }
  const accesoValido = role === 'admin' || role === 'cliente';

  useEffect(() => {
    if (!accesoValido) {
      localStorage.removeItem('token');
      localStorage.removeItem('imageUrl');
      navigate('/login', { replace: true });
    }
  }, [accesoValido, navigate]);

  if (!accesoValido) return null;

  return (
    <>
      <Menu />
      {role === 'admin' ? <DashboardAdmin /> : <DashboardCliente />}
    </>
  );
};

export default Dashboard;
