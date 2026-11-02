import { useState } from 'react';
import { ESTADOS, LIBROS_INICIALES, MIEMBROS } from './data/libros.js';
import { siguienteEstado } from './utils/estados.js';
import Encabezado from './components/layout/Encabezado.jsx';
import Panel from './components/layout/Panel.jsx';
import ListaLibros from './components/libros/ListaLibros.jsx';
import SinResultados from './components/libros/SinResultados.jsx';
import FormularioLibro from './components/libros/FormularioLibro.jsx';
import Filtros, { TODOS } from './components/tablero/Filtros.jsx';
import Resumen from './components/tablero/Resumen.jsx';

const FILTROS_INICIALES = { estado: TODOS, miembroId: TODOS };

export default function App() {
  const [libros, setLibros] = useState(LIBROS_INICIALES);

  // Estado elevado: Filtros lo modifica y la lista lo usa; ambos lo reciben de App.
  const [filtros, setFiltros] = useState(FILTROS_INICIALES);

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

  // El libro nuevo se agrega en un arreglo nuevo, con un id único para usarlo como key.
  function agregarLibro(datos) {
    setLibros((anteriores) => [...anteriores, { ...datos, id: crypto.randomUUID() }]);
  }

  // Valores derivados: se calculan en cada render a partir del estado, no se guardan aparte.
  const librosFiltrados = libros.filter((libro) => (
    (filtros.estado === TODOS || libro.estado === filtros.estado)
    && (filtros.miembroId === TODOS || libro.miembroId === filtros.miembroId)
  ));

  const conteo = Object.fromEntries(ESTADOS.map((estado) => [
    estado,
    libros.filter((libro) => libro.estado === estado).length,
  ]));

  return (
    <>
      <Encabezado />
      <main className="container pb-5">
        <Panel titulo="Resumen del club">
          <Resumen conteo={conteo} total={libros.length} />
        </Panel>

        <Panel titulo="Filtrar libros">
          <Filtros filtros={filtros} miembros={MIEMBROS} onCambiar={setFiltros} />
        </Panel>

        <Panel titulo="Agregar un libro">
          <FormularioLibro libros={libros} miembros={MIEMBROS} onAgregar={agregarLibro} />
        </Panel>

        <Panel titulo={`Libros del club (${librosFiltrados.length} de ${libros.length})`}>
          {librosFiltrados.length > 0 ? (
            <ListaLibros
              libros={librosFiltrados}
              miembros={MIEMBROS}
              onCambiarEstado={cambiarEstado}
              onQuitar={quitarLibro}
            />
          ) : (
            <SinResultados hayLibros={libros.length > 0} onLimpiar={() => setFiltros(FILTROS_INICIALES)} />
          )}
        </Panel>
      </main>
    </>
  );
}
