import { useState } from "react";
import Icono from "./Icono";
import { mensajeErrorApi } from "../utils/erroresApi";
import { useDispatch } from "react-redux";
import { aumentarContadorPeticiones, disminuirContadorPeticiones } from "../redux/features/loadingSlice";
import Form from "react-bootstrap/Form";
import Card from "react-bootstrap/Card";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { jwtDecode } from "jwt-decode";
import { useFormik } from "formik";
import * as Yup from "yup";

import { loginApi } from "../services/authServices.js";
import { programarVencimiento } from "../utils/sesion.js";

const esquemaLogin = Yup.object({
  identificador: Yup.string().trim().required("El usuario o email es obligatorio"),
  password: Yup.string().required("La contraseña es obligatoria"),
});

const Login = () => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const handlerAlternarPassword = () => setPasswordVisible((visible) => !visible);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handlerIrRegistro = () => {
    navigate("/registro");
  };

  const formik = useFormik({
    initialValues: {
      identificador: "usuario625503",
      password: "cliente1",
    },

    validationSchema: esquemaLogin,

    onSubmit: async (valores) => {
      try {
        dispatch(aumentarContadorPeticiones());
        const resultado = await loginApi(valores);
        const token = resultado.token;

        const decodificado = jwtDecode(token);
        if (!decodificado.exp || decodificado.exp * 1000 <= Date.now()) {
          throw new Error("La sesión recibida no es válida. Volvé a iniciar sesión.");
        }

        localStorage.setItem("token", token);
        localStorage.setItem("imageUrl", resultado.user?.imageUrl || "");

        programarVencimiento(token, () => {
          localStorage.removeItem("token");
          localStorage.removeItem("imageUrl");
          toast.info("Tu sesión venció. Iniciá sesión nuevamente.");
          navigate("/login", { replace: true });
        });

        toast.success("Bienvenido");
        navigate("/dashboard");
      } catch (error) {
        console.error("Error en login:", error);
        toast.error(mensajeErrorApi(error));
      } finally {
        dispatch(disminuirContadorPeticiones());
      }
    },
  });

  const handlerEvitarEnvio = (evento) => evento.preventDefault();
  const handlerIniciarSesion = () => {
    if (!formik.isSubmitting) formik.submitForm();
  };

  return (
    <main className="auth-page auth-login">
    <Card className="auth-card">
      <Card.Body>
        <img className="auth-logo" src="/logo.svg" alt="GYM FIT" />
        <h1>Bienvenido de nuevo</h1>
        <p className="auth-intro">Ingresá a tu espacio de entrenamiento.</p>
        <Form onSubmit={handlerEvitarEnvio} noValidate>
          <Form.Group className="mb-3" controlId="identificador">
            <Form.Label><Icono nombre="person" /> Usuario</Form.Label>
            <Form.Control
              type="text"
              name="identificador"
              value={formik.values.identificador}
              placeholder="Ingresá tu usuario"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              isInvalid={
                formik.touched.identificador && //touched verifica si el usuario ya paso por el campo
                Boolean(formik.errors.identificador)
              }
            />
            <Form.Control.Feedback type="invalid">
              {formik.errors.identificador}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3" controlId="password">
            <Form.Label><Icono nombre="lock" /> Contraseña</Form.Label>
            <div className="password-field">
            <Form.Control
              type={passwordVisible ? "text" : "password"}
              name="password"
              value={formik.values.password}
              placeholder="Ingresá tu contraseña"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              isInvalid={
                formik.touched.password && Boolean(formik.errors.password)
              }
            />
            <button type="button" className="password-toggle" onClick={handlerAlternarPassword}
              disabled={formik.isSubmitting} aria-label={passwordVisible ? "Ocultar contraseña" : "Mostrar contraseña"}
              aria-pressed={passwordVisible} aria-controls="password">
              <Icono nombre={passwordVisible ? "visibility_off" : "visibility"} />
            </button>
            <Form.Control.Feedback type="invalid">
              {formik.errors.password}
            </Form.Control.Feedback>
            </div>
          </Form.Group>

          <button
            type="button"
            className="btn btn-primary"
            onClick={handlerIniciarSesion}
            disabled={
              formik.isSubmitting ||
              formik.values.identificador.trim() === "" ||
              formik.values.password === ""
            }
          ><Icono nombre="login" />
            {formik.isSubmitting ? "Ingresando..." : "Iniciar sesión"}
          </button>
        </Form>
        <button type="button" className="btn btn-outline-secondary auth-secondary" onClick={handlerIrRegistro} disabled={formik.isSubmitting}><Icono nombre="person_add" />
          Registrarse
        </button>
      </Card.Body>
    </Card>
    </main>
  );
};

export default Login;
