import { ESTADOS } from '../../data/libros.js';

export const TODOS = 'todos';

// Componente controlado: muestra los filtros que recibe y avisa los cambios al padre.
export default function Filtros({ filtros, miembros, onCambiar }) {
  function cambiar(evento) {
    const { name, value } = evento.target;
    onCambiar({ ...filtros, [name]: value });
  }

  const hayFiltros = filtros.estado !== TODOS || filtros.miembroId !== TODOS;

  return (
    <div className="row g-3 align-items-end">
      <div className="col-12 col-sm-6 col-lg-5">
        <label htmlFor="filtro-estado" className="form-label">Estado</label>
        <select id="filtro-estado" name="estado" className="form-select" value={filtros.estado} onChange={cambiar}>
          <option value={TODOS}>Todos los estados</option>
          {ESTADOS.map((estado) => <option key={estado} value={estado}>{estado}</option>)}
        </select>
      </div>
      <div className="col-12 col-sm-6 col-lg-5">
        <label htmlFor="filtro-miembro" className="form-label">Propuesto por</label>
        <select id="filtro-miembro" name="miembroId" className="form-select" value={filtros.miembroId} onChange={cambiar}>
          <option value={TODOS}>Todos los miembros</option>
          {miembros.map((miembro) => <option key={miembro.id} value={miembro.id}>{miembro.nombre}</option>)}
        </select>
      </div>
      <div className="col-12 col-lg-2 d-grid">
        <button
          type="button"
          className="btn btn-outline-secondary"
          disabled={!hayFiltros}
          onClick={() => onCambiar({ estado: TODOS, miembroId: TODOS })}
        >
          Limpiar
        </button>
      </div>
    </div>
  );
}
