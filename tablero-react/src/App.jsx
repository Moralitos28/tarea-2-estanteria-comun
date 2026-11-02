import { useState } from 'react';
import { LIBROS_INICIALES, MIEMBROS } from './data/libros.js';
import { siguienteEstado } from './utils/estados.js';
import Encabezado from './components/layout/Encabezado.jsx';
import Panel from './components/layout/Panel.jsx';
import ListaLibros from './components/libros/ListaLibros.jsx';

export default function App() {
  const [libros, setLibros] = useState(LIBROS_INICIALES);

  // Las actualizaciones crean un arreglo nuevo: map reemplaza el libro cambiado
  // por una copia y filter descarta el quitado. El estado anterior no se modifica.
  function cambiarEstado(id) {
    setLibros((anteriores) => anteriores.map((libro) => (
      libro.id === id ? { ...libro, estado: siguienteEstado(libro.estado) } : libro
    )));
  }

  function quitarLibro(id) {
    setLibros((anteriores) => anteriores.filter((libro) => libro.id !== id));
  }

  return (
    <>
      <Encabezado />
      <main className="container pb-5">
        <Panel titulo="Libros del club">
          <ListaLibros
            libros={libros}
            miembros={MIEMBROS}
            onCambiarEstado={cambiarEstado}
            onQuitar={quitarLibro}
          />
        </Panel>
      </main>
    </>
  );
}
