import React, { useEffect } from 'react'
import Clases from './Clases'
import { useDispatch } from 'react-redux';
import { obtenerClasesApi } from '../services/clasesServices';
import { cargarClasesSlice } from '../redux/features/claseSlice';
import { Col, Container, Row } from 'react-bootstrap';
import Grafica from './Grafica';

const Contenido = () => {

      //habilito dispatch para usarlo
    const dispatch = useDispatch();
    //dentro de useEffect para cargar con la pagina
    useEffect(() => {
        //esto para evitar carga cuando se sale de la pagina
        const controller = new AbortController();

        const obtenerClases = async () => {
            try{
              //me traigo la lista desde el services donde axios le pega al endpoint
              const listaClases = await obtenerClasesApi(controller.signal);
              //le paso a redux la lista para que la cargue en su store
              dispatch(cargarClasesSlice(listaClases));
              console.log(listaClases);
            }catch(error){
              console.log(error);
              return;
            }
        };
        //llamamos al servicio
        obtenerClases();
        //limpiamos la llamada a la api cuando destruye el componente
        return () => {
          controller.abort();
        }
    })
  return (
    <>
    <Container>
      <Row>
        <Col>
          <Grafica />
        </Col>
        <Col>
          <Clases /> 
        </Col>
      </Row>
    </Container>
    </>
  )
}

export default Contenido
