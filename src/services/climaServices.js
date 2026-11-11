import api, { validarRespuesta } from "./adminApi.js";

const climaURL = import.meta.env.VITE_API_URL_BACKEND_CLIMA;

const validarClima = (datos) => {
  if (!datos || typeof datos.capital !== "string" || typeof datos.fecha !== "string") return false;
  if (typeof datos.departamento !== "string" || !datos.unidades) return false;

  const campos = ["temperaturaMaxima", "temperaturaMinima", "probabilidadPrecipitacion", "vientoMaximo"];
  for (const campo of campos) {
    if (datos[campo] !== null && !Number.isFinite(datos[campo])) return false;
  }

  const unidades = ["temperatura", "probabilidadPrecipitacion", "viento"];
  for (const unidad of unidades) {
    if (typeof datos.unidades[unidad] !== "string") return false;
  }
  return true;
};

export const obtenerClimaApi = async (departamento, fecha, signal) => {
  const respuesta = await api.get(climaURL, { params: { departamento, fecha }, signal });
  const datos = validarRespuesta(respuesta, 200, validarClima);
  return {
    capital: datos.capital, fecha: datos.fecha,
    temperaturaMaxima: datos.temperaturaMaxima, temperaturaMinima: datos.temperaturaMinima,
    probabilidadPrecipitacion: datos.probabilidadPrecipitacion, vientoMaximo: datos.vientoMaximo,
    unidades: datos.unidades,
  };
};
