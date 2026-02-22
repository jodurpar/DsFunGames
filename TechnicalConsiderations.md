# 📄 Technical Considerations

I have opted for an **SPA (Single Page Application)** architecture using **React + Vite** to guarantee optimal performance and a smooth user experience without the need for a complex backend, adhering to the **KISS** (*Keep It Simple, Stupid*) principle.

## 🛠️ Technology Stack

- **Core:** React 19, TypeScript, Vite.
- **Routing:** React Router v7 (client-side navigation management).
- **Styles:** Tailwind CSS v4 with a custom **"Tactical Light"** premium theme (clean whites, subtle glassmorphism, and deep slate/blue accents).
- **Animations:** Motion (framer-motion) for smooth transitions and visual feedback.
- **Iconography:** Lucide React.
- **Internationalization (i18n):** `i18next` and `react-i18next` for seamless language switching (EN/ES) with persistent storage.
- **Testing:** `vitest` and `@testing-library/react` for robust unit and integration testing.

## 🏗️ Project Structure

The application follows a modular and scalable architecture:

### 📱 Main Layout (`src/layouts/MainLayout.tsx`)
- Persistent header with navigation, branding, and language selector. Dynamic sizing based on the current context (home vs game).
- Informative footer, highly compacted during gameplay.
- Conditional rendering for maximum tactical area during combat missions.

### 🎮 Game Library (`src/pages/Home.tsx`)
- Responsive grid of game "cards" or "pills".
- Hover effects and entrance transitions.
- Visible metadata (Category, Difficulty).

### ⚙️ Game Engine (`src/games/`)
I have implemented several lightweight 2D strategy games using DOM manipulation and React state (no need for heavy Canvas or WebGL to maintain the requested simplicity):
- **Hex Conquest:** A turn-based strategy game where you compete against a basic AI to conquer territory on a hexagonal grid.
- **Grid Wars:** A "tactical memory" game where you must match military units to deploy them.
- **Tower Defense Lite:** Defensive strategy where you must place towers to stop waves of enemies. Inspired by classic mechanics but simplified for the web. Includes 3D HTML elements and advanced pathing logic.
- **Logic Robot:** A programming puzzle game where you use directional tokens to guide a robot through a cityscape.

### 🕹️ Player Component (`src/pages/GamePlayer.tsx`)
- Dynamic routing based on ID (`/play/:gameId`).
- Lazy loading injection system for game components.
- Integrated `OrientationGuard` to enforce landscape mode on mobile devices for complex tactical games.

## 🐳 Docker Architecture

The project is fully containerized for production deployment using a multi-stage build:
1. **Build Stage:** Uses `node:alpine` to meticulously compile the Vite/React application into static assets.
2. **Production Stage:** Uses `nginx:alpine` to serve the static files with a custom `nginx.conf` that handles SPA routing and asset caching optimizations.
- Handled via `docker-compose.yml` exposing port `15260`.

---

## 📖 Usage Instructions

1. The application is deployed and ready.
2. Navigate to the main page to view the library.
3. Click on **"Initiate Combat"** on any of the available games.
4. Play directly in the browser (the logic is 100% client-side).

> [!TIP]
> If you wish to add more games in the future, simply create a new component in `src/games/`, register it in `src/data/games.ts`, and add it to the `switch` statement in `src/pages/GamePlayer.tsx`.
