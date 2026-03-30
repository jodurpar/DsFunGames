<p align="center">
  <img src="./public/logo.png" alt="FunGames Tactical Hub" width="200" />
</p>

# FunGames - Tactical Hub

FunGames is a premium suite of minimalist strategy and logic games designed for modern commanders. It combines fast decision making, light tactical systems, and a coherent visual style across all titles.

**Test Page**: [https://dsfungames.scifyclub.com/](https://dsfungames.scifyclub.com/)  
**Source Code**: [https://github.com/jodurpar/DsFunGames](https://github.com/jodurpar/DsFunGames)

## Experience

The current catalog includes five playable games:

- **Tower Defense Lite**: Establish defensive perimeters and stop incoming waves.
- **Logic Robot**: Program tactical units with direction tokens across an urban grid.
- **Grid Wars**: A chess-inspired tactical memory challenge.
- **Hex Conquest**: Capture territory on a hexagonal board against an adaptive AI.
- **Bomb Disposal**: Cut the correct wire before the timer expires, manage simultaneous bombs, and beat the machine by score.

## Bomb Disposal

`Bomb Disposal` is integrated as the fifth game in the catalog and includes:

- Selectable difficulty from `1` to `8`.
- Simultaneous bombs equal to the selected difficulty.
- Variable wire counts per bomb.
- One safe wire, one explosive wire, and neutral wires on every bomb.
- A round timer of `20 * difficulty` seconds.
- Scoring for player disarms and machine explosions.
- Early match end when a side reaches the target or the trailing side can no longer win or tie.
- Round summary overlay with disarmed count, exploded count, and timeout feedback.

## Tactical Features

- **Multi-language support (i18n)**: English and Spanish localization with persistent user preferences.
- **Adaptive UI**: Dynamic layouts that preserve play area across desktop and mobile.
- **Responsive game boards**: Each title adjusts its board density and controls to the active screen size.
- **Interactive simulation**: Real-time timers, board updates, animation feedback, and game-specific state systems.

## Technical Stack

- **Core**: React + TypeScript
- **Build**: Vite
- **Styling**: Tailwind CSS
- **Animations**: Motion
- **I18n**: i18next + react-i18next
- **Testing**: Vitest + React Testing Library
- **Deployment**: Docker multi-stage build

## Development

### Prerequisites

- Node.js (latest LTS recommended)
- Docker Desktop (for containerized deployment)

### Setup

```bash
npm install
npm run dev
```

### Quality Assurance

```bash
npm test
npm run build
```

### Docker Deployment

```bash
# Build and start the production container on port 15260
docker-compose up -d --build
```

## Pending Work

Current known follow-up items:

- Run a final visual pass on `Bomb Disposal` at difficulties `7` and `8` on shorter laptop heights to confirm there is no residual vertical overflow.
- Decide whether `Bomb Disposal` should receive one more style pass to match one specific existing game more closely instead of the current shared tactical look.
- Add broader end-to-end or navigation-level coverage if the project later needs regression protection beyond logic and component tests.
- Review the unrelated local modification in `docker-compose.yml` before the next release commit.

## Documentation

- `docs/plans/2026-03-30-bomb-disposal-design.md`
- `docs/plans/2026-03-30-bomb-disposal-implementation.md`
- `docs/plans/2026-03-30-bomb-disposal-delivery.md`
- `TechnicalConsiderations.md`

---
© 2026 DuranSoftware - Strategy Gaming Studio.
