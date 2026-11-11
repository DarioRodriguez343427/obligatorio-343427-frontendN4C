import { actualizarPlanSlice, limpiarClienteSlice } from "../redux/features/clienteSlice";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Card } from "react-bootstrap";
import { toast } from "react-toastify";
import { cambiarPlanApi } from "../services/clienteServices";
import { aumentarContadorPeticiones, disminuirContadorPeticiones } from "../redux/features/loadingSlice";
import { programarVencimiento } from "../utils/sesion";
import { mensajeErrorApi } from "../utils/erroresApi";

const CambiarPlan = () => {
  const plan = useSelector((state) => state.clienteSlice.plan);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [cambiando, setCambiando] = useState(false);

  const handlerCambiarPlan = async () => {
    if (plan !== "plus" || cambiando) return;
    setCambiando(true);
    dispatch(aumentarContadorPeticiones());
    try {
      const resultado = await cambiarPlanApi();
      localStorage.setItem("token", resultado.token);
      programarVencimiento(resultado.token, () => {
        localStorage.removeItem("token");
        localStorage.removeItem("imageUrl");
        dispatch(limpiarClienteSlice());
        toast.info("Tu sesión venció. Iniciá sesión nuevamente.");
        navigate("/login", { replace: true });
      });
      dispatch(actualizarPlanSlice(resultado.plan));
      toast.success("Tu plan ahora es Premium");
    } catch (error) {
      toast.error(mensajeErrorApi(error));
    } finally {
      dispatch(disminuirContadorPeticiones());
      setCambiando(false);
    }
  };

  return (
    <Card className="mb-3">
      <Card.Body>
        <Card.Title as="h2">Mi plan: {plan === "premium" ? "Premium" : "Plus"}</Card.Title>
        {plan === "plus" && (
          <>
            <p>Pasá a Premium para crear más de 4 clases.</p>
            <button type="button" className="btn btn-primary" onClick={handlerCambiarPlan} disabled={cambiando}>
              {cambiando ? "Cambiando..." : "Cambiar a Premium"}
            </button>
          </>
        )}
        {plan === "premium" && <p>Ya tenés el plan Premium.</p>}
      </Card.Body>
    </Card>
  );
};

export default CambiarPlan;
