import api, { validarRespuesta } from "./adminApi";

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

export const obtenerClimaApi = async (departamento, fecha) => {
  const respuesta = await api.get("/clima", { params: { departamento, fecha } });
  return validarRespuesta(respuesta, 200, validarClima);
};
