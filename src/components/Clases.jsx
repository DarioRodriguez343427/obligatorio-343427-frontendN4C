import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { cargarClasesSlice } from '../redux/features/claseSlice';
import { obtenerClasesApi } from '../services/clasesServices';

const Clases = () => {


  return (
    <div>
      <p>desde clases</p>
    </div>
  )
}

export default Clases
