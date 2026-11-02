import { siguienteEstado } from '../../utils/estados.js';

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

// Recibe las acciones como props de tipo función; la tarjeta no modifica el estado por sí misma.
export default function TarjetaLibro({ libro, nombreMiembro, onCambiarEstado, onQuitar }) {
  return (
    <article className={`card h-100 libro-club ${MODIFICADOR_ESTADO[libro.estado]}`}>
      <div className="card-body d-flex flex-column">
        <h3 className="card-title libro-club__titulo">{libro.titulo}</h3>
        <p className="card-text text-body-secondary mb-2">{libro.autor}</p>
        <p className="card-text small mb-3">Propuesto por {nombreMiembro}</p>
        <div className="mt-auto d-flex flex-wrap align-items-center gap-2">
          <span className={`badge ${CLASES_ESTADO[libro.estado]} me-auto`}>{libro.estado}</span>
          <button type="button" className="btn btn-outline-primary btn-sm" onClick={() => onCambiarEstado(libro.id)}>
            Marcar {siguienteEstado(libro.estado)}
          </button>
          <button
            type="button"
            className="btn btn-outline-danger btn-sm"
            onClick={() => onQuitar(libro.id)}
            aria-label={`Quitar ${libro.titulo}`}
          >
            Quitar
          </button>
        </div>
      </div>
    </article>
  );
}
