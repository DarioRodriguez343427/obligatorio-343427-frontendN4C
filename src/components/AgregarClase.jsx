import Icono from "./Icono";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useFormik } from "formik";
import { Alert, Card, Form } from "react-bootstrap";
import { crearClaseApi, actualizarClaseApi } from "../services/clasesServices";
import { agregarClaseSlice, actualizarClaseSlice, seleccionarClaseSlice } from "../redux/features/clasesSlice";
import { obtenerDisciplinasApi } from "../services/disciplinasServices";
import { cargarDisciplinasSlice } from "../redux/features/disciplinaSlice";
import { aumentarContadorPeticiones, disminuirContadorPeticiones } from "../redux/features/loadingSlice";
import { esquemaClase } from "../utils/validacionesClases";
import { mensajeErrorApi } from "../utils/erroresApi";
import { generarDescripcionApi } from "../services/clienteServices";
import { toast } from "react-toastify";

const AgregarClase = () => {
  const clase = useSelector((state) => state.clasesSlice.claseEditando);
  const { total, cargada, pagina, paginaSolicitada, limite, limiteSolicitado } = useSelector((state) => state.clasesSlice);
  const plan = useSelector((state) => state.clienteSlice.plan);
  const bloqueado = useSelector((state) => state.loadingSlice.contadorPeticiones > 0);
  const limiteAlcanzado = plan === "plus" && total >= 4;
  const dispatch = useDispatch();
  const disciplinas = useSelector((state) => state.disciplinasSlice);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState("");
  const [intento, setIntento] = useState(0);
  const [generando, setGenerando] = useState(false);
  const [errorIA, setErrorIA] = useState("");
  const solicitudIA = useRef(null);

  useEffect(() => {
    return () => solicitudIA.current?.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const cargar = async () => {
      setCargando(true);
      setErrorCarga("");
      dispatch(aumentarContadorPeticiones());
      try {
        const datos = await obtenerDisciplinasApi(controller.signal);
        if (!controller.signal.aborted) {
          const lista = datos.map((disciplina) => ({ id: disciplina.id, nombre: disciplina.nombre }));
          dispatch(cargarDisciplinasSlice(lista));
        }
      } catch (error) {
        if (!controller.signal.aborted) setErrorCarga(mensajeErrorApi(error));
      } finally {
        dispatch(disminuirContadorPeticiones());
        if (!controller.signal.aborted) setCargando(false);
      }
    };
    cargar();
    return () => controller.abort();
  }, [dispatch, intento]);

  const formik = useFormik({
    initialValues: {
      nombre: clase?.nombre || "",
      descripcion: clase?.descripcion || "",
      disciplina: clase?.disciplina?.id || "",
      detalles: "",
    },
    enableReinitialize: true,
    validationSchema: esquemaClase,
    validateOnMount: true,
    onSubmit: async (valores, { resetForm }) => {
      if (bloqueado || generando || cargando || errorCarga || (!clase && limiteAlcanzado)) return;
      if (!cargada || pagina !== paginaSolicitada || limite !== limiteSolicitado) return;
      const datos = {
        nombre: valores.nombre.trim(), descripcion: valores.descripcion.trim(), disciplina: valores.disciplina,
      };
      dispatch(aumentarContadorPeticiones());
      try {
        if (clase) {
          const actualizada = await actualizarClaseApi(clase.id, datos);
          dispatch(actualizarClaseSlice(actualizada));
          toast.success("Clase actualizada");
        } else {
          const nueva = await crearClaseApi(datos);
          dispatch(agregarClaseSlice(nueva));
          toast.success("Clase agregada");
        }
        resetForm();
        setErrorIA("");
      } catch (error) {
        toast.error(mensajeErrorApi(error));
      } finally {
        dispatch(disminuirContadorPeticiones());
      }
    },
  });

  const handlerGuardar = () => {
    if (!formik.isSubmitting) formik.submitForm();
  };
  const handlerCancelar = () => {
    formik.resetForm();
    setErrorIA("");
    dispatch(seleccionarClaseSlice(null));
  };
  const handlerGenerarDescripcion = async () => {
    if (generando || formik.isSubmitting || deshabilitado) return;
    const nombre = formik.values.nombre.trim();
    const detalles = formik.values.detalles.trim();
    if (nombre.length < 3 || nombre.length > 80) {
      setErrorIA("Para generar la descripción, ingresá un nombre de entre 3 y 80 caracteres.");
      return;
    }
    if (detalles.length < 3 || detalles.length > 500) {
      setErrorIA("Ingresá detalles de entre 3 y 500 caracteres para orientar a la IA.");
      return;
    }
    const controller = new AbortController();
    solicitudIA.current = controller;
    setGenerando(true);
    setErrorIA("");
    dispatch(aumentarContadorPeticiones());
    try {
      const descripcion = await generarDescripcionApi({ nombre, detalles }, controller.signal);
      if (!controller.signal.aborted) {
        await formik.setFieldValue("descripcion", descripcion);
        toast.success("Descripción generada. Podés editarla antes de guardar.");
      }
    } catch (error) {
      if (!controller.signal.aborted) setErrorIA(mensajeErrorApi(error));
    } finally {
      dispatch(disminuirContadorPeticiones());
      if (!controller.signal.aborted) setGenerando(false);
    }
  };
  const handlerEvitarEnvio = (evento) => evento.preventDefault();
  const handlerReintentar = () => setIntento(intento + 1);
  const deshabilitado = bloqueado || cargando || Boolean(errorCarga) || disciplinas.length === 0 || (!clase && limiteAlcanzado);

  return (
    <Card className="panel-agregar">
      <Card.Body>
        <Card.Title as="h2"><Icono nombre={clase ? "edit" : "add"} /> {clase ? "Editar clase" : "Agregar clase"}</Card.Title>
        {!clase && limiteAlcanzado && <Alert variant="info">Tu plan Plus permite hasta 4 clases. Podés editar o eliminar las que ya tenés.</Alert>}
        {errorCarga && (
          <Alert variant="danger">
            <p>{errorCarga}</p>
            <button type="button" className="btn btn-outline-danger" onClick={handlerReintentar}><Icono nombre="refresh" /> Reintentar disciplinas</button>
          </Alert>
        )}
        {!cargando && !errorCarga && disciplinas.length === 0 && <p>No hay disciplinas disponibles para agregar clases.</p>}
        <Form onSubmit={handlerEvitarEnvio} noValidate>
          <fieldset disabled={deshabilitado || formik.isSubmitting || generando}>
            <Form.Group className="mb-3" controlId="clase-nombre">
              <Form.Label><Icono nombre="label" /> Nombre</Form.Label>
              <Form.Control name="nombre" value={formik.values.nombre} onChange={formik.handleChange} onBlur={formik.handleBlur} isInvalid={Boolean(formik.touched.nombre && formik.errors.nombre)} maxLength={80} />
              <Form.Control.Feedback type="invalid">{formik.errors.nombre}</Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3" controlId="clase-detalles-ia">
              <Form.Label><Icono nombre="edit_note" /> Detalles para la IA (opcional)</Form.Label>
              <Form.Control as="textarea" rows={2} name="detalles" value={formik.values.detalles} onChange={formik.handleChange} maxLength={500} />
              <Form.Text>Necesarios solo para generar la descripción. No se guardan como parte de la clase.</Form.Text>
            </Form.Group>
            <button type="button" className="btn btn-outline-primary mb-3" onClick={handlerGenerarDescripcion}><Icono nombre="auto_awesome" />
              {generando ? "Generando..." : "Generar descripción"}
            </button>
            {errorIA && <Alert variant="danger">{errorIA}</Alert>}
            <Form.Group className="mb-3" controlId="clase-descripcion">
              <Form.Label><Icono nombre="description" /> Descripción</Form.Label>
              <Form.Control as="textarea" rows={3} name="descripcion" value={formik.values.descripcion} onChange={formik.handleChange} onBlur={formik.handleBlur} isInvalid={Boolean(formik.touched.descripcion && formik.errors.descripcion)} maxLength={500} />
              <Form.Control.Feedback type="invalid">{formik.errors.descripcion}</Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3" controlId="clase-disciplina">
              <Form.Label><Icono nombre="category" /> Disciplina</Form.Label>
              <Form.Select name="disciplina" value={formik.values.disciplina} onChange={formik.handleChange} onBlur={formik.handleBlur} isInvalid={Boolean(formik.touched.disciplina && formik.errors.disciplina)}>
                <option value="">Seleccioná una disciplina</option>
                {disciplinas.map((disciplina) => <option key={disciplina.id} value={disciplina.id}>{disciplina.nombre}</option>)}
              </Form.Select>
              <Form.Control.Feedback type="invalid">{formik.errors.disciplina}</Form.Control.Feedback>
            </Form.Group>
            <button type="button" className="btn btn-primary" onClick={handlerGuardar} disabled={!formik.isValid || formik.isSubmitting}><Icono nombre="save" />
              {formik.isSubmitting ? "Guardando..." : clase ? "Guardar cambios" : "Agregar clase"}
            </button>
          </fieldset>
          {clase && <button type="button" className="btn btn-secondary mt-2" onClick={handlerCancelar} disabled={bloqueado || formik.isSubmitting || generando}><Icono nombre="close" /> Cancelar edición</button>}
        </Form>
      </Card.Body>
    </Card>
  );
};

export default AgregarClase;
