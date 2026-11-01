// Animaciones de la interfaz. Las transiciones están definidas en CSS;
// aquí solo se agregan o quitan clases y se espera a que terminen.

// Duración total de la transición más larga del elemento, en milisegundos.
function duracionTransicion(elemento) {
  const { transitionDuration, transitionDelay } = getComputedStyle(elemento);
  const duraciones = transitionDuration.split(',').map(parseFloat);
  const retrasos = transitionDelay.split(',').map(parseFloat);
  return Math.max(...duraciones.map((duracion, i) => (duracion + (retrasos[i] ?? 0)) * 1000));
}

// Aplica la clase de entrada a un elemento recién insertado y la quita enseguida,
// para que el navegador anime desde el estado inicial hasta el final.
export function animarEntrada(elemento, clase) {
  elemento.classList.add(clase);
  void elemento.offsetWidth; // fuerza el recálculo para que el estado inicial se aplique
  elemento.classList.remove(clase);
}

// Vuelve a disparar una animación aunque ya se haya ejecutado antes.
export function animarCambio(elemento, clase) {
  elemento.classList.remove(clase);
  void elemento.offsetWidth; // fuerza el recálculo de estilos para reiniciar la animación
  elemento.classList.add(clase);

  elemento.addEventListener('animationend', () => elemento.classList.remove(clase), { once: true });
}

// Aplica la clase de salida y retira el elemento del DOM cuando termina la transición.
// Devuelve una promesa que se cumple cuando el elemento ya no está en el DOM.
export function animarSalida(elemento, clase) {
  elemento.classList.add(clase);

  const duracion = duracionTransicion(elemento);
  if (duracion === 0) {
    elemento.remove();
    return Promise.resolve();
  }

  return new Promise((resolver) => {
    let respaldo = null;

    function retirar() {
      clearTimeout(respaldo);
      elemento.removeEventListener('transitionend', alTerminar);
      elemento.remove();
      resolver();
    }

    function alTerminar(evento) {
      // Ignora transiciones de elementos hijos y de otras propiedades.
      if (evento.target === elemento && evento.propertyName === 'opacity') retirar();
    }

    elemento.addEventListener('transitionend', alTerminar);

    // Respaldo: si transitionend no llega (pestaña en segundo plano), se retira igual.
    respaldo = setTimeout(retirar, duracion + 100);
  });
}
