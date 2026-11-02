// Datos iniciales del tablero. En esta parte no se consume ninguna API.

export const ESTADOS = ['Pendiente', 'Leyendo', 'Leído'];

export const MIEMBROS = [
  { id: 'm1', nombre: 'Ana Solís' },
  { id: 'm2', nombre: 'Bruno Vargas' },
  { id: 'm3', nombre: 'Carla Jiménez' },
  { id: 'm4', nombre: 'Diego Mora' },
];

export const LIBROS_INICIALES = [
  { id: 'l1', titulo: 'Cien años de soledad', autor: 'Gabriel García Márquez', estado: 'Leído', miembroId: 'm1' },
  { id: 'l2', titulo: 'Rayuela', autor: 'Julio Cortázar', estado: 'Leyendo', miembroId: 'm2' },
  { id: 'l3', titulo: 'Pedro Páramo', autor: 'Juan Rulfo', estado: 'Pendiente', miembroId: 'm3' },
  { id: 'l4', titulo: 'La casa de los espíritus', autor: 'Isabel Allende', estado: 'Pendiente', miembroId: 'm1' },
  { id: 'l5', titulo: 'Ficciones', autor: 'Jorge Luis Borges', estado: 'Leído', miembroId: 'm4' },
  { id: 'l6', titulo: 'Única mirando al mar', autor: 'Fernando Contreras Castro', estado: 'Leyendo', miembroId: 'm3' },
  { id: 'l7', titulo: 'Como agua para chocolate', autor: 'Laura Esquivel', estado: 'Pendiente', miembroId: 'm2' },
];
