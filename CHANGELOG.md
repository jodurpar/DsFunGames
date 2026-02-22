# Changelog

All notable changes to this project will be documented in this file.

## [1.0.9] - 2026-02-22

### Fixed
- **Grid Wars (Tactical Memory)**: Resolved a critical infinite loop bug where the movement counter would increment continuously after the first move due to incorrect `useEffect` dependencies.

## [1.0.8] - 2026-02-22

### Added
- **SEO Optimization**: Implemented dynamic metadata management with a custom `useSEO` hook.
- **SEO Infrastructure**: Added `sitemap.xml` and `robots.txt` for better search engine indexing.
- **SEO Meta Tags**: Added Open Graph and Twitter Cards for rich social media sharing.
- **Testing**: Added logic-specific test suites for all refactored game engines.

### Changed
- **Architecture Refactor**: Successfully decoupled pure game logic from React hooks for `Logic Robot`, `Grid Wars` (Tactical Memory), and `Hex Conquest`.
- **Global State**: Integrated all refactored games with the global `useGameStore` (Zustand) for persistent statistics and high scores.
- **Performance**: Optimized game engines by moving heavy calculations to pure utility modules.
- **SEO**: Updated `index.html` with professional meta tags, keywords, and semantic titles.

## [Unreleased] - 2026-02-22

### Added
- **Documentation**: Added a direct link to the production test environment in the README.
- **Tower Defense Lite**: Added a 3D HTML Red Tower model to explicitly represent the destination base.
- **Tower Defense Lite**: Added an Emerald Glowing Portal to represent the enemy spawning origin point.
- **Resumen**: Appended recent changes to `resumen.2026-02-22.md`.
- **Internationalization (i18n)**: Implemented full multi-language support (English/Spanish) across all games and the main application using `i18next`.
- **LanguageSelector**: Added a premium language dropdown component in the header with persistent local storage.
- **OrientationGuard**: Implemented a new component to enforce landscape mode on mobile for complex games, featuring an automated "Tactical Mode" button.
- **Docker Infrastructure**: Created a multi-stage Dockerfile and docker-compose configuration for optimized production deployment.
- **Branding**: Updated official copyright to "DuranSoftware - Strategy Gaming Studio".

### Changed
- **Vite Configuration**: Added `host.docker.internal` to allowed hosts to support containerized development environments.
- **UI Architecture**: Refactored the `MainLayout` to have a persistent header and footer across all pages.
- **Dynamic Headers**: Optimized the main header to be large on the Home page and ultra-compact on game pages to maximize playable area.
- **Compact Footer**: Implemented a single-line minimalist footer for game views.
- **Mobile UX**: Drastically reduced the size of the game operation header (back button, title, labels) by ~50% in mobile views.
- **Tower Defense Lite**: Laser beams drastically thickened, slowed down visually, and re-styled with intensive neon box-shadows to ensure visibility.
- **Tower Defense Lite**: Tower projectiles are now correctly originating from the top emitter of the tower.
- **Logic Robot**: Restructured the path generation algorithm (`useRobotEngine.ts`) guaranteeing a fully connected path that correctly spawns a target flag.
- **Logic Robot**: Changed playing board colors; paths are now slate-gray and clearly defined with inner shadows, over a light emerald background, reducing visual strain.
- **Logic Robot**: Refactored the "Memory Buffer" layout into an adjustable, responsive CSS grid that linearly populates items in two rigid columns. 
- **Logic Robot**: Improved the `z-index` mapping and dimensions calculation to prevent 2x2 buildings and board edges from being clipped.
- **GamePlayer**: Localized all system messages, loading screens, and operation banners.
