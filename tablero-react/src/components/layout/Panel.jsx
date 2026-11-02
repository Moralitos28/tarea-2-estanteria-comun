// Contenedor con título que envuelve cualquier contenido recibido como children.
export default function Panel({ titulo, children }) {
  return (
    <section className="card shadow-sm mb-4">
      <div className="card-body">
        {titulo && <h2 className="h5 card-title mb-3">{titulo}</h2>}
        {children}
      </div>
    </section>
  );
}
