import { useState } from 'react';
import { LIBROS_INICIALES, MIEMBROS } from './data/libros.js';
import Encabezado from './components/layout/Encabezado.jsx';
import Panel from './components/layout/Panel.jsx';
import ListaLibros from './components/libros/ListaLibros.jsx';

export default function App() {
  const [libros] = useState(LIBROS_INICIALES);

  return (
    <>
      <Encabezado />
      <main className="container pb-5">
        <Panel titulo="Libros del club">
          <ListaLibros libros={libros} miembros={MIEMBROS} />
        </Panel>
      </main>
    </>
  );
}
