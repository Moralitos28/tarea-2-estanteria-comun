// Estado de la lista de lecturas. Vive en memoria durante la sesión.

export const ESTADOS = ['Pendiente', 'Leyendo', 'Leído'];

const lecturas = [];

export function obtenerLecturas() {
  return lecturas;
}

export function buscarLectura(id) {
  return lecturas.find((lectura) => lectura.id === id);
}

export function estaEnLecturas(id) {
  return buscarLectura(id) !== undefined;
}

// Agrega el libro con el estado indicado (por defecto, el primero).
// Devuelve null si ya estaba en la lista o si el estado no existe.
export function agregarLectura(libro, estado = ESTADOS[0]) {
  if (estaEnLecturas(libro.id) || !ESTADOS.includes(estado)) return null;

  const lectura = {
    id: libro.id,
    titulo: libro.titulo,
    autores: libro.autores,
    estado,
    libro,
  };

  lecturas.push(lectura);
  return lectura;
}

// Avanza al siguiente estado; después del último vuelve al primero.
export function avanzarEstado(id) {
  const lectura = buscarLectura(id);
  if (!lectura) return null;

  const siguiente = (ESTADOS.indexOf(lectura.estado) + 1) % ESTADOS.length;
  lectura.estado = ESTADOS[siguiente];
  return lectura;
}

export function siguienteEstado(estado) {
  return ESTADOS[(ESTADOS.indexOf(estado) + 1) % ESTADOS.length];
}

export function quitarLectura(id) {
  const indice = lecturas.findIndex((lectura) => lectura.id === id);
  if (indice === -1) return false;

  lecturas.splice(indice, 1);
  return true;
}
