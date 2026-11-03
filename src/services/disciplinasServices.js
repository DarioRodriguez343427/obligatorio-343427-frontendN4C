import axios from "axios";

const baseURL = "https://obligatorio-343427-backend-n4-c.vercel.app/api/v1";

const api = axios.create({
    baseURL,
    headers: {
        "Content-Type": "application/json"
    }
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const obtenerDisciplinasApi = async (signal) => {
    const response = await axios.get(
        `${urlBase}/disciplinas`, {
            signal: signal
        }
    );
    const disciplinas = response.data;
    console.log('disciplinas: ', disciplinas);
    return disciplinas;
}