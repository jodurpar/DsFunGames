# Bomb Disposal Design

**Fecha:** 2026-03-30

## Objetivo

Anadir un quinto juego a DsFunGames con la misma estetica tactica y ligera del resto del sitio. El juego se basa en desactivar bombas cortando el cable correcto antes de que exploten.

## Resumen del juego

- El juego arranca en dificultad 1.
- La dificultad puede variar de 1 a 9.
- Cada dificultad define:
  - Bombas visibles simultaneamente: igual a la dificultad.
  - Objetivo de victoria: `dificultad + 1` puntos.
  - Tiempo por tanda: `20 * dificultad` segundos.
- Cada bomba contiene un numero variable de cables.
- El minimo de cables por bomba es `dificultad + 1`.
- Siempre hay exactamente:
  - 1 cable que desactiva la bomba.
  - 1 cable que hace explotar la bomba.
  - El resto de cables no tienen efecto.
- El jugador debe cortar con el puntero del raton, mostrado como tijera, el cable que desactiva la bomba.
- Si el temporizador de la tanda llega a cero, las bombas no resueltas explotan.

## Reglas de puntuacion

- Cada bomba desactivada suma 1 punto al jugador.
- Cada bomba explotada suma 1 punto a la maquina.
- La partida termina cuando:
  - uno de los dos alcanza el objetivo de puntos de la dificultad actual, o
  - por las tandas restantes ya no es posible que el rival gane ni empate.

### Ejemplo de cierre anticipado

Si un lado tiene una ventaja de 3 puntos y solo quedan 2 rondas por jugar, la partida termina porque el rival ya no puede ganar ni empatar.

## Estructura de ronda

- La partida se organiza en tandas.
- En cada tanda se muestran varias bombas a la vez.
- El numero de bombas visibles en la tanda es igual a la dificultad actual.
- Cada bomba tiene su propio estado:
  - activa
  - desactivada
  - explotada
- Mientras queden bombas activas y tiempo disponible, el jugador puede intentar cortar cables.
- Cuando todas las bombas de la tanda quedan resueltas, se genera la siguiente tanda.
- Si el tiempo termina antes, las bombas aun activas pasan al estado de explosion.

## Diseno de cables

- Cada bomba muestra sus cables conectados en la parte superior.
- Los cables deben tener colores claramente diferenciados.
- La cantidad de cables debe variar entre bombas para evitar que el patron se vuelva repetitivo.
- El rango concreto debe ser moderado y controlado para no romper la legibilidad.
- La distribucion de cable correcto, cable explosivo y cables neutros debe generarse de forma aleatoria.

## Propuesta de arquitectura

Se recomienda seguir el mismo patron general ya usado en el proyecto:

- Un componente React para la interfaz del juego.
- Un modulo de logica pura separado para las reglas.
- Integracion en el catalogo y en el player principal mediante lazy loading.

### Separacion propuesta

- `src/games/<nuevo-juego>.tsx`
  - Renderizado, animaciones, interaccion y HUD.
- `src/games/<nuevo-juego>/logic.ts`
  - Generacion de bombas, resolucion de cables, puntuacion, avance de tandas y fin de partida.
- `src/games/<nuevo-juego>/logic.test.ts`
  - Tests unitarios de reglas.

Este enfoque mantiene consistencia con la refactorizacion existente del proyecto y facilita validar reglas sin depender del DOM.

## Integracion en la aplicacion

La incorporacion del nuevo juego debe incluir:

- Alta en `src/data/games.ts`.
- Carga lazy en `src/pages/GamePlayer.tsx`.
- Traducciones en `src/i18n/locales/es.json`.
- Traducciones en `src/i18n/locales/en.json`.
- Nueva miniatura en `public/thumbnails/`.
- Presencia automatica en `Home` a traves del array `GAMES`.

## Diseno visual

El nuevo juego debe compartir el lenguaje visual de los otros cuatro:

- Tema claro.
- Tarjetas tipo glassmorphism.
- Acento principal indigo.
- Tipografia tactica y paneles de HUD compactos.
- Bordes redondeados grandes.
- Sensacion de interfaz premium y arcade tactico.

### Layout recomendado

- Panel de informacion con instrucciones cortas, dificultad, objetivo y marcador.
- Zona central con una rejilla responsiva de bombas.
- HUD superior o lateral con:
  - puntuacion del jugador
  - puntuacion de la maquina
  - cronometro restante
  - objetivo de victoria
  - dificultad actual

## Interaccion

- El puntero debe convertirse en tijera al pasar sobre los cables.
- Al cortar un cable:
  - si es el correcto, la bomba queda desactivada y deja de aceptar interaccion.
  - si es el explosivo, la bomba explota y deja de aceptar interaccion.
  - si es neutro, no ocurre nada y la bomba sigue activa.
- Cada bomba ya resuelta debe mostrar claramente su estado final.

## Feedback visual y animaciones

### Desactivacion

- Mensaje visible: `Desactivada!`
- Color principal: verde.
- Animacion breve, limpia y satisfactoria.
- La bomba puede pasar a un estado estable con luz verde o sello de segura.

### Explosion

- Mensaje visible: `! Boom !`
- Efecto de sacudida o flash calido.
- Estado final rojo o carbonizado para que la resolucion sea clara.

### Temporizador

- El cronometro debe presentarse como cuenta atras prominente.
- Al acercarse a cero debe aumentar la tension visual.
- Al finalizar, las bombas no resueltas explotan automaticamente.

## Comportamiento responsive

- En escritorio, las bombas pueden mostrarse en una rejilla amplia.
- En movil, la rejilla debe reorganizarse a menos columnas y tarjetas mas altas.
- La legibilidad de cables, temporizador y estados no debe depender solo del hover.

## Casos de prueba a cubrir

- Generacion valida de bombas segun dificultad.
- Existencia exacta de un cable de desactivacion y uno explosivo por bomba.
- Variacion del numero de cables dentro del rango esperado.
- Suma de puntos correcta para jugador y maquina.
- Explosion automatica por fin de tiempo.
- Transicion correcta entre tandas.
- Finalizacion al alcanzar objetivo.
- Finalizacion por cierre matematico cuando el rival ya no puede ganar ni empatar.

## Enfoque recomendado

La mejor opcion para este repo es un juego autocontenido con UI en React y reglas en un motor puro probado con Vitest. Es la alternativa que mejor encaja con la arquitectura actual, minimiza regresiones y permite mantener el mismo nivel de calidad visual y tecnica que los otros juegos.

## Pendiente para implementacion

Antes de programar conviene convertir este diseno en un plan de implementacion detallado con tareas pequenas, archivos exactos y secuencia TDD.
