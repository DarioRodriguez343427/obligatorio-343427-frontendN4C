import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useFormik } from "formik";
import { Card, Form } from "react-bootstrap";
import { toast } from "react-toastify";
import {
  obtenerDisciplinasApi,
  crearDisciplinaApi,
  actualizarDisciplinaApi,
  eliminarDisciplinaApi,
} from "../services/disciplinasServices";
import {
  cargarDisciplinasSlice,
  agregarDisciplinaSlice,
  actualizarDisciplinaSlice,
  eliminarDisciplinaSlice,
} from "../redux/features/disciplinaSlice";
import { esquemaDisciplina } from "../utils/validacionesAdmin";
import { mensajeErrorApi } from "../utils/erroresApi";

const FilaDisciplina = ({ id }) => {
  const disciplina = useSelector((state) =>
    state.disciplinasSlice.find((d) => d.id === id),
  );
  const dispatch = useDispatch();
  const [editando, setEditando] = useState(false);
  const [confirmando, setConfirmando] = useState(false);
  const [eliminando, setEliminando] = useState(false);
  const formik = useFormik({
    initialValues: {
      nombre: disciplina?.nombre || "",
      descripcion: disciplina?.descripcion || "",
    },
    enableReinitialize: true,
    validationSchema: esquemaDisciplina,
    validateOnMount: true,
    onSubmit: async (valores) => {
      try {
        const actualizada = await actualizarDisciplinaApi(id, {
          nombre: valores.nombre.trim(),
          descripcion: valores.descripcion.trim(),
        });
        dispatch(actualizarDisciplinaSlice(actualizada));
        setEditando(false);
        toast.success("Disciplina actualizada");
      } catch (error) {
        toast.error(mensajeErrorApi(error));
      }
    },
  });
  const handlerEditar = () => {
    formik.resetForm();
    setConfirmando(false);
    setEditando(true);
  };
  const handlerGuardar = () => {
    if (!formik.isSubmitting) formik.submitForm();
  };
  const handlerCancelar = () => {
    formik.resetForm();
    setEditando(false);
  };
  const handlerConfirmar = () => setConfirmando(true);
  const handlerCancelarEliminar = () => setConfirmando(false);
  const handlerEliminar = async () => {
    setEliminando(true);
    try {
      await eliminarDisciplinaApi(id);
      dispatch(eliminarDisciplinaSlice(id));
      toast.success("Disciplina eliminada");
    } catch (error) {
      toast.error(mensajeErrorApi(error));
    } finally {
      setEliminando(false);
      setConfirmando(false);
    }
  };
  if (!disciplina) return null;
  return (
    <li className="mb-3">
      {editando ? (
        <Form onSubmit={formik.handleSubmit} noValidate>
          <fieldset disabled={formik.isSubmitting}>
            <Form.Group className="mb-3" controlId={`nombre-${id}`}>
              <Form.Label>Nombre</Form.Label>
              <Form.Control
                isInvalid={Boolean(
                  formik.touched.nombre && formik.errors.nombre,
                )}
                id={`nombre-${id}`}
                name="nombre"
                value={formik.values.nombre}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              <Form.Control.Feedback type="invalid">
                {formik.errors.nombre}
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3" controlId={`descripcion-${id}`}>
              <Form.Label>Descripción</Form.Label>
              <Form.Control
                isInvalid={Boolean(
                  formik.touched.descripcion && formik.errors.descripcion,
                )}
                id={`descripcion-${id}`}
                name="descripcion"
                value={formik.values.descripcion}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              <Form.Control.Feedback type="invalid">
                {formik.errors.descripcion}
              </Form.Control.Feedback>
            </Form.Group>
            <button
              type="button"
              onClick={handlerGuardar}
              disabled={!formik.isValid || formik.isSubmitting}
            >
              Guardar
            </button>
            <button type="button" onClick={handlerCancelar}>
              Cancelar
            </button>
          </fieldset>
        </Form>
      ) : (
        <>
          <span>
            {disciplina.nombre}: {disciplina.descripcion}
          </span>{" "}
          <button
            type="button"
            onClick={handlerEditar}
            disabled={eliminando || confirmando}
          >
            Editar
          </button>{" "}
          <button
            type="button"
            onClick={handlerConfirmar}
            disabled={eliminando || confirmando}
          >
            Eliminar
          </button>
        </>
      )}
      {confirmando && (
        <div role="group" aria-label="Confirmar eliminación de disciplina">
          <p>¿Eliminar la disciplina {disciplina.nombre}?</p>
          <button type="button" onClick={handlerEliminar} disabled={eliminando}>
            {eliminando ? "Eliminando..." : "Confirmar eliminación"}
          </button>
          <button
            type="button"
            onClick={handlerCancelarEliminar}
            disabled={eliminando}
          >
            Cancelar
          </button>
        </div>
      )}
    </li>
  );
};

