import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Alert, Card, Col, Row } from "react-bootstrap";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";
import AgregarClase from "./AgregarClase";
import DataTable from "react-data-table-component";
import { obtenerClasesApi, crearClaseApi, actualizarClaseApi, eliminarClaseApi } from "../services/clasesServices";
import {
  cargarClasesInicialesSlice,
  limpiarClasesSlice,
} from "../redux/features/clasesSlice";
import {
  aumentarContadorPeticiones,
  disminuirContadorPeticiones,
} from "../redux/features/loadingSlice";
import { mensajeErrorApi } from "../utils/erroresApi";

const columnasInformacion = [
  { name: "Nombre", selector: (clase) => clase.nombre, wrap: true },
  { name: "Descripción", selector: (clase) => clase.descripcion, wrap: true, grow: 2 },
  { name: "Disciplina", selector: (clase) => clase.disciplina.nombre, wrap: true },
];

const opcionesPaginado = {
  rowsPerPageText: "Clases por página:",
  rangeSeparatorText: "de",
};

const Clases = ({ planActual }) => {
  const dispatch = useDispatch();
  const { clases, total } = useSelector((state) => state.clasesSlice);
  const [pagina, setPagina] = useState(1);
  const [limite, setLimite] = useState(10);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState("");
  const [intento, setIntento] = useState(0);
  const [claseEditando, setClaseEditando] = useState(null);
  const [claseEliminar, setClaseEliminar] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [eliminando, setEliminando] = useState(false);
  let plan;
  try {
    plan = jwtDecode(localStorage.getItem("token")).plan;
  } catch {
    // El dashboard verifica la sesión.
  }
  const limiteAlcanzado = (planActual ?? plan) === "plus" && total >= 4;
  const ocupado = cargando || guardando || eliminando;

  useEffect(() => {
    dispatch(limpiarClasesSlice());
    return () => dispatch(limpiarClasesSlice());
  }, [dispatch]);

  useEffect(() => {
    const controller = new AbortController();

    const cargarClases = async () => {
      setCargando(true);
      setErrorCarga("");
      dispatch(aumentarContadorPeticiones());

      try {
        const datos = await obtenerClasesApi(controller.signal, pagina, limite);
        if (!controller.signal.aborted) {
          // Puede pasar si se elimina la última clase de la última página.
          const ultimaPagina = Math.max(1, datos.totalPaginas);
          if (pagina > ultimaPagina) {
            setPagina(ultimaPagina);
            return;
          }
          dispatch(cargarClasesInicialesSlice(datos));
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          setErrorCarga(mensajeErrorApi(error));
        }
      } finally {
        dispatch(disminuirContadorPeticiones());
        if (!controller.signal.aborted) setCargando(false);
      }
    };

    cargarClases();
    return () => controller.abort();
  }, [dispatch, pagina, limite, intento]);

  const handlerCambiarPagina = (nuevaPagina) => {
    setPagina(nuevaPagina);
  };

  const handlerCambiarCantidad = (nuevaCantidad, nuevaPagina) => {
    setLimite(nuevaCantidad);
    setPagina(nuevaPagina);
  };

  const handlerReintentar = () => {
    setIntento(intento + 1);
  };

  const refrescarListado = () => {
    setCargando(true);
    setIntento((valor) => valor + 1);
  };

  const handlerEditar = (clase) => {
    setClaseEliminar(null);
    setClaseEditando(clase);
  };

  const handlerCancelarEdicion = () => setClaseEditando(null);
  const handlerConfirmarEliminar = (clase) => setClaseEliminar(clase);
  const handlerCancelarEliminar = () => setClaseEliminar(null);

  const handlerGuardar = async (datos) => {
    if (ocupado || errorCarga || (!claseEditando && limiteAlcanzado)) return false;
    setGuardando(true);
    dispatch(aumentarContadorPeticiones());
    try {
      if (claseEditando) {
        await actualizarClaseApi(claseEditando.id, datos);
        toast.success("Clase actualizada");
      } else {
        await crearClaseApi(datos);
        toast.success("Clase agregada");
      }
      setClaseEditando(null);
      setClaseEliminar(null);
      // Las clases nuevas aparecen primero en el orden del backend.
      setPagina(1);
      refrescarListado();
      return true;
    } catch (error) {
      toast.error(mensajeErrorApi(error));
      return false;
    } finally {
      dispatch(disminuirContadorPeticiones());
      setGuardando(false);
    }
  };

  const handlerEliminar = async () => {
    if (ocupado || !claseEliminar) return;
    setEliminando(true);
    dispatch(aumentarContadorPeticiones());
    try {
      await eliminarClaseApi(claseEliminar.id);
      if (claseEditando?.id === claseEliminar.id) setClaseEditando(null);
      toast.success("Clase eliminada");
      refrescarListado();
    } catch (error) {
      toast.error(mensajeErrorApi(error));
    } finally {
      setClaseEliminar(null);
      dispatch(disminuirContadorPeticiones());
      setEliminando(false);
    }
  };

  const columnas = [
    ...columnasInformacion,
    {
      name: "Acciones",
      cell: (clase) => (
        <div className="d-flex gap-2 py-2">
          <button type="button" className="btn btn-outline-primary btn-sm" onClick={() => handlerEditar(clase)} disabled={ocupado || Boolean(claseEliminar)}>Editar</button>
          <button type="button" className="btn btn-outline-danger btn-sm" onClick={() => handlerConfirmarEliminar(clase)} disabled={ocupado || Boolean(claseEliminar)}>Eliminar</button>
        </div>
      ),
      minWidth: "180px",
      ignoreRowClick: true,
    },
  ];

  return (
    <Row>
      <Col lg={8}>
        <Card className="mb-3">
          <Card.Body>
            <Card.Title as="h2">Mis clases</Card.Title>
            {claseEliminar && (
              <Alert variant="warning">
                <p>¿Eliminar la clase {claseEliminar.nombre}?</p>
                <button type="button" className="btn btn-danger me-2" onClick={handlerEliminar} disabled={ocupado}>Confirmar eliminación</button>
                <button type="button" className="btn btn-secondary" onClick={handlerCancelarEliminar} disabled={ocupado}>Cancelar</button>
              </Alert>
            )}
            {errorCarga && (
              <Alert variant="danger">
                <p>{errorCarga}</p>
                <button type="button" className="btn btn-outline-danger" onClick={handlerReintentar}>
                  Reintentar
                </button>
              </Alert>
            )}
            {!errorCarga && (
              <DataTable
                key={`${pagina}-${limite}`}
                columns={columnas}
                data={clases}
                keyField="id"
                pagination
                paginationServer
                paginationTotalRows={total}
                paginationDefaultPage={pagina}
                paginationPerPage={limite}
                paginationRowsPerPageOptions={[2, 5, 10, 20, 50, 100]}
                paginationComponentOptions={opcionesPaginado}
                onChangePage={handlerCambiarPagina}
                onChangeRowsPerPage={handlerCambiarCantidad}
                progressPending={cargando}
                progressComponent={<p role="status">Cargando clases...</p>}
                noDataComponent="Todavía no tenés clases."
                responsive
                striped
                highlightOnHover
              />
            )}
          </Card.Body>
        </Card>
      </Col>
      <Col lg={4}>
        <AgregarClase
          clase={claseEditando}
          bloqueado={ocupado || Boolean(errorCarga) || Boolean(claseEliminar)}
          limiteAlcanzado={limiteAlcanzado}
          onGuardar={handlerGuardar}
          onCancelar={handlerCancelarEdicion}
        />
      </Col>
    </Row>
  );
};

export default Clases;
