import { Container } from "react-bootstrap";
import { useState } from "react";
import { jwtDecode } from "jwt-decode";
import Clases from "./Clases";
import CambiarPlan from "./CambiarPlan";

const DashboardCliente = () => {
  const [plan, setPlan] = useState(() => {
    try {
      return jwtDecode(localStorage.getItem("token")).plan;
    } catch {
      return null;
    }
  });
  return (
    <Container as="main">
      <h1>Dashboard del cliente</h1>
      <CambiarPlan plan={plan} onActualizado={setPlan} />
      <Clases planActual={plan} />
    </Container>
  );
};

export default DashboardCliente;
