import { ESTADOS } from '../data/libros.js';

export const LIBRO_VACIO = { titulo: '', autor: '', miembroId: '', estado: ESTADOS[0] };

// Reglas de cada campo. Devuelven el mensaje de error o una cadena vacía si el valor es válido.
const REGLAS = {
  titulo(valor, libros) {
    const titulo = valor.trim();
    if (!titulo) return 'El título es obligatorio.';
    if (titulo.length < 2) return `El título debe tener al menos 2 caracteres (tiene ${titulo.length}).`;
    if (titulo.length > 120) return 'El título no puede superar 120 caracteres.';
    const repetido = libros.some((libro) => libro.titulo.trim().toLowerCase() === titulo.toLowerCase());
    return repetido ? 'Ese libro ya está en el tablero.' : '';
  },
  autor(valor) {
    const autor = valor.trim();
    if (!autor) return 'El autor es obligatorio.';
    if (autor.length < 3) return `El autor debe tener al menos 3 caracteres (tiene ${autor.length}).`;
    if (!/^[\p{L}\s.'-]+$/u.test(autor)) return 'El autor solo puede contener letras, espacios, puntos, apóstrofos y guiones.';
    return '';
  },
  miembroId(valor) {
    return valor ? '' : 'Seleccione el miembro que propone el libro.';
  },
  estado(valor) {
    return ESTADOS.includes(valor) ? '' : 'Seleccione un estado válido.';
  },
};

export function validarCampo(nombre, valor, libros) {
  return REGLAS[nombre](valor, libros);
}

// Devuelve un objeto con el mensaje de cada campo inválido; vacío si todo es válido.
export function validarLibro(datos, libros) {
  return Object.fromEntries(
    Object.keys(REGLAS)
      .map((nombre) => [nombre, validarCampo(nombre, datos[nombre], libros)])
      .filter(([, mensaje]) => mensaje),
  );
}
