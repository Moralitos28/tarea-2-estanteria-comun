// Controlador de la lista de lecturas: sincroniza el estado en memoria con la tabla.

import {
  agregarLectura, avanzarEstado, quitarLectura, buscarLectura, obtenerLecturas, siguienteEstado,
} from './lecturas.js';
import { crearFilaLectura, actualizarFilaLectura, crearAlerta } from './render.js';
import { cargarLecturasIniciales } from './api.js';
import { abrirDetalle } from './detalle.js';
import { animarEntrada, animarCambio, animarSalida } from './animaciones.js';

const tabla = document.querySelector('#tabla-lecturas');
const cuerpo = document.querySelector('#lista-lecturas');
const mensajeVacio = document.querySelector('#lecturas-vacia');

// Ignora filas que están saliendo, por si el libro se vuelve a agregar antes de que terminen.
function buscarFila(id) {
  return cuerpo.querySelector(`tr[data-id="${CSS.escape(id)}"]:not(.fila-lectura--saliendo)`);
}

function actualizarMensajeVacio() {
  const vacia = obtenerLecturas().length === 0;
  mensajeVacio.classList.toggle('d-none', !vacia);
  tabla.classList.toggle('d-none', vacia);
}

function avisarCambio(id, enLista) {
  document.dispatchEvent(new CustomEvent('lecturas:cambio', { detail: { id, enLista } }));
}

function agregar(libro, estado) {
  const lectura = agregarLectura(libro, estado);
  if (!lectura) return;

  const fila = crearFilaLectura(lectura, siguienteEstado(lectura.estado));
  cuerpo.append(fila);
  animarEntrada(fila, 'fila-lectura--entrando');
  actualizarMensajeVacio();
  avisarCambio(lectura.id, true);
}

function cambiarEstado(id) {
  const lectura = avanzarEstado(id);
  const fila = buscarFila(id);
  if (!lectura || !fila) return;

  actualizarFilaLectura(fila, lectura, siguienteEstado(lectura.estado));
  animarCambio(fila.querySelector('.fila-lectura__estado'), 'estado-cambiado');
}

async function quitar(id) {
  const fila = buscarFila(id);
  if (!quitarLectura(id) || !fila) return;

  avisarCambio(id, false);

  // El mensaje de lista vacía se actualiza después de la salida; si la tabla
  // se ocultara antes, la transición se cancelaría sin llegar a verse.
  await animarSalida(fila, 'fila-lectura--saliendo');
  actualizarMensajeVacio();
  cargarIniciales();
}

// Carga las lecturas de ejemplo. Si fallan, la lista arranca vacía y se avisa sin romper la página.
async function cargarIniciales() {
  try {
    const iniciales = await cargarLecturasIniciales();
    iniciales.forEach(({ libro, estado }) => agregar(libro, estado));
  } catch (error) {
    tabla.before(crearAlerta('warning', 'No se cargaron las lecturas de ejemplo.', error.message));
  }
}

export function iniciarLista() {
  document.addEventListener('libro:agregar', (evento) => agregar(evento.detail));

  // Delegación: una sola escucha en el cuerpo de la tabla para los botones de todas las filas.
  cuerpo.addEventListener('click', (evento) => {
    const boton = evento.target.closest('button[data-accion]');
    if (!boton || !cuerpo.contains(boton)) return;

    // El clic en un botón no debe llegar a la tabla, que abre el detalle al hacer clic en la fila.
    evento.stopPropagation();

    const id = boton.closest('tr[data-id]').dataset.id;
    if (boton.dataset.accion === 'cambiar-estado') cambiarEstado(id);
    if (boton.dataset.accion === 'quitar') quitar(id);
  });

  // Clic en cualquier otra parte de la fila: abre el detalle del libro.
  tabla.addEventListener('click', (evento) => {
    const fila = evento.target.closest('tr[data-id]');
    if (!fila) return;

    const lectura = buscarLectura(fila.dataset.id);
    if (lectura) abrirDetalle(lectura.libro);
  });

  actualizarMensajeVacio();
  cargarIniciales();
}
