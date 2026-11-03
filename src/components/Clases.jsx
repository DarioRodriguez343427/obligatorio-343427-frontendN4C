import React, { useEffect, useId, useState } from 'react'
import { useSelector } from 'react-redux'
import { Col, Container, Row } from 'react-bootstrap';
import Clase from './Clase';

const Clases = () => {
    /**
     * titulo
     * boton agregar clase
     * buscador
     * listado
     */

    const listaClases = useSelector((state) => state.clasesSlice);
    const clases = listaClases.clases;

    const [listaClasesFiltradas, setListaClasesFiltradas] = useState([]);

    useEffect(()=>{
        setListaClasesFiltradas(clases);
    }, [clases]);

    const idInput = useId();

    const handlerFilter = (e) => {
    const textoAFiltrar = e.target.value;
    console.log("textoAFiltrar", textoAFiltrar);

    if (textoAFiltrar.trim() == "") {
      setListaClasesFiltradas([]);
    } else {
      const auxListaFiltrada = clases?.filter((c) => c.nombre.includes(textoAFiltrar));
      
      console.log("auxListaFiltrada", auxListaFiltrada);
      
      setListaClasesFiltradas(auxListaFiltrada);
    }
  };
      console.log("listado desde useSelector", clases);

    const handlerAgregarClase = () => {
        console.log("agregando clase")
    }

  return (
    <Container>
        <Row>
            <Col><p>titulo</p></Col>
            <Col><button onClick={handlerAgregarClase} style={{marginLeft: "auto"}}>+ Agregar Clase</button></Col>
        </Row>
        <Row>
            <label htmlFor={idInput}></label>
            <input type="text" onChange={handlerFilter} id={idInput}></input>
        </Row>
        <Row>
            {listaClasesFiltradas?.map((clase) => (
                <Clase key={clase.id} clase={clase} />
            ))}
        </Row>
    </Container>
  )
}

export default Clases
