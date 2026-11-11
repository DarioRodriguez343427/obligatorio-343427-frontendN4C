import { useSelector } from 'react-redux';
import Spinner from 'react-bootstrap/Spinner';
import './SpinnerGlobal.css';

const SpinnerGlobal = () => {
  const contadorPeticiones = useSelector((state) => state.loadingSlice.contadorPeticiones);
  if (contadorPeticiones === 0) return null;

  return (
    <div className="spinner-global" role="status" aria-live="polite">
      <Spinner animation="border" variant="primary" aria-hidden="true" />
      <span>Cargando...</span>
    </div>
  );
};

export default SpinnerGlobal;
