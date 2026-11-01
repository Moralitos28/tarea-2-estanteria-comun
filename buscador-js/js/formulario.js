// Formulario de propuesta: validación con la API de validación de restricciones,
// campos de autor dinámicos y envío asincrónico.

import { enviarPropuesta } from './api.js';
import { crearAlerta } from './render.js';

const MIN_AUTORES = 1;
const MAX_AUTORES = 5;

const formulario = document.querySelector('#form-propuesta');
const contenedorAutores = document.querySelector('#autores');
const plantillaAutor = document.querySelector('#plantilla-autor');
const campoAnio = document.querySelector('#anio');
const campoFecha = document.querySelector('#fecha');
const botonAgregarAutor = document.querySelector('#agregar-autor');
const contadorAutores = document.querySelector('#contador-autores');
const botonEnviar = document.querySelector('#enviar-propuesta');
const alerta = document.querySelector('#alerta-propuesta');

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

  // Los <select> no tienen minLength (es undefined), así que la regla no aplica.
  if (!(minLength > 0) || value === '' || value.length >= minLength) return '';

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
function validarCampo(campo) {
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
function validarFormulario() {
  const invalidos = camposDelFormulario().filter((campo) => !validarCampo(campo));
  invalidos[0]?.focus();
  return invalidos.length === 0;
}

function limpiarValidacion() {
  for (const campo of camposDelFormulario()) {
    campo.classList.remove('is-invalid', 'is-valid');
    campo.removeAttribute('aria-invalid');
    campo.dataset.tocado = '';
    contenedorMensaje(campo).textContent = '';
  }
}

function camposAutor() {
  return [...contenedorAutores.querySelectorAll('input')];
}

// Habilita o deshabilita los botones según los límites y actualiza el contador.
function actualizarControlesAutores() {
  const cantidad = camposAutor().length;

  botonAgregarAutor.disabled = cantidad >= MAX_AUTORES;
  for (const boton of contenedorAutores.querySelectorAll('[data-accion="quitar-autor"]')) {
    boton.disabled = cantidad <= MIN_AUTORES;
  }

  contadorAutores.textContent = `${cantidad} de ${MAX_AUTORES} autores (mínimo ${MIN_AUTORES}).`;
}

function crearCampoAutor() {
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

function agregarAutor() {
  if (camposAutor().length >= MAX_AUTORES) return;

  const campo = crearCampoAutor();
  actualizarControlesAutores();
  campo.focus();
}

function quitarAutor(boton) {
  if (camposAutor().length <= MIN_AUTORES) return;

  const grupo = boton.closest('.campo-autor');
  const anterior = grupo.previousElementSibling ?? grupo.nextElementSibling;
  grupo.remove();
  actualizarControlesAutores();
  anterior?.querySelector('input')?.focus();
}

// Reúne los datos del formulario; los autores llegan como un arreglo.
function datosDelFormulario() {
  const datos = new FormData(formulario);
  return {
    titulo: datos.get('titulo').trim(),
    autores: datos.getAll('autores').map((autor) => autor.trim()),
    anio: Number(datos.get('anio')),
    paginas: Number(datos.get('paginas')),
    genero: datos.get('genero'),
    correo: datos.get('correo').trim(),
    fecha: datos.get('fecha'),
    motivo: datos.get('motivo').trim(),
  };
}

function mostrarAlerta(tipo, titulo, mensaje) {
  alerta.replaceChildren(crearAlerta(tipo, titulo, mensaje));
  alerta.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function marcarEnviando(enviando) {
  botonEnviar.disabled = enviando;
  botonEnviar.querySelector('.spinner-border').classList.toggle('d-none', !enviando);
  botonEnviar.querySelector('.texto-boton').textContent = enviando ? 'Enviando…' : 'Enviar propuesta';
}

// Deja el formulario como al cargar la página: un solo autor y sin marcas de validación.
function reiniciarFormulario() {
  formulario.reset();
  camposAutor().slice(MIN_AUTORES).forEach((campo) => campo.closest('.campo-autor').remove());
  limpiarValidacion();
  actualizarControlesAutores();
}

async function enviar() {
  if (!validarFormulario()) {
    mostrarAlerta('warning', 'Revise el formulario.', 'Hay campos con errores; corríjalos antes de enviar.');
    return;
  }

  const propuesta = datosDelFormulario();
  marcarEnviando(true);

  try {
    const respuesta = await enviarPropuesta(propuesta);
    mostrarAlerta('success', '¡Propuesta registrada!',
      `"${propuesta.titulo}" quedó registrada con el número ${respuesta.id}. Gracias por proponer.`);
    reiniciarFormulario();
  } catch (error) {
    // Un fallo de red (sin conexión, CORS) llega como TypeError; un código de error, como Error propio.
    const detalle = error instanceof TypeError ? 'Revise su conexión a internet.' : error.message;
    mostrarAlerta('danger', 'No se pudo enviar la propuesta.', `${detalle} Intente de nuevo.`);
  } finally {
    marcarEnviando(false);
  }
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
  actualizarControlesAutores();

  botonAgregarAutor.addEventListener('click', agregarAutor);

  // Delegación: una sola escucha para los botones de quitar de todos los autores.
  contenedorAutores.addEventListener('click', (evento) => {
    const boton = evento.target.closest('[data-accion="quitar-autor"]');
    if (boton && contenedorAutores.contains(boton)) quitarAutor(boton);
  });

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
    enviar();
  });
}
