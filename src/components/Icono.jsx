// Los textos de etiquetas y botones conservan el nombre accesible.
const Icono = ({ nombre }) => (
  <span className="material-symbols-outlined app-icon" aria-hidden="true">{nombre}</span>
);
export default Icono;
