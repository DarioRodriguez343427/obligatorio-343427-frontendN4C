import * as Yup from 'yup';
export const esquemaDisciplina = Yup.object({
  nombre: Yup.string().trim().min(2, 'Mínimo 2 caracteres').max(50, 'Máximo 50 caracteres').required('El nombre es obligatorio'),
  descripcion: Yup.string().trim().max(500, 'Máximo 500 caracteres').required('La descripción es obligatoria'),
});
export const esquemaUsuarioAdmin = Yup.object({
  name: Yup.string().trim().min(3, 'Mínimo 3 caracteres').max(30, 'Máximo 30 caracteres').required('El nombre es obligatorio'),
  username: Yup.string().trim().min(3, 'Mínimo 3 caracteres').max(30, 'Máximo 30 caracteres').matches(/^[a-zA-Z0-9]+$/, 'Solo letras y números').required('El usuario es obligatorio'),
  email: Yup.string().trim().email('Email inválido').required('El email es obligatorio'),
  estado: Yup.string().oneOf(['activo', 'inactivo']).required('Seleccioná un estado'),
  password: Yup.string().max(30, 'Máximo 30 caracteres').test('minimo', 'Mínimo 3 caracteres', (valor) => !valor || valor.length >= 3),
  confirmPassword: Yup.string().oneOf([Yup.ref('password')], 'Las contraseñas no coinciden'),
});
