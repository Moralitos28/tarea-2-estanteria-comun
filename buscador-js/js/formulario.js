// Formulario de propuesta: validación con la API de validación de restricciones.

const formulario = document.querySelector('#form-propuesta');
const contenedorAutores = document.querySelector('#autores');
const plantillaAutor = document.querySelector('#plantilla-autor');
const campoAnio = document.querySelector('#anio');
const campoFecha = document.querySelector('#fecha');

// Nombres legibles de cada campo para los mensajes de error.
const NOMBRES = {
  titulo: { texto: 'El título', femenino: false },
  autores: { texto: 'El nombre del autor', femenino: false },
  anio: { texto: 'El año de publicación', femenino: false },
  paginas: { texto: 'La cantidad de páginas', femenino: true },
  genero: { texto: 'El género', femenino: false },
  correo: { texto: 'El correo', femenino: false },
  fecha: { texto: 'La fecha de la sesión', femenino: true },
  motivo: { texto: 'El motivo', femenino: false },
};

// Fecha local en formato AAAA-MM-DD (toISOString usaría la hora UTC).
function fechaDeHoy() {
  const hoy = new Date();
  const mes = String(hoy.getMonth() + 1).padStart(2, '0');
  const dia = String(hoy.getDate()).padStart(2, '0');
  return `${hoy.getFullYear()}-${mes}-${dia}`;
}

// Reglas que HTML5 no puede expresar por sí solo.
const REGLAS_PERSONALIZADAS = {
  anio(campo) {
    const anioActual = new Date().getFullYear();
    return Number(campo.value) > anioActual ? `El año no puede ser posterior a ${anioActual}.` : '';
  },
  fecha(campo) {
    return campo.value && campo.value < fechaDeHoy() ? 'La fecha de la sesión no puede ser anterior a hoy.' : '';
  },
  autores(campo) {
    return campo.value.trim() === '' && campo.value !== '' ? 'El nombre del autor no puede tener solo espacios.' : '';
  },
};

// El navegador solo aplica minlength a lo que el usuario escribe, no a valores
// asignados desde código. Esta regla lo verifica siempre.
function reglaLongitudMinima(campo) {
  const { minLength, value } = campo;
  if (minLength <= 0 || value === '' || value.length >= minLength) return '';

  const { texto } = NOMBRES[campo.name] ?? { texto: 'Este campo' };
  return `${texto} debe tener al menos ${minLength} caracteres (tiene ${value.length}).`;
}

function mensajeDeError(campo) {
  const { validity } = campo;
  const { texto: nombre, femenino } = NOMBRES[campo.name] ?? { texto: 'Este campo', femenino: false };

  if (validity.customError) return campo.validationMessage;
  if (validity.valueMissing) {
    return campo.tagName === 'SELECT' ? 'Seleccione una opción.' : `${nombre} es ${femenino ? 'obligatoria' : 'obligatorio'}.`;
  }
  if (validity.badInput) return `${nombre} debe ser un número válido.`;
  if (validity.typeMismatch) return 'Escriba un correo válido, por ejemplo nombre@correo.com.';
  if (validity.patternMismatch) return 'El correo debe tener un dominio válido, por ejemplo nombre@correo.com.';
  if (validity.tooShort) return `${nombre} debe tener al menos ${campo.minLength} caracteres (tiene ${campo.value.length}).`;
  if (validity.tooLong) return `${nombre} no puede superar ${campo.maxLength} caracteres.`;
  if (validity.rangeUnderflow) return `${nombre} debe ser como mínimo ${campo.min}.`;
  if (validity.rangeOverflow) return `${nombre} debe ser como máximo ${campo.max}.`;
  if (validity.stepMismatch) return `${nombre} debe ser un número entero.`;
  return '';
}

function contenedorMensaje(campo) {
  return campo.parentElement.querySelector('.invalid-feedback');
}

// Valida un campo, muestra su mensaje junto a él y devuelve si es válido.
export function validarCampo(campo) {
  const regla = REGLAS_PERSONALIZADAS[campo.name];
  campo.setCustomValidity((regla ? regla(campo) : '') || reglaLongitudMinima(campo));

  const valido = campo.checkValidity();
  const mensaje = valido ? '' : mensajeDeError(campo);

  campo.classList.toggle('is-invalid', !valido);
  campo.classList.toggle('is-valid', valido);
  campo.setAttribute('aria-invalid', String(!valido));
  contenedorMensaje(campo).textContent = mensaje;

  return valido;
}

// Campos con datos; se excluyen los botones, que también participan en la validación.
function esCampo(elemento) {
  return elemento.willValidate && ['INPUT', 'SELECT', 'TEXTAREA'].includes(elemento.tagName);
}

function camposDelFormulario() {
  return [...formulario.elements].filter(esCampo);
}

// Valida todos los campos y lleva el foco al primero con error.
export function validarFormulario() {
  const invalidos = camposDelFormulario().filter((campo) => !validarCampo(campo));
  invalidos[0]?.focus();
  return invalidos.length === 0;
}

export function limpiarValidacion() {
  for (const campo of camposDelFormulario()) {
    campo.classList.remove('is-invalid', 'is-valid');
    campo.removeAttribute('aria-invalid');
    campo.dataset.tocado = '';
    contenedorMensaje(campo).textContent = '';
  }
}

export function crearCampoAutor() {
  const fragmento = plantillaAutor.content.cloneNode(true);
  const campo = fragmento.querySelector('input');
  const mensaje = fragmento.querySelector('.invalid-feedback');

  // Cada campo necesita un id propio para asociar su mensaje de error.
  const id = `autor-${crypto.randomUUID()}`;
  campo.id = id;
  mensaje.id = `${id}-error`;
  campo.setAttribute('aria-describedby', mensaje.id);

  contenedorAutores.append(fragmento);
  return campo;
}

function asociarMensajes() {
  for (const campo of camposDelFormulario()) {
    const mensaje = contenedorMensaje(campo);
    if (campo.id && mensaje && !mensaje.id) {
      mensaje.id = `${campo.id}-error`;
      campo.setAttribute('aria-describedby', mensaje.id);
    }
  }
}

export function iniciarFormulario() {
  // Con JavaScript activo se muestran mensajes propios en lugar de los globos del navegador.
  // Sin JavaScript, la validación nativa sigue funcionando.
  formulario.noValidate = true;

  // Restricciones que dependen de la fecha actual, también como atributos nativos.
  campoAnio.max = new Date().getFullYear();
  campoFecha.min = fechaDeHoy();

  crearCampoAutor();
  asociarMensajes();

  // Delegación: los campos se validan al salir de ellos y, una vez tocados, mientras se escribe.
  // Funciona también para los campos de autor que se agregan después.
  formulario.addEventListener('focusout', (evento) => {
    const campo = evento.target;
    if (!esCampo(campo)) return;

    campo.dataset.tocado = 'si';
    validarCampo(campo);
  });

  formulario.addEventListener('input', (evento) => {
    const campo = evento.target;
    if (esCampo(campo) && campo.dataset.tocado === 'si') validarCampo(campo);
  });

  formulario.addEventListener('submit', (evento) => {
    evento.preventDefault();
    validarFormulario();
  });
}
