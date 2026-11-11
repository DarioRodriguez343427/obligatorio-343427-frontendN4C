import api, { validarRespuesta } from "./adminApi.js";

const clasesURL = import.meta.env.VITE_API_URL_BACKEND_CLASES;

const validarClase = (clase) => {
  if (!clase || !clase.id) return false;
  if (typeof clase.nombre !== "string") return false;
  if (typeof clase.descripcion !== "string") return false;
  if (!clase.disciplina?.id || typeof clase.disciplina.nombre !== "string") return false;
  return true;
};

const resumirClase = (clase) => ({
  id: clase.id, nombre: clase.nombre, descripcion: clase.descripcion,
  disciplina: { id: clase.disciplina.id, nombre: clase.disciplina.nombre },
});

const validarListadoClases = (datos) => {
  if (!datos || !Array.isArray(datos.clases)) return false;
  if (!Number.isInteger(datos.pagina) || datos.pagina < 1) return false;
  if (!Number.isInteger(datos.limite) || datos.limite < 1 || datos.limite > 100) return false;
  if (!Number.isInteger(datos.total) || datos.total < 0) return false;
  if (datos.totalPaginas !== Math.ceil(datos.total / datos.limite)) return false;

  for (const clase of datos.clases) {
    if (!validarClase(clase)) return false;
  }
  return true;
};

export const crearClaseApi = async (datos) => {
  const respuesta = await api.post(clasesURL, datos);
  return resumirClase(validarRespuesta(respuesta, 201, validarClase));
};

export const actualizarClaseApi = async (id, datos) => {
  const respuesta = await api.patch(`${clasesURL}/${id}`, datos);
  const clase = validarRespuesta(respuesta, 200, validarClase);
  if (clase.id !== id) throw new Error("El servidor devolvió otra clase.");
  return resumirClase(clase);
};

export const eliminarClaseApi = async (id) => {
  const respuesta = await api.delete(`${clasesURL}/${id}`);
  if (respuesta.status !== 204) {
    throw new Error("El servidor no confirmó la eliminación.");
  }
};

export const obtenerClasesApi = async (signal, pagina = 1, limite = 10) => {
  const respuesta = await api.get(clasesURL, {
    signal,
    params: { pagina, limite },
  });
  const datos = validarRespuesta(respuesta, 200, validarListadoClases);

  // Guardamos solamente los campos que necesita el listado.
  const clases = datos.clases.map(resumirClase);

  return {
    clases,
    pagina: datos.pagina,
    limite: datos.limite,
    total: datos.total,
    totalPaginas: datos.totalPaginas,
  };
};
