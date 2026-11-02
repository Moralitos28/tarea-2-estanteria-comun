import { ESTADOS } from '../data/libros.js';

// Avanza al siguiente estado; después del último vuelve al primero.
export function siguienteEstado(estado) {
  return ESTADOS[(ESTADOS.indexOf(estado) + 1) % ESTADOS.length];
}
