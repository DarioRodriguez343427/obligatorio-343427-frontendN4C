import Button from "react-bootstrap/Button";
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
  identificador: Yup.string()
    .required("El usuario es obligatorio")
    .min(3, "El usuario debe tener al menos 3 caracteres"),
  password: Yup.string()
    .required("La contraseña es obligatoria")
    .min(6, "La contraseña debe tener al menos 6 caracteres"),
});

const Login = () => {
  const navigate = useNavigate();

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
        const resultado = await loginApi(valores);
        const token = resultado.token;

        const decodificado = jwtDecode(token);
        console.log("decodificado", decodificado);

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
        toast.error("No se pudo iniciar sesión. Revisá tus datos.");
      }
    },
  });

  return (
    <Card style={{ width: "18rem", justifyContent: "center" }}>
      <Card.Body>
        <Form onSubmit={formik.handleSubmit} noValidate>
          <Form.Group className="mb-3" controlId="identificador">
            <Form.Label>Usuario</Form.Label>
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
            <Form.Label>Contraseña</Form.Label>
            <Form.Control
              type="password"
              name="password"
              value={formik.values.password}
              placeholder="Ingresá tu contraseña"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              isInvalid={
                formik.touched.password && Boolean(formik.errors.password)
              }
            />
            <Form.Control.Feedback type="invalid">
              {formik.errors.password}
            </Form.Control.Feedback>
          </Form.Group>

          <Button
            variant="primary"
            type="submit"
            disabled={
              formik.isSubmitting ||
              formik.values.identificador.trim() === "" ||
              formik.values.password === ""
            }
          >
            {formik.isSubmitting ? "Ingresando..." : "Iniciar sesión"}
          </Button>
        </Form>
        <button type="button" onClick={handlerIrRegistro} disabled={formik.isSubmitting}>
          Registrarse
        </button>
      </Card.Body>
    </Card>
  );
};

export default Login;
