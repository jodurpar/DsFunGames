# Bomb Disposal Delivery Notes

## Estado

El juego `Bomb Disposal` queda integrado en la web como quinto título del catálogo con ruta propia, miniatura, traducciones y carga lazy desde el reproductor de juegos.

## Reglas implementadas

- Dificultad seleccionable de `1` a `8`.
- Cada dificultad genera el mismo número de bombas simultáneas que su valor.
- Cada bomba crea un número variable de cables.
- Cada bomba contiene exactamente:
  - un cable seguro
  - un cable explosivo
  - varios cables neutros
- Al cortar un cable:
  - el cable desaparece
  - si es seguro, la bomba queda desactivada y suma un punto al jugador
  - si es explosivo, la bomba explota y suma un punto a la máquina
  - si es neutro, no cambia el estado de la bomba
- Cada tanda arranca con un cronómetro de `20 * dificultad` segundos.
- Si el tiempo termina, todas las bombas activas de la tanda explotan.
- La partida termina cuando:
  - alguien alcanza el objetivo `dificultad + 1`
  - o el rival ya no puede ganar ni empatar con las tandas restantes

## Ajustes visuales cerrados

- Rejilla sin scroll:
  - dificultades `1` a `4`: una fila horizontal
  - dificultades `5` a `8`: dos filas horizontales
- Reducción progresiva del tamaño de las bombas en dificultades altas.
- Eliminación de textos redundantes dentro del tablero para compactar la vista.
- Overlay de fin de tanda con:
  - bombas desactivadas
  - bombas explotadas
  - cuenta atrás de 5 segundos
  - mensaje específico `Tiempo expirado` cuando la tanda termina por reloj

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

## Verificación

- `npm test -- src/games/BombDisposal.test.tsx src/games/bomb-disposal/logic.test.ts`
- `npm run build`
