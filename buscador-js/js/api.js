// Acceso a la API pública de Open Library

const URL_BUSQUEDA = 'https://openlibrary.org/search.json';
const URL_PORTADAS = 'https://covers.openlibrary.org/b/id';
const LIMITE_RESULTADOS = 12;

export const PORTADA_ALTERNATIVA = 'img/sin-portada.svg';

export function urlPortada(portadaId, tamano = 'M') {
  return portadaId ? `${URL_PORTADAS}/${portadaId}-${tamano}.jpg` : PORTADA_ALTERNATIVA;
}

// Convierte un documento de la API en el objeto libro que usa la aplicación.
function normalizarLibro(doc) {
  return {
    id: doc.key,
    titulo: doc.title ?? 'Sin título',
    autores: doc.author_name ?? [],
    anio: doc.first_publish_year ?? null,
    portadaId: doc.cover_i ?? null,
    paginas: doc.number_of_pages_median ?? null,
    ediciones: doc.edition_count ?? null,
    temas: (doc.subject ?? []).slice(0, 6),
  };
}

export async function buscarLibros(texto, { signal } = {}) {
  const url = `${URL_BUSQUEDA}?q=${encodeURIComponent(texto)}&limit=${LIMITE_RESULTADOS}`;
  const respuesta = await fetch(url, { signal });

  if (!respuesta.ok) {
    throw new Error(`Open Library respondió con el código ${respuesta.status}.`);
  }

  const datos = await respuesta.json();
  return datos.docs.map(normalizarLibro);
}

// Servicio de pruebas que simula el registro de la propuesta.
const URL_PROPUESTAS = 'https://jsonplaceholder.typicode.com/posts';

export async function enviarPropuesta(propuesta) {
  const respuesta = await fetch(URL_PROPUESTAS, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=UTF-8' },
    body: JSON.stringify(propuesta),
  });

  if (!respuesta.ok) {
    throw new Error(`El servidor respondió con el código ${respuesta.status}.`);
  }

  return respuesta.json();
}
