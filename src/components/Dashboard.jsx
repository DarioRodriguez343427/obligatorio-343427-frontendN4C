import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { toast } from 'react-toastify';
import { programarVencimiento, cancelarVencimiento } from '../utils/sesion';
import { actualizarPlanSlice, limpiarClienteSlice } from '../redux/features/clienteSlice';
import Menu from './Menu';
import DashboardAdmin from './DashboardAdmin';
import DashboardCliente from './DashboardCliente';

const Dashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [momentoIngreso] = useState(() => Date.now());
  const token = localStorage.getItem('token');
  let datos;
  try { datos = jwtDecode(token); } catch { /* Se redirige al login. */ }
  const accesoValido = Boolean(datos?.exp * 1000 > momentoIngreso && ['admin', 'cliente'].includes(datos?.role));
  const role = datos?.role;
  const plan = datos?.plan;

  useEffect(() => {
    const salir = () => {
      localStorage.removeItem('token');
      localStorage.removeItem('imageUrl');
      dispatch(limpiarClienteSlice());
      navigate('/login', { replace: true });
    };
    if (!accesoValido) { salir(); return; }
    dispatch(actualizarPlanSlice(plan || null));
    programarVencimiento(token, () => {
      toast.info('Tu sesión venció. Iniciá sesión nuevamente.');
      salir();
    });
    return () => cancelarVencimiento();
  }, [accesoValido, token, plan, dispatch, navigate]);

  if (!accesoValido) return null;
  return <><Menu />{role === 'admin' ? <DashboardAdmin /> : <DashboardCliente />}</>;
};
export default Dashboard;
