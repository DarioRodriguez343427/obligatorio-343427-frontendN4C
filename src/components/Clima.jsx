import Icono from "./Icono";
import { cargarClimaSlice } from "../redux/features/clienteSlice";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Alert, Card, Col, Form, Row } from "react-bootstrap";
import { obtenerClimaApi } from "../services/climaServices";
import { aumentarContadorPeticiones, disminuirContadorPeticiones } from "../redux/features/loadingSlice";
import { mensajeErrorApi } from "../utils/erroresApi";

const departamentos = [
  ["artigas", "Artigas"], ["canelones", "Canelones"],
  ["cerro_largo", "Cerro Largo"], ["colonia", "Colonia"],
  ["durazno", "Durazno"], ["flores", "Flores"], ["florida", "Florida"],
  ["lavalleja", "Lavalleja"], ["maldonado", "Maldonado"],
  ["montevideo", "Montevideo"], ["paysandu", "Paysandú"],
  ["rio_negro", "Río Negro"], ["rivera", "Rivera"], ["rocha", "Rocha"],
  ["salto", "Salto"], ["san_jose", "San José"], ["soriano", "Soriano"],
  ["tacuarembo", "Tacuarembó"], ["treinta_y_tres", "Treinta y Tres"],
];

const obtenerLimitesFecha = () => {
  const hoy = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Montevideo", year: "numeric", month: "2-digit", day: "2-digit",
  }).format(new Date());
  const limite = new Date(`${hoy}T00:00:00Z`);
  limite.setUTCDate(limite.getUTCDate() + 15);
  return { hoy, ultimoDia: limite.toISOString().slice(0, 10) };
};

const mostrarMedida = (valor, unidad) => {
  if (valor === null) return "Sin datos";
  return `${valor} ${unidad}`;
};

const Clima = () => {
  const dispatch = useDispatch();
  const solicitud = useRef(null);
  useEffect(() => () => solicitud.current?.abort(), []);
  const { hoy, ultimoDia } = obtenerLimitesFecha();
  const [departamento, setDepartamento] = useState("");
  const [fecha, setFecha] = useState(hoy);
  const clima = useSelector((state) => state.clienteSlice.clima);
  const [consultando, setConsultando] = useState(false);
  const [error, setError] = useState("");

  const handlerConsultarClima = async () => {
    if (consultando) return;
    setError("");
    dispatch(cargarClimaSlice(null));
    const limites = obtenerLimitesFecha();
    if (!departamento || !fecha || fecha < limites.hoy || fecha > limites.ultimoDia) {
      setError("Seleccioná un departamento y una fecha entre hoy y los próximos 15 días.");
      return;
    }

    const controller = new AbortController();
    solicitud.current = controller;
    setConsultando(true);
    dispatch(aumentarContadorPeticiones());
    try {
      const resultado = await obtenerClimaApi(departamento, fecha, controller.signal);
      if (!controller.signal.aborted) dispatch(cargarClimaSlice(resultado));
    } catch (error) {
      if (!controller.signal.aborted) setError(mensajeErrorApi(error));
    } finally {
      dispatch(disminuirContadorPeticiones());
      if (!controller.signal.aborted) setConsultando(false);
    }
  };

  return (
    <Card className="panel-clima">
      <Card.Body>
        <Card.Title as="h2"><Icono nombre="partly_cloudy_day" /> Pronóstico del clima</Card.Title>
        <p>Consultá el pronóstico para la capital del departamento, desde hoy hasta los próximos 15 días.</p>
        <Form onSubmit={(event) => event.preventDefault()}>
          <Row className="g-3 align-items-end">
            <Col md={5}>
              <Form.Group controlId="climaDepartamento">
                <Form.Label><Icono nombre="location_on" /> Departamento</Form.Label>
                <Form.Select value={departamento} onChange={(event) => { setDepartamento(event.target.value); dispatch(cargarClimaSlice(null)); setError(""); }} disabled={consultando}>
                  <option value="">Seleccioná un departamento</option>
                  {departamentos.map(([valor, nombre]) => <option key={valor} value={valor}>{nombre}</option>)}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group controlId="climaFecha">
                <Form.Label><Icono nombre="calendar_month" /> Fecha</Form.Label>
                <Form.Control type="date" value={fecha} min={hoy} max={ultimoDia} onChange={(event) => { setFecha(event.target.value); dispatch(cargarClimaSlice(null)); setError(""); }} disabled={consultando} />
              </Form.Group>
            </Col>
            <Col md={3}>
              <button type="button" className="btn btn-primary" onClick={handlerConsultarClima} disabled={consultando}><Icono nombre="partly_cloudy_day" />
                {consultando ? "Consultando..." : "Consultar clima"}
              </button>
            </Col>
          </Row>
        </Form>
        <div aria-live="polite">
          {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
          {clima && (
            <div className="mt-3">
              <h3 className="h5">{clima.capital} — {clima.fecha.split("-").reverse().join("/")}</h3>
              <dl className="row mb-0">
                <dt className="col-sm-6"><Icono nombre="thermostat" /> Temperatura máxima</dt>
                <dd className="col-sm-6">{mostrarMedida(clima.temperaturaMaxima, clima.unidades.temperatura)}</dd>
                <dt className="col-sm-6"><Icono nombre="thermostat" /> Temperatura mínima</dt>
                <dd className="col-sm-6">{mostrarMedida(clima.temperaturaMinima, clima.unidades.temperatura)}</dd>
                <dt className="col-sm-6"><Icono nombre="rainy" /> Probabilidad de lluvia</dt>
                <dd className="col-sm-6">{mostrarMedida(clima.probabilidadPrecipitacion, clima.unidades.probabilidadPrecipitacion)}</dd>
                <dt className="col-sm-6"><Icono nombre="air" /> Viento máximo</dt>
                <dd className="col-sm-6">{mostrarMedida(clima.vientoMaximo, clima.unidades.viento)}</dd>
              </dl>
              <small className="text-muted">Fuente: Open-Meteo. Hora de Uruguay.</small>
            </div>
          )}
        </div>
      </Card.Body>
    </Card>
  );
};

export default Clima;
