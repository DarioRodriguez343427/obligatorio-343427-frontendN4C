import Icono from "./Icono";
import { useDispatch } from "react-redux";
import { aumentarContadorPeticiones, disminuirContadorPeticiones } from "../redux/features/loadingSlice";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Form } from 'react-bootstrap';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { jwtDecode } from 'jwt-decode';
import { toast } from 'react-toastify';
import { registerApi } from '../services/authServices';
import { programarVencimiento } from '../utils/sesion';

const tipos = ['image/jpeg', 'image/png', 'image/webp'];
const esquema = Yup.object({
  name: Yup.string().trim().min(3, 'Mínimo 3 caracteres').max(30, 'Máximo 30 caracteres').required('El nombre es obligatorio'),
  username: Yup.string().trim().min(3, 'Mínimo 3 caracteres').max(30, 'Máximo 30 caracteres').matches(/^[a-zA-Z0-9]+$/, 'Solo letras y números, sin espacios').required('El usuario es obligatorio'),
  email: Yup.string().trim().email('Ingresá un email válido').required('El email es obligatorio'),
  password: Yup.string().min(3, 'Mínimo 3 caracteres').max(30, 'Máximo 30 caracteres').required('La contraseña es obligatoria'),
  confirmPassword: Yup.string().oneOf([Yup.ref('password')], 'Las contraseñas no coinciden').required('Confirmá tu contraseña'),
  image: Yup.string(),
});
const campos = [
  ['name', 'Nombre', 'text', 'name'],
  ['username', 'Usuario', 'text', 'username'],
  ['email', 'Email', 'email', 'email'],
  ['password', 'Contraseña', 'password', 'new-password'],
  ['confirmPassword', 'Confirmar contraseña', 'password', 'new-password'],
];

