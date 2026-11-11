import api, { validarRespuesta } from "./adminApi.js";
const esUsuario = (dato) => Boolean(dato?.id && typeof dato.name === "string");

const esDetalleUsuario = (dato) =>
    esUsuario(dato) &&
    typeof dato.username === "string" &&
    typeof dato.email === "string" &&
    ["cliente", "admin"].includes(dato.role);

const datosUsuario = ({
    id,
    name,
    username,
    email,
    role,
    plan,
    estado,
    imageUrl,
}) => ({ id, name, username, email, role, plan, estado, imageUrl });

export const obtenerUsuariosApi = async (signal) =>
    validarRespuesta(
        await api.get("/users", { signal }),
        200,
        (datos) => Array.isArray(datos) && datos.every((dato) => dato?.id && typeof dato.username === "string"),
    ).map(({ id, username }) => ({ id, username }));

export const obtenerUsuarioApi = async (id, signal) =>
    datosUsuario(
        validarRespuesta(
            await api.get(`/users/${id}`, { signal }),
            200,
            (dato) => esDetalleUsuario(dato) && dato.id === id,
        ),
    );

export const actualizarUsuarioApi = async (id, datos) =>
    datosUsuario(
        validarRespuesta(
            await api.patch(`/users/${id}`, datos),
            200,
            (dato) => esDetalleUsuario(dato) && dato.id === id,
        ),
    );
    
export const eliminarUsuarioApi = async (id) =>
    validarRespuesta(await api.delete(`/users/${id}`), 204, () => true);
