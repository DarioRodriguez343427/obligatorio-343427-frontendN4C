import axios from "axios";

const api = axios.create({
    baseURL: "https://obligatorio-343427-backend-n4-c.vercel.app/api/v1",
    headers: {
        "Content-Type": "application/json"
    }
});

api.interceptors.response.use(
    response => response,
    error => {
        if (error.response.status === 401) {
            localStorage.removeItem("token");
        }
        return Promise.reject(error);
    }
);

export const loginApi = async (dataLogin) => {
    const resultado = await api.post("/auth/login", dataLogin);
    return resultado.data;
}

export default api;