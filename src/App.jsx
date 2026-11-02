import { useEffect, useState } from "react";
import { useDispatch } from "react-redux"
import { cargarDisciplinasSlice } from "./redux/features/disciplinaSlice";
import Contenido from "./components/Contenido";
import Menu from "./components/Menu";


function App() {

  const dispatch = useDispatch();

  const [disciplinas, setDisciplinas] = useState([]);
  useEffect(() => {
    const disciplinasTest = [
      { id: 1, nombre: "Musculación" },
      { id: 2, nombre: "Spinning" },
      { id: 3, nombre: "Pilates" }
    ];

    dispatch(cargarDisciplinasSlice(disciplinasTest));
    setDisciplinas(disciplinasTest);
  }, [dispatch]);
  return (
    <>
      <Menu />
      <Contenido/>
    </>
  )
}

export default App
