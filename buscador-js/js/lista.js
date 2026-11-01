// Controlador de la lista de lecturas: sincroniza el estado en memoria con la tabla.

import {
  agregarLectura, avanzarEstado, quitarLectura, buscarLectura, obtenerLecturas, siguienteEstado,
} from './lecturas.js';
import { crearFilaLectura, actualizarFilaLectura } from './render.js';
import { abrirDetalle } from './detalle.js';

const tabla = document.querySelector('#tabla-lecturas');
const cuerpo = document.querySelector('#lista-lecturas');
const mensajeVacio = document.querySelector('#lecturas-vacia');

function buscarFila(id) {
  return cuerpo.querySelector(`tr[data-id="${CSS.escape(id)}"]`);
}

function actualizarMensajeVacio() {
  const vacia = obtenerLecturas().length === 0;
  mensajeVacio.classList.toggle('d-none', !vacia);
  tabla.classList.toggle('d-none', vacia);
}

function avisarCambio(id, enLista) {
  document.dispatchEvent(new CustomEvent('lecturas:cambio', { detail: { id, enLista } }));
}

function agregar(libro) {
  const lectura = agregarLectura(libro);
  if (!lectura) return;

  cuerpo.append(crearFilaLectura(lectura, siguienteEstado(lectura.estado)));
  actualizarMensajeVacio();
  avisarCambio(lectura.id, true);
}

function cambiarEstado(id) {
  const lectura = avanzarEstado(id);
  const fila = buscarFila(id);
  if (!lectura || !fila) return;

  actualizarFilaLectura(fila, lectura, siguienteEstado(lectura.estado));
}

function quitar(id) {
  const fila = buscarFila(id);
  if (!quitarLectura(id) || !fila) return;

  fila.remove();
  actualizarMensajeVacio();
  avisarCambio(id, false);
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
}