const DisciplinasAdmin = () => {
  const dispatch = useDispatch();
  const disciplinas = useSelector((state) => state.disciplinasSlice);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    const cargar = async () => {
      try {
        const datos = await obtenerDisciplinasApi(controller.signal);
        if (!controller.signal.aborted) dispatch(cargarDisciplinasSlice(datos));
      } catch (error) {
        if (!controller.signal.aborted) {
          setErrorCarga(mensajeErrorApi(error));
          toast.error(mensajeErrorApi(error));
        }
      } finally {
        if (!controller.signal.aborted) setCargando(false);
      }
    };
    cargar();
    return () => controller.abort();
  }, [dispatch]);
  const formik = useFormik({
    initialValues: { nombre: "", descripcion: "" },
    validationSchema: esquemaDisciplina,
    validateOnMount: true,
    onSubmit: async (valores, { resetForm }) => {
      try {
        const nueva = await crearDisciplinaApi({
          nombre: valores.nombre.trim(),
          descripcion: valores.descripcion.trim(),
        });
        dispatch(agregarDisciplinaSlice(nueva));
        resetForm();
        toast.success("Disciplina agregada");
      } catch (error) {
        toast.error(mensajeErrorApi(error));
      }
    },
  });
  const handlerAgregar = () => {
    if (!formik.isSubmitting) formik.submitForm();
  };
  return (
    <Card className="mb-3">
      <Card.Body>
        <Card.Title as="h2">Disciplinas</Card.Title>
        {cargando ? (
          <p>Cargando disciplinas...</p>
        ) : errorCarga ? (
          <p role="alert">{errorCarga}</p>
        ) : disciplinas.length === 0 ? (
          <p>No hay disciplinas.</p>
        ) : (
          <ul>
            {disciplinas.map((disciplina) => (
              <FilaDisciplina key={disciplina.id} id={disciplina.id} />
            ))}
          </ul>
        )}
        <h3>Agregar disciplina</h3>
        <Form onSubmit={formik.handleSubmit} noValidate>
          <fieldset
            disabled={formik.isSubmitting || cargando || Boolean(errorCarga)}
          >
            <Form.Group className="mb-3" controlId="nueva-disciplina-nombre">
              <Form.Label>Nombre</Form.Label>{" "}
              <Form.Control
                isInvalid={Boolean(
                  formik.touched.nombre && formik.errors.nombre,
                )}
                id="nueva-disciplina-nombre"
                name="nombre"
                value={formik.values.nombre}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              <Form.Control.Feedback type="invalid">
                {formik.errors.nombre}
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group
              className="mb-3"
              controlId="nueva-disciplina-descripcion"
            >
              <Form.Label>Descripción</Form.Label>{" "}
              <Form.Control
                isInvalid={Boolean(
                  formik.touched.descripcion && formik.errors.descripcion,
                )}
                id="nueva-disciplina-descripcion"
                name="descripcion"
                value={formik.values.descripcion}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              <Form.Control.Feedback type="invalid">
                {formik.errors.descripcion}
              </Form.Control.Feedback>
            </Form.Group>
            <button
              type="button"
              onClick={handlerAgregar}
              disabled={!formik.isValid || formik.isSubmitting}
            >
              {formik.isSubmitting ? "Agregando..." : "Agregar disciplina"}
            </button>
          </fieldset>
        </Form>
      </Card.Body>
    </Card>
  );
};
export default DisciplinasAdmin;
