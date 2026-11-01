// Controlador de la búsqueda: formulario, estados y tarjetas de resultados.

import { buscarLibros } from './api.js';
import { estaEnLecturas } from './lecturas.js';
import { renderizarResultados, mostrarEstado, marcarBotonAgregar } from './render.js';
import { abrirDetalle } from './detalle.js';

const formulario = document.querySelector('#form-busqueda');
const campoTexto = document.querySelector('#texto-busqueda');
const estado = document.querySelector('#estado-busqueda');
const resultados = document.querySelector('#resultados');

// Libros de la última búsqueda, indexados por id para recuperarlos desde el DOM.
const librosPorId = new Map();
let controladorActual = null;

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
    renderizarResultados(resultados, libros, estaEnLecturas);
  } catch (error) {
    if (error.name === 'AbortError') return;
    mostrarEstado(estado, 'error', `No se pudo completar la búsqueda. ${error.message}`);
  }
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

    const libro = librosPorId.get(boton.closest('[data-id]').dataset.id);
    if (!libro) return;

    if (boton.dataset.accion === 'detalle') abrirDetalle(libro);
    if (boton.dataset.accion === 'agregar') {
      document.dispatchEvent(new CustomEvent('libro:agregar', { detail: libro }));
    }
  });

  // Mantiene sincronizado el botón de la tarjeta cuando cambia la lista.
  document.addEventListener('lecturas:cambio', (evento) => {
    const tarjeta = resultados.querySelector(`[data-id="${CSS.escape(evento.detail.id)}"]`);
    const boton = tarjeta?.querySelector('[data-accion="agregar"]');
    if (boton) marcarBotonAgregar(boton, evento.detail.enLista);
  });
}
