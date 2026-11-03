import React from 'react'

const Clase = (propiedad) => {

    const { clase } = propiedad;
    const {nombre} = clase;

  return (
    <div>
      <p>{nombre}</p>
    </div>
  )
}

export default Clase
