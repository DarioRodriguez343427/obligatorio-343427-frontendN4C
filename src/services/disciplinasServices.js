import axios from "axios";


const urlBase = "https://obligatorio-343427-backend-n4-c.vercel.app";

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