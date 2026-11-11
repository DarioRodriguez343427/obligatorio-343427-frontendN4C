import { jwtDecode } from "jwt-decode";

let temporizadorId = null;

export const programarVencimiento = (token, alVencer) => {
    clearTimeout(temporizadorId);

    try {
        const { exp } = jwtDecode(token);
        if (!exp) {
            localStorage.removeItem("token");
            alVencer();
            return;
        }
        const milisegundosRestantes = exp * 1000 - Date.now();
        if (milisegundosRestantes <= 0) {
            localStorage.removeItem("token");
            alVencer();
            return;
        }
        temporizadorId = setTimeout(() => {
            localStorage.removeItem("token");
            alVencer();
        }, milisegundosRestantes);
    } catch {
        localStorage.removeItem("token");
        alVencer();
    }
};

export const cancelarVencimiento = () => {
    clearTimeout(temporizadorId);
    temporizadorId = null;
};