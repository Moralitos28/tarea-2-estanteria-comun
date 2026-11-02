# Depuración y rendimiento — Parte A

Este documento registra un error real encontrado durante el desarrollo del buscador, cómo se localizó con las herramientas del desarrollador, el análisis del panel de red y la optimización aplicada con su medición.

Las capturas están en [`capturas/`](capturas/).

## 1. Error real: el género del formulario nunca era válido

### Síntoma

Con todos los campos del formulario de propuesta completos, el envío se rechazaba con la alerta "Revise el formulario". El campo **Género** quedaba en rojo con el mensaje:

> El género debe tener al menos undefined caracteres (tiene 8).

La palabra `undefined` en el mensaje indicaba que algún valor se estaba leyendo de una propiedad que no existe en ese elemento.

![Mensaje de error en el campo Género](capturas/01-error-genero.png)

### Localización con puntos de interrupción

1. En **Sources**, se abrió `js/formulario.js` y se colocó un punto de interrupción en la primera línea de `reglaLongitudMinima()`, la función que arma el mensaje "debe tener al menos … caracteres".
2. Para no detenerse en cada campo, se convirtió en **punto de interrupción condicional** con la condición `campo.name === 'genero'`.
3. Al enviar el formulario, la ejecución se detuvo con `campo` apuntando al `<select id="genero">`. En el panel **Scope** se observó:
   - `campo.tagName`: `"SELECT"`
   - `minLength`: `undefined`
   - `value`: `"Fantasía"`

![Ejecución detenida en reglaLongitudMinima con minLength undefined](capturas/02-breakpoint-minlength.png)

4. Con **Step over** se avanzó sobre la condición de salida, que en ese momento era:

   ```js
   if (minLength <= 0 || value === '' || value.length >= minLength) return '';
   ```

   En la consola, con la ejecución detenida, se evaluó cada parte:

   ```js
   minLength <= 0            // false
   value.length >= minLength // false
   ```

   Las dos comparaciones con `undefined` dan `false`, así que la función no salía y continuaba hasta devolver el mensaje de error.

![Evaluación de las comparaciones en la consola](capturas/03-consola-comparaciones.png)

### Causa

`minLength` es una propiedad de `<input>` y `<textarea>`, pero **no existe en `<select>`**. La regla se escribió pensando solo en campos de texto y suponía que `minLength` siempre era un número. Cualquier comparación numérica con `undefined` devuelve `false`, de modo que la condición de salida nunca se cumplía para el `<select>`.

### Corrección

La condición se reescribió para que solo continúe cuando `minLength` es un número positivo:

```js
// Los <select> no tienen minLength (es undefined), así que la regla no aplica.
if (!(minLength > 0) || value === '' || value.length >= minLength) return '';
```

`undefined > 0` es `false`, así que `!(undefined > 0)` es `true` y la función sale de inmediato para el `<select>`. Al repetir el envío con el punto de interrupción, la función retornó `''` en esa línea y la propuesta se registró correctamente.

### Otros errores encontrados en el desarrollo

- **Botones dentro de `form.elements`.** La primera versión validaba todo `form.elements`, que también incluye los `<button>` (tienen `willValidate === true`). Como los botones no tienen un `.invalid-feedback` al lado, `validarCampo()` lanzaba `TypeError: Cannot set properties of null`. Se resolvió filtrando con `esCampo()`, que solo acepta `INPUT`, `SELECT` y `TEXTAREA`.
- **`transitionend` que no llega.** Al quitar un libro de la lista, la fila se retira del DOM al terminar su transición. Con la pestaña en segundo plano, el navegador no dispara `transitionend` y la fila quedaba en el DOM. [`animaciones.js`](../buscador-js/js/animaciones.js) agrega un temporizador de respaldo con la duración de la transición.

## 2. Análisis del panel de red

Medición en **Network**, con **Disable cache** activado y recargando la página completa (búsqueda sin ejecutar).

![Panel de red al cargar la página](capturas/04-red-carga.png)

| Recurso | Tipo | Tamaño |
|---|---|---|
| `index.html` | document | _completar_ |
| `css/main.css` | stylesheet | _completar_ |
| `bootstrap.min.js` | script | _completar_ |
| `js/*.js` (9 módulos) | script | _completar_ |
| Fuentes Inter y Fraunces | font | _completar_ |
| `data/lecturas-iniciales.json` | fetch | _completar_ |
| Portadas de las lecturas iniciales | jpeg | _completar_ |
| **Total** | **_n_ peticiones** | **_completar_ transferidos / _completar_ recursos** |

Observaciones:

- Los módulos ES se piden en cascada: el navegador descarga `main.js`, lee sus `import` y luego pide los demás. Son archivos pequeños y el servidor local responde rápido, así que el efecto es menor; en producción convendría empaquetarlos.
- Las portadas vienen de `covers.openlibrary.org` y son el recurso más pesado después del CSS. Se cargan con `loading="lazy"`, así que las de los resultados no visibles solo se piden al desplazarse.
- Una búsqueda agrega una petición a `openlibrary.org/search.json` más una por cada portada visible.

![Panel de red después de una búsqueda](capturas/05-red-busqueda.png)

## 3. Optimización aplicada

### Qué se cambió

1. **Importar solo los parciales necesarios de Bootstrap.** En lugar de `@import "bootstrap/scss/bootstrap"`, [`_bootstrap.scss`](../buscador-js/scss/_bootstrap.scss) importa la configuración, la base, la grilla, las utilidades y únicamente los componentes que usa la interfaz (tablas, formularios, botones, navegación, navbar, tarjetas, insignias, alertas, botón de cierre, modal y spinners). Se omitieron dropdown, button-group, accordion, breadcrumb, pagination, progress, list-group, toasts, tooltip, popover, carousel, offcanvas y placeholders.
2. **CSS comprimido.** El script `build:css` compila con `--style=compressed`.
3. **JavaScript de Bootstrap sin Popper.** Se cambió `bootstrap.bundle.min.js` por `bootstrap.min.js`. Popper solo lo necesitan dropdowns, tooltips y popovers, que la interfaz no usa; el modal, el menú colapsable y el cierre de alertas funcionan igual.

Se verificó que todas las clases usadas en el HTML y en el JavaScript siguen presentes en el CSS generado.

### Medición

Tamaños de los archivos servidos, sin compresión y con gzip:

| Recurso | Antes | Después | Antes (gzip) | Después (gzip) |
|---|---|---|---|---|
| CSS (`main.css`) | 273,4 KB | 171,8 KB (−37 %) | 33,3 KB | 24,5 KB (−26 %) |
| JS de Bootstrap | 78,6 KB | 59,1 KB (−25 %) | 23,2 KB | 16,1 KB (−30 %) |
| **Total** | **352,0 KB** | **230,9 KB (−34 %)** | **56,5 KB** | **40,7 KB (−28 %)** |

![Panel de red antes de la optimización](capturas/06-red-antes.png)

![Panel de red después de la optimización](capturas/07-red-despues.png)

La medición compara los mismos dos recursos. Las fuentes tipográficas se agregaron después de esta optimización y no forman parte de la comparación.
