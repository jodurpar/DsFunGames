# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased] - 2026-02-22

### Added
- **Tower Defense Lite**: Added a 3D HTML Red Tower model to explicitly represent the destination base.
- **Tower Defense Lite**: Added an Emerald Glowing Portal to represent the enemy spawning origin point.
- **Resumen**: Appended recent changes to `resumen.2026-02-22.md`.

### Changed
- **Tower Defense Lite**: Laser beams drastically thickened, slowed down visually, and re-styled with intensive neon box-shadows to ensure visibility.
- **Tower Defense Lite**: Tower projectiles are now correctly originating from the top emitter of the tower.
- **Logic Robot**: Restructured the path generation algorithm (`useRobotEngine.ts`) guaranteeing a fully connected path that correctly spawns a target flag.
- **Logic Robot**: Changed playing board colors; paths are now slate-gray and clearly defined with inner shadows, over a light emerald background, reducing visual strain.
- **Logic Robot**: Refactored the "Memory Buffer" layout into an adjustable, responsive CSS grid that linearly populates items in two rigid columns. 
- **Logic Robot**: Improved the `z-index` mapping and dimensions calculation to prevent 2x2 buildings and board edges from being clipped.