const Registro = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const handlerIrLogin = () => {
    navigate('/login');
  };
  const [passwordsVisibles, setPasswordsVisibles] = useState({ password: false, confirmPassword: false });
  const handlerAlternarPassword = (evento) => {
    const campo = evento.currentTarget.name;
    setPasswordsVisibles((actual) => ({ ...actual, [campo]: !actual[campo] }));
  };
  const [errorFoto, setErrorFoto] = useState('');
  const [leyendoFoto, setLeyendoFoto] = useState(false);
  const formik = useFormik({
    initialValues: { name: '', username: '', email: '', password: '', confirmPassword: '', image: '' },
    validationSchema: esquema,
    validateOnMount: true,
    onSubmit: async (valores, { resetForm }) => {
      if (errorFoto || leyendoFoto) return;
      try {
        dispatch(aumentarContadorPeticiones());
        const datos = { ...valores, name: valores.name.trim(), username: valores.username.trim(), email: valores.email.trim().toLowerCase() };
        if (!datos.image) delete datos.image;
        const { user, token } = await registerApi(datos);
        const { exp } = jwtDecode(token);
        if (!exp || exp * 1000 <= Date.now()) throw new Error('El registro se creó, pero la sesión no es válida. Iniciá sesión.');
        localStorage.setItem('token', token);
        localStorage.setItem('imageUrl', user.imageUrl || '');
        programarVencimiento(token, () => {
          localStorage.removeItem('token');
          localStorage.removeItem('imageUrl');
          toast.info('Tu sesión venció. Iniciá sesión nuevamente.');
          navigate('/login', { replace: true });
        });
        resetForm();
        toast.success('Registro realizado. ¡Bienvenido!');
        navigate('/dashboard', { replace: true });
      } catch (error) {
        const respuesta = error.response?.data;
        const detalles = respuesta?.errors?.map((detalle) => detalle.message).filter(Boolean).join('. ');
        toast.error(detalles || respuesta?.message || respuesta?.error || error.message || 'No se pudo completar el registro.');
      } finally {
        dispatch(disminuirContadorPeticiones());
      }
    },
  });

  const seleccionarFoto = (evento) => {
    const foto = evento.target.files?.[0];
    formik.setFieldValue('image', '');
    setErrorFoto('');
    if (!foto) return;

    //validamos que el tipo de imagen y tamaño sean permitidos, par no tener problemas de compatibilidad
    if (!tipos.includes(foto.type)) { setErrorFoto('Usá una imagen JPEG, PNG o WebP'); return; }
    if (foto.size > 2 * 1024 * 1024) { setErrorFoto('La foto no puede superar los 2 MiB'); return; }
    setLeyendoFoto(true);
    const reader = new FileReader();
    reader.onload = () => { formik.setFieldValue('image', reader.result); setLeyendoFoto(false); };
    reader.onerror = () => { setErrorFoto('No se pudo leer la foto. Seleccionala nuevamente.'); setLeyendoFoto(false); };
    reader.readAsDataURL(foto);
  };

  const handlerEvitarEnvio = (evento) => evento.preventDefault();
  const handlerRegistrarse = () => {
    if (!formik.isSubmitting && !leyendoFoto && !errorFoto) formik.submitForm();
  };

  return (
    <main className="auth-page auth-registro">
    <Card className="auth-card">
      <Card.Body>
        <img className="auth-logo" src="/logo.svg" alt="GYM FIT" />
        <h1>Creá tu cuenta</h1>
        <p className="auth-intro">Tu próximo entrenamiento empieza acá.</p>

        <Form onSubmit={handlerEvitarEnvio} noValidate>
          <fieldset disabled={formik.isSubmitting}>
            {campos.map(([name, label, type, autoComplete]) => (
              <Form.Group className="mb-3" controlId={`registro-${name}`} key={name}>
                <Form.Label><Icono nombre={name === "email" ? "mail" : name === "password" ? "lock" : name === "confirmPassword" ? "lock_reset" : "person"} /> {label}</Form.Label>
                <div className={type === 'password' ? 'password-field' : undefined}>
                <Form.Control name={name} type={type === 'password' && passwordsVisibles[name] ? 'text' : type} autoComplete={autoComplete} value={formik.values[name]}
                  onChange={formik.handleChange} onBlur={formik.handleBlur}
                  isInvalid={Boolean(formik.touched[name] && formik.errors[name])} />
                {type === 'password' && (
                  <button type="button" className="password-toggle" name={name} onClick={handlerAlternarPassword}
                    aria-label={`${passwordsVisibles[name] ? 'Ocultar' : 'Mostrar'} ${label.toLowerCase()}`}
                    aria-pressed={passwordsVisibles[name]} aria-controls={`registro-${name}`}>
                    <Icono nombre={passwordsVisibles[name] ? "visibility_off" : "visibility"} />
                  </button>
                )}
                <Form.Control.Feedback type="invalid">{formik.errors[name]}</Form.Control.Feedback>
                </div>
              </Form.Group>
            ))}
            <Form.Group className="mb-3" controlId="registro-foto">
              <Form.Label><Icono nombre="add_a_photo" /> Foto de perfil (opcional)</Form.Label>
              <Form.Control type="file" accept="image/jpeg,image/png,image/webp" onChange={seleccionarFoto} disabled={leyendoFoto} isInvalid={Boolean(errorFoto)} />
              <Form.Control.Feedback type="invalid">{errorFoto}</Form.Control.Feedback>
              <Form.Text>JPEG, PNG o WebP. Máximo 2 MiB.</Form.Text>
            </Form.Group>
            {formik.values.image && <img src={formik.values.image} alt="Vista previa de la foto de perfil" className="profile-preview" />}
            <button type="button" className="btn btn-primary" onClick={handlerRegistrarse} disabled={!formik.dirty || !formik.isValid || formik.isSubmitting || leyendoFoto || Boolean(errorFoto)}><Icono nombre="person_add" />
              {formik.isSubmitting ? 'Registrando...' : leyendoFoto ? 'Leyendo foto...' : 'Registrarse'}
            </button>
          </fieldset>
        </Form>
        <button type="button" className="btn btn-outline-secondary auth-secondary" onClick={handlerIrLogin} disabled={formik.isSubmitting}><Icono nombre="arrow_back" /> Volver a iniciar sesión</button>
      </Card.Body>
    </Card>
    </main>
  );
};
export default Registro;
