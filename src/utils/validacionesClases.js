import * as Yup from "yup";

export const esquemaClase = Yup.object({
  nombre: Yup.string().trim().min(3, "Mínimo 3 caracteres").max(80, "Máximo 80 caracteres").required("El nombre es obligatorio"),
  descripcion: Yup.string().trim().min(3, "Mínimo 3 caracteres").max(500, "Máximo 500 caracteres").required("La descripción es obligatoria"),
  disciplina: Yup.string().matches(/^[a-fA-F0-9]{24}$/, "Seleccioná una disciplina válida").required("La disciplina es obligatoria"),
});
