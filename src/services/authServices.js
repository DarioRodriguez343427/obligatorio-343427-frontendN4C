import axios from "axios";

const authURL = import.meta.env.VITE_API_URL_BACKEND_AUTH;

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL_BACKEND,
    headers: {
        "Content-Type": "application/json"
    }
});

api.interceptors.response.use(
    response => response,
    error => {
        if (error.response?.status === 401) {
            localStorage.removeItem("token");
        }
        return Promise.reject(error);
    }
);

export const loginApi = async (dataLogin) => {
    const resultado = await api.post(`${authURL}/login`, dataLogin);
    if (resultado.status !== 200 || !resultado.data?.token || !resultado.data?.user?.id) {
        throw new Error("El servidor no devolvió una sesión válida.");
    }
    return resultado.data;
}

export const registerApi = async (datosRegistro) => {
    const resultado = await api.post(`${authURL}/register`, datosRegistro);
    if (resultado.status !== 201 || !resultado.data?.token || !resultado.data?.user?.id) {
        throw new Error("El servidor no devolvió un registro válido.");
    }
    return resultado.data;
};

export default api;
