import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Form } from 'react-bootstrap';
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
  const handlerIrLogin = () => {
    navigate('/login');
  };
  const [errorFoto, setErrorFoto] = useState('');
  const [leyendoFoto, setLeyendoFoto] = useState(false);
  const formik = useFormik({
    initialValues: { name: '', username: '', email: '', password: '', confirmPassword: '', image: '' },
    validationSchema: esquema,
    onSubmit: async (valores, { resetForm }) => {
      if (errorFoto || leyendoFoto) return;
      try {
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

  return (
    <Card style={{ maxWidth: '28rem', margin: '1rem auto' }}>
      <Card.Body>
        <Card.Title>Registro de usuario</Card.Title>
        <Form onSubmit={formik.handleSubmit} noValidate>
          <fieldset disabled={formik.isSubmitting}>
            {campos.map(([name, label, type, autoComplete]) => (
              <Form.Group className="mb-3" controlId={`registro-${name}`} key={name}>
                <Form.Label>{label}</Form.Label>
                <Form.Control name={name} type={type} autoComplete={autoComplete} value={formik.values[name]}
                  onChange={formik.handleChange} onBlur={formik.handleBlur}
                  isInvalid={Boolean(formik.touched[name] && formik.errors[name])} />
                <Form.Control.Feedback type="invalid">{formik.errors[name]}</Form.Control.Feedback>
              </Form.Group>
            ))}
            <Form.Group className="mb-3" controlId="registro-foto">
              <Form.Label>Foto de perfil (opcional)</Form.Label>
              <Form.Control type="file" accept="image/jpeg,image/png,image/webp" onChange={seleccionarFoto} disabled={leyendoFoto} isInvalid={Boolean(errorFoto)} />
              <Form.Control.Feedback type="invalid">{errorFoto}</Form.Control.Feedback>
              <Form.Text>JPEG, PNG o WebP. Máximo 2 MiB.</Form.Text>
            </Form.Group>
            {formik.values.image && <img src={formik.values.image} alt="Vista previa de la foto de perfil" style={{ maxWidth: '150px', maxHeight: '150px', display: 'block', marginBottom: '1rem' }} />}
            <Button type="submit" disabled={formik.isSubmitting || leyendoFoto || Boolean(errorFoto)}>
              {formik.isSubmitting ? 'Registrando...' : leyendoFoto ? 'Leyendo foto...' : 'Registrarse'}
            </Button>
          </fieldset>
        </Form>
        <button type="button" onClick={handlerIrLogin} disabled={formik.isSubmitting}>Volver a iniciar sesión</button>
      </Card.Body>
    </Card>
  );
};
export default Registro;
