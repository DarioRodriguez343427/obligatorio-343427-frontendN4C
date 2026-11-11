import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Alert, Card, Form } from "react-bootstrap";
import { toast } from "react-toastify";
import DataTable from "react-data-table-component";
import { obtenerClasesApi, eliminarClaseApi } from "../services/clasesServices";
import {
  cargarClasesInicialesSlice,
  limpiarClasesSlice, solicitarPaginaSlice, solicitarLimiteSlice, seleccionarClaseSlice, eliminarClaseSlice, completarPaginaSlice,
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

const Clases = () => {
  const dispatch = useDispatch();
  const { clases, total, pagina: paginaActual, limite: limiteActual, cargada, paginaSolicitada: pagina, limiteSolicitado: limite } = useSelector((state) => state.clasesSlice);
  const [filtro, setFiltro] = useState("");
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState("");
  const [intento, setIntento] = useState(0);
  const [claseEliminar, setClaseEliminar] = useState(null);
  const [eliminando, setEliminando] = useState(false);
  const ocupado = cargando || eliminando;

  useEffect(() => {
    dispatch(limpiarClasesSlice());
    return () => dispatch(limpiarClasesSlice());
  }, [dispatch]);

  useEffect(() => {
    if (cargada && pagina === paginaActual && limite === limiteActual && intento === 0) return;
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
            dispatch(solicitarPaginaSlice(ultimaPagina));
            return;
          }
          setCargando(false);
          dispatch(cargarClasesInicialesSlice(datos));
          setIntento(0);
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
  }, [dispatch, pagina, limite, intento, cargada, paginaActual, limiteActual]);

  const handlerFiltrar = (evento) => setFiltro(evento.target.value);
  const clasesFiltradas = clases.filter((clase) => clase.nombre.toLowerCase().includes(filtro.trim().toLowerCase()));

  const handlerCambiarPagina = (nuevaPagina) => {
    setIntento(0);
    dispatch(solicitarPaginaSlice(nuevaPagina));
  };

  const handlerCambiarCantidad = (nuevaCantidad) => {
    setIntento(0);
    dispatch(solicitarLimiteSlice(nuevaCantidad));
  };
  const handlerReintentar = () => {
    setIntento(intento + 1);
  };

  const handlerEditar = (clase) => {
    setClaseEliminar(null);
    dispatch(seleccionarClaseSlice(clase));
  };

  const handlerConfirmarEliminar = (clase) => setClaseEliminar(clase);
  const handlerCancelarEliminar = () => setClaseEliminar(null);

  const handlerEliminar = async () => {
    if (ocupado || !claseEliminar) return;
    setEliminando(true);
    dispatch(aumentarContadorPeticiones());
    try {
      await eliminarClaseApi(claseEliminar.id);
      dispatch(eliminarClaseSlice(claseEliminar.id));
      const nuevoTotal = Math.max(0, total - 1);
      const ultimaPagina = Math.max(1, Math.ceil(nuevoTotal / limite));
      if (pagina > ultimaPagina) {
        dispatch(solicitarPaginaSlice(ultimaPagina));
      } else {
        const cantidadRestante = clases.length - 1;
        const posicionSiguiente = (pagina - 1) * limite + cantidadRestante + 1;
        if (cantidadRestante < limite && posicionSiguiente <= nuevoTotal) {
          try {
            const datos = await obtenerClasesApi(undefined, posicionSiguiente, 1);
            dispatch(completarPaginaSlice(datos.clases[0]));
          } catch (error) {
            setErrorCarga("La clase se eliminó, pero no se pudo completar la página. " + mensajeErrorApi(error));
          }
        }
      }
      toast.success("Clase eliminada");
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
    <>
        <Card className="mb-3">
          <Card.Body>
            <Card.Title as="h2">Mis clases</Card.Title>
            <Form.Group className="mb-3" controlId="filtro-clases">
              <Form.Label>Filtrar por nombre en esta página</Form.Label>
              <Form.Control value={filtro} onChange={handlerFiltrar} />
              <Form.Text>El filtro se aplica a las clases de la página visible.</Form.Text>
            </Form.Group>
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
                data={clasesFiltradas}
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
                noDataComponent={filtro.trim() ? "No hay coincidencias en esta página." : "Todavía no tenés clases."}
                responsive
                striped
                highlightOnHover
              />
            )}
          </Card.Body>
        </Card>
    </>
  );
};

export default Clases;
