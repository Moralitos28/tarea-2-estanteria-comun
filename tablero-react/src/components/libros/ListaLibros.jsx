import TarjetaLibro from './TarjetaLibro.jsx';

export default function ListaLibros({ libros, miembros, onCambiarEstado, onQuitar }) {
  const nombrePorId = Object.fromEntries(miembros.map((miembro) => [miembro.id, miembro.nombre]));

  return (
    <div className="grilla-libros">
      {libros.map((libro) => (
        <TarjetaLibro
          key={libro.id}
          libro={libro}
          nombreMiembro={nombrePorId[libro.miembroId] ?? 'Miembro desconocido'}
          onCambiarEstado={onCambiarEstado}
          onQuitar={onQuitar}
        />
      ))}
    </div>
  );
}
