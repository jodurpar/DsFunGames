# Bomb Disposal Delivery Notes

## Estado

El juego `Bomb Disposal` queda integrado en la web como quinto titulo del catalogo con ruta propia, miniatura, traducciones y carga lazy desde el reproductor de juegos.

## Reglas implementadas

- Dificultad seleccionable de `1` a `8`.
- Cada dificultad genera el mismo numero de bombas simultaneas que su valor.
- Cada bomba crea un numero variable de cables.
- Cada bomba contiene exactamente:
  - un cable seguro
  - un cable explosivo
  - varios cables neutros
- Al cortar un cable:
  - el cable desaparece
  - si es seguro, la bomba queda desactivada y suma un punto al jugador
  - si es explosivo, la bomba explota y suma un punto a la maquina
  - si es neutro, no cambia el estado de la bomba
- Cada tanda arranca con un cronometro de `20 * dificultad` segundos.
- Si el tiempo termina, todas las bombas activas de la tanda explotan.
- La partida termina cuando:
  - alguien alcanza el objetivo `dificultad + 1`
  - o el rival ya no puede ganar ni empatar con las tandas restantes

## Ajustes visuales cerrados

- Rejilla sin scroll:
  - dificultades `1` a `4`: una fila horizontal
  - dificultades `5` a `8`: dos filas horizontales
- Reduccion progresiva del tamano de las bombas en dificultades altas.
- Eliminacion de textos redundantes dentro del tablero para compactar la vista.
- Overlay de fin de tanda con:
  - bombas desactivadas
  - bombas explotadas
  - cuenta atras de 5 segundos
  - mensaje especifico `Tiempo expirado` cuando la tanda termina por reloj

## Pendientes conocidos

- Hacer una ultima validacion visual manual en navegador para confirmar que dificultades `7` y `8` no generan overflow vertical en pantallas con poca altura.
- Decidir si conviene una pasada adicional de estilo para acercarlo todavia mas a uno de los otros juegos existentes.
- Ampliar la cobertura con pruebas de navegacion o end-to-end si el proyecto empieza a necesitar regresion de flujo completo.
- Revisar el cambio local no relacionado en `docker-compose.yml` antes de la siguiente entrega.

## Archivos principales

- `src/games/BombDisposal.tsx`
- `src/games/bomb-disposal/logic.ts`
- `src/games/BombDisposal.test.tsx`
- `src/games/bomb-disposal/logic.test.ts`
- `src/data/games.ts`
- `src/pages/GamePlayer.tsx`
- `src/i18n/locales/es.json`
- `src/i18n/locales/en.json`
- `public/thumbnails/bomb-disposal.svg`

## Verificacion

- `npm test -- src/games/BombDisposal.test.tsx src/games/bomb-disposal/logic.test.ts`
- `npm run build`
