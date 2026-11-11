import api, { validarRespuesta } from "./adminApi.js";

const disciplinasURL = import.meta.env.VITE_API_URL_BACKEND_DISCIPLINAS;

const esDisciplina = (dato) =>
  Boolean(dato?.id && typeof dato.nombre === "string");

export const obtenerDisciplinasApi = async (signal) =>
  validarRespuesta(
    await api.get(disciplinasURL, { signal }),
    200,
    (datos) => Array.isArray(datos) && datos.every(esDisciplina),
  );

export const crearDisciplinaApi = async (datos) =>
  validarRespuesta(await api.post(disciplinasURL, datos), 201, esDisciplina);

export const actualizarDisciplinaApi = async (id, datos) =>
  validarRespuesta(
    await api.patch(`${disciplinasURL}/${id}`, datos),
    200,
    (dato) => esDisciplina(dato) && dato.id === id,
  );
  
export const eliminarDisciplinaApi = async (id) =>
  validarRespuesta(await api.delete(`${disciplinasURL}/${id}`), 204, () => true);
