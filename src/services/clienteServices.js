import { jwtDecode } from "jwt-decode";
import api, { validarRespuesta } from "./adminApi";

const validarCambioPlan = (datos) => {
  if (!datos?.user?.id || datos.user.plan !== "premium") return false;
  if (typeof datos.token !== "string") return false;
  try {
    const usuario = jwtDecode(datos.token);
    return usuario.id === datos.user.id && usuario.plan === "premium" && usuario.role === "cliente" && usuario.exp * 1000 > Date.now();
  } catch {
    return false;
  }
};

export const cambiarPlanApi = async () => {
  const respuesta = await api.patch("/users/plan");
  const datos = validarRespuesta(respuesta, 200, validarCambioPlan);
  return { token: datos.token, plan: datos.user.plan };
};

const validarDescripcion = (datos) => {
  if (typeof datos?.descripcion !== "string") return false;
  const texto = datos.descripcion.trim();
  return texto.length >= 3 && texto.length <= 500;
};

export const generarDescripcionApi = async (datos, signal) => {
  const respuesta = await api.post("/ia/descripcion", datos, { signal });
  const resultado = validarRespuesta(respuesta, 200, validarDescripcion);
  return resultado.descripcion.trim();
};
