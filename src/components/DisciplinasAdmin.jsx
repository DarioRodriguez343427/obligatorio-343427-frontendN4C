import Icono from "./Icono";
import { aumentarContadorPeticiones, disminuirContadorPeticiones } from "../redux/features/loadingSlice";
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

const FilaDisciplina = ({ id, editando, onEditar, onCancelar }) => {
  const disciplina = useSelector((state) =>
    state.disciplinasSlice.find((d) => d.id === id),
  );
  const dispatch = useDispatch();
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
        dispatch(aumentarContadorPeticiones());
        const actualizada = await actualizarDisciplinaApi(id, {
          nombre: valores.nombre.trim(),
          descripcion: valores.descripcion.trim(),
        });
        dispatch(actualizarDisciplinaSlice(actualizada));
        onCancelar(id);
        toast.success("Disciplina actualizada");
      } catch (error) {
        toast.error(mensajeErrorApi(error));
      } finally {
        dispatch(disminuirContadorPeticiones());
      }
    },
  });
  const handlerEditar = () => {
    formik.resetForm();
    setConfirmando(false);
    onEditar(id);
  };
  const handlerGuardar = () => {
    if (!formik.isSubmitting) formik.submitForm();
  };
  const handlerCancelar = () => {
    formik.resetForm();
    onCancelar(id);
  };
  const handlerConfirmar = () => setConfirmando(true);
  const handlerCancelarEliminar = () => setConfirmando(false);
  const handlerEliminar = async () => {
    setEliminando(true);
    try {
      dispatch(aumentarContadorPeticiones());
      await eliminarDisciplinaApi(id);
      dispatch(eliminarDisciplinaSlice(id));
      toast.success("Disciplina eliminada");
    } catch (error) {
      toast.error(mensajeErrorApi(error));
    } finally {
      dispatch(disminuirContadorPeticiones());
      setEliminando(false);
      setConfirmando(false);
    }
  };
  if (!disciplina) return null;
  return (
    <li className="discipline-row">
      {editando ? (
        <Form onSubmit={formik.handleSubmit} noValidate>
          <fieldset disabled={formik.isSubmitting}>
            <Form.Group className="mb-3" controlId={`nombre-${id}`}>
              <Form.Label><Icono nombre="label" /> Nombre</Form.Label>
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
              <Form.Label><Icono nombre="description" /> Descripción</Form.Label>
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
            <button className="btn btn-primary btn-sm"
              type="button"
              onClick={handlerGuardar}
              disabled={!formik.isValid || formik.isSubmitting}
            ><Icono nombre="save" />
              Guardar
            </button>
            <button className="btn btn-outline-secondary btn-sm" type="button" onClick={handlerCancelar}><Icono nombre="close" />
              Cancelar
            </button>
          </fieldset>
        </Form>
      ) : (
        <>
          <span>
            <strong>{disciplina.nombre}</strong><small>{disciplina.descripcion}</small>
          </span>{" "}
          <button className="btn btn-outline-primary btn-sm"
            type="button"
            onClick={handlerEditar}
            disabled={eliminando || confirmando}
          ><Icono nombre="edit" />
            Editar
          </button>{" "}
          <button className="btn btn-outline-danger btn-sm"
            type="button"
            onClick={handlerConfirmar}
            disabled={eliminando || confirmando}
          ><Icono nombre="delete" />
            Eliminar
          </button>
        </>
      )}
      {confirmando && (
        <div role="group" aria-label="Confirmar eliminación de disciplina">
          <p>¿Eliminar la disciplina {disciplina.nombre}?</p>
          <button className="btn btn-outline-danger btn-sm" type="button" onClick={handlerEliminar} disabled={eliminando}><Icono nombre="delete" />
            {eliminando ? "Eliminando..." : "Confirmar eliminación"}
          </button>
          <button className="btn btn-outline-secondary btn-sm"
            type="button"
            onClick={handlerCancelarEliminar}
            disabled={eliminando}
          ><Icono nombre="close" />
            Cancelar
          </button>
        </div>
      )}
    </li>
  );
};

const DisciplinasAdmin = () => {
  const [idEditando, setIdEditando] = useState(null);
  const handlerEditarDisciplina = (id) => setIdEditando(id);
  const handlerCancelarEdicion = (id) => setIdEditando((actual) => actual === id ? null : actual);
  const dispatch = useDispatch();
  const disciplinas = useSelector((state) => state.disciplinasSlice);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    const cargar = async () => {
      try {
        dispatch(aumentarContadorPeticiones());
        const datos = await obtenerDisciplinasApi(controller.signal);
        if (!controller.signal.aborted) dispatch(cargarDisciplinasSlice(datos));
      } catch (error) {
        if (!controller.signal.aborted) {
          setErrorCarga(mensajeErrorApi(error));
          toast.error(mensajeErrorApi(error));
        }
      } finally {
        dispatch(disminuirContadorPeticiones());
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
        dispatch(aumentarContadorPeticiones());
        const nueva = await crearDisciplinaApi({
          nombre: valores.nombre.trim(),
          descripcion: valores.descripcion.trim(),
        });
        dispatch(agregarDisciplinaSlice(nueva));
        resetForm();
        toast.success("Disciplina agregada");
      } catch (error) {
        toast.error(mensajeErrorApi(error));
      } finally {
        dispatch(disminuirContadorPeticiones());
      }
    },
  });
  const handlerAgregar = () => {
    if (!formik.isSubmitting) formik.submitForm();
  };
  return (
    <Card className="panel-disciplinas">
      <Card.Body>
        <Card.Title as="h2"><Icono nombre="fitness_center" /> Disciplinas</Card.Title>
        <h3 className="section-divider"><Icono nombre="add" /> Agregar disciplina</h3>
        <Form onSubmit={formik.handleSubmit} noValidate>
          <fieldset
            disabled={formik.isSubmitting || cargando || Boolean(errorCarga)}
          >
            <Form.Group className="mb-3" controlId="nueva-disciplina-nombre">
              <Form.Label><Icono nombre="label" /> Nombre</Form.Label>{" "}
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
              <Form.Label><Icono nombre="description" /> Descripción</Form.Label>{" "}
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
            <button className="btn btn-primary btn-sm"
              type="button"
              onClick={handlerAgregar}
              disabled={!formik.isValid || formik.isSubmitting}
            ><Icono nombre="add" />
              {formik.isSubmitting ? "Agregando..." : "Agregar disciplina"}
            </button>
          </fieldset>
        </Form>
        <h3 className="section-divider"><Icono nombre="fitness_center" /> Disciplinas disponibles</h3>
        {cargando ? (
          <p>Cargando disciplinas...</p>
        ) : errorCarga ? (
          <p role="alert">{errorCarga}</p>
        ) : disciplinas.length === 0 ? (
          <p>No hay disciplinas.</p>
        ) : (
          <ul className="discipline-list">
            {disciplinas.map((disciplina) => (
              <FilaDisciplina key={`${disciplina.id}-${idEditando === disciplina.id}`} id={disciplina.id}
                editando={idEditando === disciplina.id} onEditar={handlerEditarDisciplina} onCancelar={handlerCancelarEdicion} />
            ))}
          </ul>
        )}
      </Card.Body>
    </Card>
  );
};
export default DisciplinasAdmin;
