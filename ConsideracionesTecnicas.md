# 📄 Resumen Técnico

He optado por una arquitectura **SPA (Single Page Application)** utilizando **React + Vite** para garantizar un rendimiento óptimo y una experiencia de usuario fluida sin necesidad de backend complejo, cumpliendo con el principio **KISS** (*Keep It Simple, Stupid*).

## 🛠️ Stack Tecnológico

- **Core:** React 19, TypeScript, Vite.
- **Routing:** React Router v7 (gestión de navegación cliente).
- **Estilos:** Tailwind CSS v4 con un tema personalizado **"Dark Gaming"** (colores slate y blue profundos).
- **Animaciones:** Motion (framer-motion) para transiciones suaves y feedback visual.
- **Iconografía:** Lucide React.

## 🏗️ Estructura del Proyecto

La aplicación sigue una arquitectura modular y escalable:

### 📱 Layout Principal (`src/layouts/MainLayout.tsx`)
- Header persistente con navegación y branding.
- Footer informativo.
- Gestión del tema global.

### 🎮 Librería de Juegos (`src/pages/Home.tsx`)
- Grid responsive de "pastillas" (tarjetas) de juegos.
- Efectos de hover y transiciones de entrada.
- Metadatos visibles (Categoría, Dificultad).

### ⚙️ Motor de Juegos (`src/games/`)
He implementado tres juegos de estrategia ligeros en 2D utilizando manipulación del DOM y estado de React (sin necesidad de Canvas pesado o BabylonJS para mantener la simplicidad solicitada):
- **Hex Conquest:** Un juego de estrategia por turnos donde compites contra una IA básica para conquistar territorio en una cuadrícula.
- **Grid Wars:** Un juego de "memoria táctica" donde debes emparejar unidades militares para desplegarlas.
- **Tower Defense Lite:** Estrategia defensiva donde debes colocar torres para detener oleadas de enemigos. Inspirado en mecánicas clásicas pero simplificado para la web.

### 🕹️ Reproductor (`src/pages/GamePlayer.tsx`)
- Enrutamiento dinámico basado en ID (`/play/:gameId`).
- Sistema de inyección de componentes de juego bajo demanda.

---

## 📖 Instrucciones de Uso

1. La aplicación ya está desplegada y lista.
2. Navega a la página principal para ver la librería.
3. Haz clic en **"Play Now"** en cualquiera de los juegos disponibles.
4. Juega directamente en el navegador (la lógica es 100% cliente).

> [!TIP]
> Si deseas agregar más juegos en el futuro, simplemente crea un nuevo componente en `src/games/`, regístralo en `src/data/games.ts` y añádelo al `switch` en `src/pages/GamePlayer.tsx`.