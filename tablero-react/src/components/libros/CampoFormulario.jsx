// Envuelve un campo con su etiqueta y su mensaje de error.
// children es una función que recibe las props del control (id, valor, eventos y accesibilidad).
export default function CampoFormulario({ etiqueta, nombre, valor, error, onChange, onBlur, clase, children }) {
  const id = `campo-${nombre}`;
  const idError = `${id}-error`;

  const propsControl = {
    id,
    name: nombre,
    value: valor,
    onChange,
    onBlur,
    className: `form-control${error ? ' is-invalid' : ''}`,
    'aria-invalid': Boolean(error),
    'aria-describedby': error ? idError : undefined,
  };

  return (
    <div className={clase}>
      <label htmlFor={id} className="form-label">{etiqueta}</label>
      {children(propsControl)}
      {error && <div id={idError} className="invalid-feedback">{error}</div>}
    </div>
  );
}
