import { aumentarContadorPeticiones, disminuirContadorPeticiones } from "../redux/features/loadingSlice";
import React, { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { obtenerDisciplinasApi } from '../services/disciplinasServices';
import { cargarDisciplinasSlice } from '../redux/features/disciplinaSlice';

const Disciplinas = () => {

    const dispatch = useDispatch();

    useEffect(() => {
        const controller = new AbortController();

        const obtenerTareas = async() => {
            try {
              dispatch(aumentarContadorPeticiones());
                const listaDisciplinas = await obtenerDisciplinasApi(controller.signal);
                dispatch(cargarDisciplinasSlice(listaDisciplinas));
            } catch (error) {
                console.log("peticion cancelada", error);
            } finally {
              dispatch(disminuirContadorPeticiones());
            }
        }

        obtenerTareas();

        return () => {
            controller.abort();
        }

    }, [dispatch]);



  return (
    <div>
      <h2>En disciplinas</h2>
    </div>
  )
}

export default Disciplinas
