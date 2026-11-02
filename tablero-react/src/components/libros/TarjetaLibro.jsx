const CLASES_ESTADO = {
  Pendiente: 'text-bg-secondary',
  Leyendo: 'text-bg-warning',
  Leído: 'text-bg-success',
};

const MODIFICADOR_ESTADO = {
  Pendiente: '',
  Leyendo: 'libro-club--leyendo',
  Leído: 'libro-club--leido',
};

export default function TarjetaLibro({ libro, nombreMiembro }) {
  return (
    <article className={`card h-100 libro-club ${MODIFICADOR_ESTADO[libro.estado]}`}>
      <div className="card-body d-flex flex-column">
        <h3 className="card-title libro-club__titulo">{libro.titulo}</h3>
        <p className="card-text text-body-secondary mb-2">{libro.autor}</p>
        <p className="card-text small mb-3">Propuesto por {nombreMiembro}</p>
        <div className="mt-auto">
          <span className={`badge ${CLASES_ESTADO[libro.estado]}`}>{libro.estado}</span>
        </div>
      </div>
    </article>
  );
}
