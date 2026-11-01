// Controlador de la búsqueda: formulario, estados y modal de detalle.

import { buscarLibros } from './api.js';
import { renderizarResultados, mostrarEstado, crearDetalleLibro } from './render.js';

const formulario = document.querySelector('#form-busqueda');
const campoTexto = document.querySelector('#texto-busqueda');
const estado = document.querySelector('#estado-busqueda');
const resultados = document.querySelector('#resultados');

const modal = document.querySelector('#modal-detalle');
const modalTitulo = document.querySelector('#modal-detalle-titulo');
const modalCuerpo = document.querySelector('#modal-detalle-cuerpo');

// Libros de la última búsqueda, indexados por id para recuperarlos desde el DOM.
const librosPorId = new Map();
let controladorActual = null;

export function obtenerLibro(id) {
  return librosPorId.get(id);
}

async function ejecutarBusqueda(texto) {
  // Cancela una búsqueda anterior que siga en curso.
  controladorActual?.abort();
  controladorActual = new AbortController();

  resultados.replaceChildren();
  mostrarEstado(estado, 'cargando');

  try {
    const libros = await buscarLibros(texto, { signal: controladorActual.signal });

    librosPorId.clear();
    libros.forEach((libro) => librosPorId.set(libro.id, libro));

    if (libros.length === 0) {
      mostrarEstado(estado, 'vacio', `No se encontraron libros para "${texto}".`);
      return;
    }

    mostrarEstado(estado, null);
    renderizarResultados(resultados, libros);
  } catch (error) {
    if (error.name === 'AbortError') return;
    mostrarEstado(estado, 'error', `No se pudo completar la búsqueda. ${error.message}`);
  }
}

function abrirDetalle(libro) {
  modalTitulo.textContent = libro.titulo;
  modalCuerpo.replaceChildren(crearDetalleLibro(libro));
  modal.dataset.id = libro.id;
  bootstrap.Modal.getOrCreateInstance(modal).show();
}

export function iniciarBusqueda() {
  formulario.addEventListener('submit', (evento) => {
    evento.preventDefault();

    if (!formulario.reportValidity()) return;
    ejecutarBusqueda(campoTexto.value.trim());
  });

  // Delegación: una sola escucha para todos los botones de las tarjetas.
  resultados.addEventListener('click', (evento) => {
    const boton = evento.target.closest('[data-accion]');
    if (!boton || !resultados.contains(boton)) return;

    const libro = obtenerLibro(boton.closest('[data-id]').dataset.id);
    if (!libro) return;

    if (boton.dataset.accion === 'detalle') abrirDetalle(libro);
  });
}
