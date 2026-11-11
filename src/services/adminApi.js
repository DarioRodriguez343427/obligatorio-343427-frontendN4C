import axios from 'axios';

const adminApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL_BACKEND,
  headers: { 'Content-Type': 'application/json' },
});
adminApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
export const validarRespuesta = (respuesta, estado, esValido) => {
  if (respuesta.status !== estado || !esValido(respuesta.data)) {
    throw new Error('El servidor devolvió una respuesta inesperada.');
  }
  return respuesta.data;
};
export default adminApi;
