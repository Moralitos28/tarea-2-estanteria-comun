import { useState } from 'react';
import { ESTADOS } from '../../data/libros.js';
import { LIBRO_VACIO, validarCampo, validarLibro } from '../../utils/validacion.js';
import CampoFormulario from './CampoFormulario.jsx';

// Formulario controlado: cada campo muestra el valor guardado en el estado
// y cada cambio actualiza ese estado. El libro nuevo se entrega al padre con onAgregar.
export default function FormularioLibro({ libros, miembros, onAgregar }) {
  const [datos, setDatos] = useState(LIBRO_VACIO);
  const [errores, setErrores] = useState({});
  const [tocados, setTocados] = useState({});
  const [confirmacion, setConfirmacion] = useState('');

  function cambiar(evento) {
    const { name, value } = evento.target;
    setDatos((anteriores) => ({ ...anteriores, [name]: value }));
    setConfirmacion('');

    // Una vez que el campo fue tocado, se revalida mientras se escribe.
    if (tocados[name]) {
      setErrores((anteriores) => ({ ...anteriores, [name]: validarCampo(name, value, libros) }));
    }
  }

  function salir(evento) {
    const { name, value } = evento.target;
    setTocados((anteriores) => ({ ...anteriores, [name]: true }));
    setErrores((anteriores) => ({ ...anteriores, [name]: validarCampo(name, value, libros) }));
  }

  function enviar(evento) {
    evento.preventDefault();

    const nuevosErrores = validarLibro(datos, libros);
    setErrores(nuevosErrores);
    setTocados({ titulo: true, autor: true, miembroId: true, estado: true });
    if (Object.keys(nuevosErrores).length > 0) return;

    onAgregar({ ...datos, titulo: datos.titulo.trim(), autor: datos.autor.trim() });
    setConfirmacion(`"${datos.titulo.trim()}" se agregó al tablero.`);
    setDatos(LIBRO_VACIO);
    setErrores({});
    setTocados({});
  }

  const propsCampo = (nombre) => ({
    nombre,
    valor: datos[nombre],
    error: errores[nombre],
    onChange: cambiar,
    onBlur: salir,
  });

  return (
    <form className="row g-3" onSubmit={enviar} noValidate>
      {confirmacion && (
        <div className="col-12">
          <p className="alert alert-success mb-0" role="status">{confirmacion}</p>
        </div>
      )}

      <CampoFormulario etiqueta="Título" clase="col-12 col-md-6" {...propsCampo('titulo')}>
        {(props) => <input type="text" maxLength={120} {...props} />}
      </CampoFormulario>

      <CampoFormulario etiqueta="Autor" clase="col-12 col-md-6" {...propsCampo('autor')}>
        {(props) => <input type="text" maxLength={80} {...props} />}
      </CampoFormulario>

      <CampoFormulario etiqueta="Propuesto por" clase="col-12 col-md-6" {...propsCampo('miembroId')}>
        {(props) => (
          <select {...props} className={props.className.replace('form-control', 'form-select')}>
            <option value="">Seleccione un miembro</option>
            {miembros.map((miembro) => <option key={miembro.id} value={miembro.id}>{miembro.nombre}</option>)}
          </select>
        )}
      </CampoFormulario>

      <CampoFormulario etiqueta="Estado inicial" clase="col-12 col-md-6" {...propsCampo('estado')}>
        {(props) => (
          <select {...props} className={props.className.replace('form-control', 'form-select')}>
            {ESTADOS.map((estado) => <option key={estado} value={estado}>{estado}</option>)}
          </select>
        )}
      </CampoFormulario>

      <div className="col-12 d-flex justify-content-end">
        <button type="submit" className="btn btn-primary">Agregar libro</button>
      </div>
    </form>
  );
}
