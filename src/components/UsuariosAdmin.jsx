import { aumentarContadorPeticiones, disminuirContadorPeticiones } from "../redux/features/loadingSlice";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useFormik } from "formik";
import { Card, Form } from "react-bootstrap";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";
import {
  obtenerUsuariosApi,
  obtenerUsuarioApi,
  actualizarUsuarioApi,
  eliminarUsuarioApi,
} from "../services/usuariosServices";
import {
  cargarUsuarios,
  seleccionarUsuario,
  actualizarUsuario,
  eliminarUsuario,
} from "../redux/features/usuariosAdminSlice";
import { esquemaUsuarioAdmin } from "../utils/validacionesAdmin";
import { mensajeErrorApi } from "../utils/erroresApi";

const valoresUsuario = (usuario) => ({
  name: usuario.name || "",
  username: usuario.username || "",
  email: usuario.email || "",
  estado: usuario.estado || "",
  password: "",
  confirmPassword: "",
});

const DetalleUsuarioAdmin = () => {
  const usuario = useSelector((state) => state.usuariosAdmin.seleccionado);
  const dispatch = useDispatch();
  const [editando, setEditando] = useState(false);
  const [confirmando, setConfirmando] = useState(false);
  const [eliminando, setEliminando] = useState(false);
  let idActual;
  try {
    idActual = jwtDecode(localStorage.getItem("token")).id;
  } catch {
    /* La ruta verifica la sesión. */
  }
  const formik = useFormik({
    initialValues: valoresUsuario(usuario),
    enableReinitialize: true,
    validationSchema: esquemaUsuarioAdmin,
    validateOnMount: true,
    onSubmit: async (valores) => {
      if (!editando) return;
      const datos = {
        name: valores.name.trim(),
        username: valores.username.trim(),
        email: valores.email.trim().toLowerCase(),
        estado: valores.estado,
      };
      if (valores.password) {
        datos.password = valores.password;
        datos.confirmPassword = valores.confirmPassword;
      }
      try {
        dispatch(aumentarContadorPeticiones());
        const actualizado = await actualizarUsuarioApi(usuario.id, datos);
        dispatch(actualizarUsuario(actualizado));
        formik.resetForm({ values: valoresUsuario(actualizado) });
        setEditando(false);
        toast.success("Usuario actualizado");
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
    setEditando(true);
  };
  const handlerEvitarEnvio = (evento) => evento.preventDefault();
  const handlerGuardar = () => {
    if (editando && !formik.isSubmitting) formik.submitForm();
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
      dispatch(aumentarContadorPeticiones());
      await eliminarUsuarioApi(usuario.id);
      dispatch(eliminarUsuario(usuario.id));
      toast.success("Usuario eliminado");
    } catch (error) {
      toast.error(mensajeErrorApi(error));
    } finally {
      dispatch(disminuirContadorPeticiones());
      setEliminando(false);
    }
  };
  const ocupado = formik.isSubmitting || eliminando;
  return (
    <div>
      {usuario.imageUrl ? (
        <img
          src={usuario.imageUrl}
          alt={`Foto de perfil de ${usuario.name}`}
          style={{ maxWidth: "100px", maxHeight: "100px" }}
        />
      ) : (
        <p>Sin foto de perfil</p>
      )}
      <p>ID: {usuario.id}</p>
      <Form onSubmit={handlerEvitarEnvio} noValidate>
        <fieldset disabled={!editando || ocupado}>
          {[
            ["name", "Nombre"],
            ["username", "Usuario"],
            ["email", "Email"],
          ].map(([name, label]) => (
            <Form.Group className="mb-3" key={name}>
              <Form.Label htmlFor={`admin-usuario-${name}`}>{label}</Form.Label>{" "}
              <Form.Control
                isInvalid={Boolean(formik.touched[name] && formik.errors[name])}
                id={`admin-usuario-${name}`}
                name={name}
                type={name === "email" ? "email" : "text"}
                value={formik.values[name]}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              <Form.Control.Feedback type="invalid">
                {formik.errors[name]}
              </Form.Control.Feedback>
            </Form.Group>
          ))}
          <Form.Group className="mb-3" controlId="admin-usuario-estado">
            <Form.Label>Estado</Form.Label>{" "}
            <Form.Select
              isInvalid={Boolean(formik.touched.estado && formik.errors.estado)}
              id="admin-usuario-estado"
              name="estado"
              value={formik.values.estado}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            >
              <option value="">Sin estado</option>
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
            </Form.Select>
            <Form.Control.Feedback type="invalid">
              {formik.errors.estado}
            </Form.Control.Feedback>
          </Form.Group>
          {editando && (
            <>
              <p>Dejá ambas contraseñas vacías para conservar la actual.</p>
              {[
                ["password", "Nueva contraseña"],
                ["confirmPassword", "Confirmar contraseña"],
              ].map(([name, label]) => (
                <Form.Group className="mb-3" key={name}>
                  <Form.Label htmlFor={`admin-usuario-${name}`}>
                    {label}
                  </Form.Label>{" "}
                  <Form.Control
                    isInvalid={Boolean(
                      formik.touched[name] && formik.errors[name],
                    )}
                    id={`admin-usuario-${name}`}
                    name={name}
                    type="password"
                    autoComplete="new-password"
                    value={formik.values[name]}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  <Form.Control.Feedback type="invalid">
                    {formik.errors[name]}
                  </Form.Control.Feedback>
                </Form.Group>
              ))}
            </>
          )}
        </fieldset>
        <Form.Group className="mb-3" controlId="admin-usuario-rol">
          <Form.Label>Rol</Form.Label>{" "}
          <Form.Control value={usuario.role || ""} disabled />
        </Form.Group>
        <Form.Group className="mb-3" controlId="admin-usuario-plan">
          <Form.Label>Plan</Form.Label>{" "}
          <Form.Control value={usuario.plan || ""} disabled />
        </Form.Group>
      </Form>
      {editando ? (
        <>
          <button className="btn btn-primary btn-sm"
            key="guardar"
            type="button"
            onClick={handlerGuardar}
            disabled={ocupado || !formik.isValid}
          >
            {formik.isSubmitting ? "Guardando..." : "Guardar"}
          </button>{" "}
          <button className="btn btn-outline-secondary btn-sm" type="button" onClick={handlerCancelar} disabled={ocupado}>
            Cancelar
          </button>
        </>
      ) : (
        <>
          <button className="btn btn-outline-primary btn-sm"
            key="editar"
            type="button"
            onClick={handlerEditar}
            disabled={ocupado || confirmando || usuario.role !== "cliente"}
          >
            Editar
          </button>{" "}
          <button className="btn btn-outline-danger btn-sm"
            type="button"
            onClick={handlerConfirmar}
            disabled={ocupado || confirmando || usuario.id === idActual}
          >
            Eliminar
          </button>
        </>
      )}
      {usuario.role === "admin" && (
        <p>El backend solo permite editar clientes.</p>
      )}
      {usuario.id === idActual && (
        <p>No podés eliminar tu propia cuenta desde este panel.</p>
      )}
      {confirmando && (
        <div role="group" aria-label="Confirmar eliminación de usuario">
          <p>
            ¿Eliminar a {usuario.name}? También se eliminará su foto de perfil.
          </p>
          <button className="btn btn-outline-danger btn-sm" type="button" onClick={handlerEliminar} disabled={ocupado}>
            {eliminando ? "Eliminando..." : "Confirmar eliminación"}
          </button>{" "}
          <button className="btn btn-outline-secondary btn-sm"
            type="button"
            onClick={handlerCancelarEliminar}
            disabled={ocupado}
          >
            Cancelar
          </button>
        </div>
      )}
    </div>
  );
};

const UsuariosAdmin = () => {
  const dispatch = useDispatch();
  const usuarios = useSelector((state) => state.usuariosAdmin.lista);
  const usuario = useSelector((state) => state.usuariosAdmin.seleccionado);
  const [idSeleccionado, setIdSeleccionado] = useState("");
  const [cargando, setCargando] = useState(true);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);
  const [errorCarga, setErrorCarga] = useState("");
  const [errorDetalle, setErrorDetalle] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    const cargar = async () => {
      try {
        dispatch(aumentarContadorPeticiones());
        const lista = await obtenerUsuariosApi(controller.signal);
        if (!controller.signal.aborted) dispatch(cargarUsuarios(lista));
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
  useEffect(() => {
    if (!idSeleccionado) return;
    const controller = new AbortController();
    const cargar = async () => {
      try {
        dispatch(aumentarContadorPeticiones());
        const detalle = await obtenerUsuarioApi(
          idSeleccionado,
          controller.signal,
        );
        if (!controller.signal.aborted) dispatch(seleccionarUsuario(detalle));
      } catch (error) {
        if (!controller.signal.aborted) {
          setErrorDetalle(mensajeErrorApi(error));
          toast.error(mensajeErrorApi(error));
        }
      } finally {
        dispatch(disminuirContadorPeticiones());
        if (!controller.signal.aborted) setCargandoDetalle(false);
      }
    };
    cargar();
    return () => controller.abort();
  }, [idSeleccionado, dispatch]);
  const handlerSeleccionar = (evento) => {
    const id = evento.target.value;
    dispatch(seleccionarUsuario(null));
    setErrorDetalle("");
    setCargandoDetalle(Boolean(id));
    setIdSeleccionado(id);
  };
  const seleccionExiste = usuarios.some((u) => u.id === idSeleccionado);
  return (
    <Card className="panel-usuarios">
      <Card.Body>
        <Card.Title as="h2">Usuarios</Card.Title>
        <Form.Group className="mb-3" controlId="admin-selector-usuario">
          <Form.Label>Seleccionar usuario</Form.Label>{" "}
          <Form.Select
            id="admin-selector-usuario"
            value={seleccionExiste ? idSeleccionado : ""}
            onChange={handlerSeleccionar}
            disabled={cargando || Boolean(errorCarga)}
          >
            <option value="">Seleccioná un usuario</option>
            {usuarios.map((u) => (
              <option key={u.id} value={u.id}>
                {u.username}
              </option>
            ))}
          </Form.Select>
        </Form.Group>
        {cargando && <p>Cargando usuarios...</p>}
        {errorCarga && <p role="alert">{errorCarga}</p>}
        {!cargando && !errorCarga && usuarios.length === 0 && (
          <p>No hay usuarios.</p>
        )}
        {cargandoDetalle && <p>Cargando datos del usuario...</p>}
        {errorDetalle && <p role="alert">{errorDetalle}</p>}
        {!cargando &&
          !cargandoDetalle &&
          seleccionExiste &&
          usuario?.id === idSeleccionado && (
            <DetalleUsuarioAdmin key={usuario.id} />
          )}
      </Card.Body>
    </Card>
  );
};
export default UsuariosAdmin;
