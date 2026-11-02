import { ESTADOS } from '../../data/libros.js';

const CLASES_CIFRA = {
  Pendiente: 'text-secondary',
  Leyendo: 'text-warning-emphasis',
  Leído: 'text-success',
};

// Recibe los conteos ya calculados; no guarda estado propio.
export default function Resumen({ conteo, total }) {
  return (
    <dl className="resumen mb-0">
      {ESTADOS.map((estado) => (
        <div key={estado} className="border rounded p-3 bg-white">
          <dt className="small text-body-secondary fw-normal">{estado}</dt>
          <dd className={`resumen__cifra mb-0 ${CLASES_CIFRA[estado]}`}>{conteo[estado]}</dd>
        </div>
      ))}
      <div className="border rounded p-3 bg-white">
        <dt className="small text-body-secondary fw-normal">Total</dt>
        <dd className="resumen__cifra mb-0">{total}</dd>
      </div>
    </dl>
  );
}
