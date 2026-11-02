# Estantería Común

Tarea 2 · SOFT-12 Programación Web Avanzada · Universidad CENFOTEC.

Dos herramientas para un club de lectura. Ambas agregan un libro a la lista, cambian su estado y lo quitan.

| Parte | Carpeta | Tecnologías | Función |
|---|---|---|---|
| A | [`buscador-js/`](buscador-js/) | JavaScript, Bootstrap 5, Sass | Búsqueda en Open Library, lista de lecturas y propuesta de libros. |
| B | [`tablero-react/`](tablero-react/) | React 19, Vite | Tablero del club con filtros, resumen y alta de libros. |

## Requisitos

- Node.js 20 o superior.
- Google Chrome.
- Conexión a internet para la Parte A (Open Library y JSONPlaceholder).

## Instalación

```bash
cd buscador-js && npm install
cd ../tablero-react && npm install
```

## Parte A — Buscador

```bash
cd buscador-js
npm run build:css   # compila scss/ en css/main.css
npm run watch:css   # recompila al guardar
npm start           # compila y sirve en http://localhost:3000
```

| Parcial Sass | Contenido |
|---|---|
| [`_funciones`](buscador-js/scss/_funciones.scss) | `rem()` |
| [`_variables`](buscador-js/scss/_variables.scss) | Paleta y variables de origen de Bootstrap |
| [`_bootstrap`](buscador-js/scss/_bootstrap.scss) | Parciales de Bootstrap en uso |
| [`_fuentes`](buscador-js/scss/_fuentes.scss) | Inter y Fraunces |
| [`_mixins`](buscador-js/scss/_mixins.scss) | `desde()` y `recortar-lineas()` |
| [`_componentes`](buscador-js/scss/_componentes.scss) | Grilla, tarjetas y animaciones |

| Módulo JS | Responsabilidad |
|---|---|
| [`api.js`](buscador-js/js/api.js) | Peticiones a Open Library, JSONPlaceholder y datos iniciales |
| [`render.js`](buscador-js/js/render.js) | Construcción de la interfaz con el DOM |
| [`busqueda.js`](buscador-js/js/busqueda.js) | Búsqueda y sus estados |
| [`detalle.js`](buscador-js/js/detalle.js) | Modal de detalle |
| [`lecturas.js`](buscador-js/js/lecturas.js) | Estado de la lista |
| [`lista.js`](buscador-js/js/lista.js) | Tabla de lecturas y delegación |
| [`animaciones.js`](buscador-js/js/animaciones.js) | Transiciones por clases |
| [`formulario.js`](buscador-js/js/formulario.js) | Validación, autores y envío |
| [`main.js`](buscador-js/js/main.js) | Punto de entrada |

## Parte B — Tablero

```bash
cd tablero-react
npm run dev         # http://localhost:5173
npm run build       # versión de producción en dist/
```

| Carpeta | Contenido |
|---|---|
| [`src/data/`](tablero-react/src/data/) | Miembros y libros iniciales |
| [`src/components/layout/`](tablero-react/src/components/layout/) | `Encabezado`, `Panel` |
| [`src/components/libros/`](tablero-react/src/components/libros/) | Lista, tarjeta y formulario |
| [`src/components/tablero/`](tablero-react/src/components/tablero/) | `Filtros`, `Resumen` |
| [`src/utils/`](tablero-react/src/utils/) | Estados y validación |

Los estilos reutilizan los parciales de la Parte A desde [`src/styles/main.scss`](tablero-react/src/styles/main.scss).

## Depuración

[`docs/depuracion.md`](docs/depuracion.md): error localizado con puntos de interrupción, análisis de red y optimización medida.

## Del DOM manual a React

Cambio de estado de un libro: Pendiente → Leyendo → Leído.

**Parte A — sincronización manual.** [`lista.js`](buscador-js/js/lista.js), `cambiarEstado()`:

1. Una escucha delegada en el `<tbody>` identifica el botón y la fila.
2. `avanzarEstado()` actualiza el modelo en [`lecturas.js`](buscador-js/js/lecturas.js).
3. `actualizarFilaLectura()` reescribe la insignia y el botón en [`render.js`](buscador-js/js/render.js).
4. El evento `lecturas:cambio` actualiza la tarjeta en [`busqueda.js`](buscador-js/js/busqueda.js) y el modal en [`detalle.js`](buscador-js/js/detalle.js).

**Parte B — interfaz derivada del estado.** [`App.jsx`](tablero-react/src/App.jsx), `cambiarEstado()`:

```jsx
setLibros((anteriores) => anteriores.map((libro) => (
  libro.id === id ? { ...libro, estado: siguienteEstado(libro.estado) } : libro
)));
```

[`TarjetaLibro.jsx`](tablero-react/src/components/libros/TarjetaLibro.jsx) muestra `libro.estado`; React aplica las diferencias al DOM.

| Parte A | Parte B |
|---|---|
| `buscarFila()` localiza la fila | Cada tarjeta recibe su `libro` por props |
| `actualizarFilaLectura()` reescribe el DOM | El JSX se recalcula con el estado |
| `lecturas:cambio` avisa a otros módulos | Resumen y filtros se derivan de `libros` |
| Delegación con `closest()` | `onClick` en cada botón |
| Modelo mutable | Copias con `map`, `filter` y spread |

Con React desaparece el código que solo mantiene la interfaz sincronizada con los datos.
