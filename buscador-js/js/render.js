// Funciones de renderizado: construyen la interfaz con métodos del DOM.
// Los datos externos se insertan siempre con textContent o atributos, nunca como HTML.

import { urlPortada, PORTADA_ALTERNATIVA } from './api.js';

// Crea un elemento con clases, texto, atributos e hijos en una sola llamada.
export function crearElemento(etiqueta, { clase, texto, atributos = {} } = {}, hijos = []) {
  const elemento = document.createElement(etiqueta);

  if (clase) elemento.className = clase;
  if (texto !== undefined && texto !== null) elemento.textContent = texto;

  for (const [nombre, valor] of Object.entries(atributos)) {
    elemento.setAttribute(nombre, valor);
  }

  elemento.append(...hijos);
  return elemento;
}

export function textoAutores(autores) {
  return autores.length > 0 ? autores.join(', ') : 'Autor desconocido';
}

function crearPortada(libro, clase) {
  const imagen = crearElemento('img', {
    clase,
    atributos: {
      src: urlPortada(libro.portadaId),
      alt: `Portada de ${libro.titulo}`,
      loading: 'lazy',
      width: '180',
      height: '270',
    },
  });

  // Si la portada no carga, se reemplaza por la imagen alternativa.
  imagen.addEventListener('error', () => {
    imagen.src = PORTADA_ALTERNATIVA;
  }, { once: true });

  return imagen;
}

export function crearTarjetaLibro(libro) {
  const cuerpo = crearElemento('div', { clase: 'card-body d-flex flex-column' }, [
    crearElemento('h3', { clase: 'card-title tarjeta-libro__titulo', texto: libro.titulo }),
    crearElemento('p', { clase: 'card-text text-body-secondary tarjeta-libro__autores mb-1', texto: textoAutores(libro.autores) }),
    crearElemento('p', { clase: 'card-text small mb-3', texto: libro.anio ? `Primera publicación: ${libro.anio}` : 'Año desconocido' }),
    crearElemento('div', { clase: 'mt-auto d-flex flex-wrap gap-2' }, [
      crearElemento('button', {
        clase: 'btn btn-outline-primary btn-sm',
        texto: 'Ver detalle',
        atributos: { type: 'button', 'data-accion': 'detalle' },
      }),
    ]),
  ]);

  return crearElemento('article', {
    clase: 'card tarjeta-libro',
    atributos: { 'data-id': libro.id },
  }, [crearPortada(libro, 'card-img-top tarjeta-libro__portada'), cuerpo]);
}

export function renderizarResultados(contenedor, libros) {
  contenedor.replaceChildren(...libros.map(crearTarjetaLibro));
}

// Muestra el estado de la búsqueda: cargando, error o vacío. Sin tipo, limpia el estado.
export function mostrarEstado(contenedor, tipo, mensaje = '') {
  if (!tipo) {
    contenedor.replaceChildren();
    return;
  }

  if (tipo === 'cargando') {
    contenedor.replaceChildren(
      crearElemento('div', { clase: 'd-flex align-items-center gap-3 py-3' }, [
        crearElemento('div', { clase: 'spinner-border text-primary', atributos: { role: 'status', 'aria-hidden': 'true' } }),
        crearElemento('span', { texto: mensaje || 'Buscando libros…' }),
      ]),
    );
    return;
  }

  const claseAlerta = tipo === 'error' ? 'alert-danger' : 'alert-info';
  contenedor.replaceChildren(
    crearElemento('div', { clase: `alert ${claseAlerta}`, texto: mensaje, atributos: { role: 'alert' } }),
  );
}

function crearDato(etiqueta, valor) {
  return [
    crearElemento('dt', { clase: 'col-sm-4', texto: etiqueta }),
    crearElemento('dd', { clase: 'col-sm-8', texto: valor }),
  ];
}

export function crearDetalleLibro(libro) {
  const datos = crearElemento('dl', { clase: 'row mb-0' }, [
    ...crearDato('Autores', textoAutores(libro.autores)),
    ...crearDato('Primera publicación', libro.anio ?? 'Desconocida'),
    ...crearDato('Páginas (promedio)', libro.paginas ?? 'Sin dato'),
    ...crearDato('Ediciones', libro.ediciones ?? 'Sin dato'),
  ]);

  const temas = crearElemento('div', { clase: 'd-flex flex-wrap gap-1 mt-3' },
    libro.temas.map((tema) => crearElemento('span', { clase: 'badge text-bg-light border', texto: tema })),
  );

  return crearElemento('div', { clase: 'row g-3' }, [
    crearElemento('div', { clase: 'col-5 col-md-4' }, [crearPortada(libro, 'img-fluid rounded shadow-sm')]),
    crearElemento('div', { clase: 'col-7 col-md-8' }, [datos, temas]),
  ]);
}
