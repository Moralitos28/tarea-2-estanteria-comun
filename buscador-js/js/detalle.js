// Modal de detalle de un libro.

import { estaEnLecturas } from './lecturas.js';
import { crearDetalleLibro, marcarBotonAgregar } from './render.js';

const modal = document.querySelector('#modal-detalle');
const modalTitulo = document.querySelector('#modal-detalle-titulo');
const modalCuerpo = document.querySelector('#modal-detalle-cuerpo');
const botonAgregar = document.querySelector('#modal-agregar');

let libroActual = null;

export function abrirDetalle(libro) {
  libroActual = libro;
  modalTitulo.textContent = libro.titulo;
  modalCuerpo.replaceChildren(crearDetalleLibro(libro));
  marcarBotonAgregar(botonAgregar, estaEnLecturas(libro.id));
  bootstrap.Modal.getOrCreateInstance(modal).show();
}

export function iniciarDetalle() {
  botonAgregar.addEventListener('click', () => {
    if (!libroActual) return;
    document.dispatchEvent(new CustomEvent('libro:agregar', { detail: libroActual }));
  });

  // Si el libro abierto entra o sale de la lista, el botón del modal se actualiza.
  document.addEventListener('lecturas:cambio', (evento) => {
    if (libroActual?.id === evento.detail.id) {
      marcarBotonAgregar(botonAgregar, evento.detail.enLista);
    }
  });
}
