export default function SinResultados({ hayLibros, onLimpiar }) {
  if (!hayLibros) {
    return <p className="alert alert-info mb-0">El club todavía no tiene libros. Agregue el primero con el formulario.</p>;
  }

  return (
    <div className="alert alert-info d-flex flex-wrap align-items-center gap-2 mb-0" role="status">
      <span className="me-auto">Ningún libro coincide con los filtros seleccionados.</span>
      <button type="button" className="btn btn-sm btn-outline-primary" onClick={onLimpiar}>Ver todos</button>
    </div>
  );
}
