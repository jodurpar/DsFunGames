# Bomb Disposal Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build and integrate a new bomb-disposal game for DsFunGames with difficulty scaling, simultaneous bombs, countdown rounds, score tracking, and early-match termination.

**Architecture:** The feature will follow the existing repo pattern: a pure game-logic module for deterministic rules and Vitest coverage, plus a React game component for presentation, interaction, animation, and responsive layout. Integration will be handled through the shared game catalog, lazy game loader, translations, and a new thumbnail asset so the game behaves like the existing four titles.

**Tech Stack:** React 19, TypeScript, Vite, Vitest, react-router-dom, react-i18next, motion, lucide-react

---

### Task 1: Scaffold the Game Logic Contract

**Files:**
- Create: `src/games/bomb-disposal/logic.ts`
- Create: `src/games/bomb-disposal/logic.test.ts`

**Step 1: Write the failing test**

Add a first test suite in `src/games/bomb-disposal/logic.test.ts` that defines the base API:

```ts
import { describe, expect, it } from 'vitest';
import { BombDisposalLogic } from './logic';

describe('BombDisposalLogic', () => {
  it('creates a round with one bomb and a 20-second timer at difficulty 1', () => {
    const round = BombDisposalLogic.createRound({
      difficulty: 1,
      roundIndex: 0,
      playerScore: 0,
      machineScore: 0,
    });

    expect(round.bombs).toHaveLength(1);
    expect(round.timeRemainingMs).toBe(20_000);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- src/games/bomb-disposal/logic.test.ts`

Expected: FAIL because `./logic` or `BombDisposalLogic.createRound` does not exist yet.

**Step 3: Write minimal implementation**

Create `src/games/bomb-disposal/logic.ts` with the minimal exported types and `createRound` implementation needed for the first test to pass. Keep the model intentionally small:

```ts
export interface CreateRoundInput {
  difficulty: number;
  roundIndex: number;
  playerScore: number;
  machineScore: number;
}

export interface BombWire {
  id: string;
  color: string;
  role: 'safe' | 'explode' | 'neutral';
}

export interface BombState {
  id: string;
  status: 'active' | 'disarmed' | 'exploded';
  wires: BombWire[];
}

export interface RoundState {
  bombs: BombState[];
  timeRemainingMs: number;
}

export const BombDisposalLogic = {
  createRound(input: CreateRoundInput): RoundState {
    return {
      bombs: [
        {
          id: `bomb-${input.roundIndex}-0`,
          status: 'active',
          wires: [],
        },
      ],
      timeRemainingMs: input.difficulty * 20_000,
    };
  },
};
```

**Step 4: Run test to verify it passes**

Run: `npm test -- src/games/bomb-disposal/logic.test.ts`

Expected: PASS

**Step 5: Commit**

```bash
git add src/games/bomb-disposal/logic.ts src/games/bomb-disposal/logic.test.ts
git commit -m "test: scaffold bomb disposal logic contract"
```

### Task 2: Define Bomb Generation Rules

**Files:**
- Modify: `src/games/bomb-disposal/logic.ts`
- Modify: `src/games/bomb-disposal/logic.test.ts`

**Step 1: Write the failing test**

Extend `src/games/bomb-disposal/logic.test.ts` with tests for bomb count, wire count, and role distribution:

```ts
it('creates as many simultaneous bombs as the selected difficulty', () => {
  const round = BombDisposalLogic.createRound({
    difficulty: 3,
    roundIndex: 0,
    playerScore: 0,
    machineScore: 0,
  });

  expect(round.bombs).toHaveLength(3);
});

it('creates each bomb with exactly one safe wire and one explode wire', () => {
  const round = BombDisposalLogic.createRound({
    difficulty: 2,
    roundIndex: 0,
    playerScore: 0,
    machineScore: 0,
  });

  for (const bomb of round.bombs) {
    const safe = bomb.wires.filter(wire => wire.role === 'safe');
    const explode = bomb.wires.filter(wire => wire.role === 'explode');
    const neutral = bomb.wires.filter(wire => wire.role === 'neutral');

    expect(safe).toHaveLength(1);
    expect(explode).toHaveLength(1);
    expect(neutral.length).toBeGreaterThanOrEqual(0);
    expect(bomb.wires.length).toBeGreaterThanOrEqual(3);
  }
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- src/games/bomb-disposal/logic.test.ts`

Expected: FAIL because bombs still have empty wire lists and fixed length.

**Step 3: Write minimal implementation**

Update `src/games/bomb-disposal/logic.ts` to:

- Clamp difficulty to `1..9`.
- Generate `difficulty` bombs per round.
- Generate a variable wire count per bomb.
- Guarantee unique wire IDs per bomb.
- Guarantee exactly one `'safe'`, one `'explode'`, and the remaining `'neutral'`.
- Use a fixed local color palette and slice it to the generated wire count.

Keep the randomness encapsulated in small helpers so it can be replaced later if tests need deterministic injection.

**Step 4: Run test to verify it passes**

Run: `npm test -- src/games/bomb-disposal/logic.test.ts`

Expected: PASS

**Step 5: Commit**

```bash
git add src/games/bomb-disposal/logic.ts src/games/bomb-disposal/logic.test.ts
git commit -m "feat: generate bombs and wires by difficulty"
```

### Task 3: Add Wire-Cut Resolution and Scoring

**Files:**
- Modify: `src/games/bomb-disposal/logic.ts`
- Modify: `src/games/bomb-disposal/logic.test.ts`

**Step 1: Write the failing test**

Add tests for safe, explode, and neutral wire behavior:

```ts
it('awards a point to the player when cutting the safe wire', () => {
  const round = BombDisposalLogic.createRound({
    difficulty: 1,
    roundIndex: 0,
    playerScore: 0,
    machineScore: 0,
  });

  const bomb = round.bombs[0];
  const safeWire = bomb.wires.find(wire => wire.role === 'safe');

  expect(safeWire).toBeDefined();

  const result = BombDisposalLogic.cutWire(round, bomb.id, safeWire!.id);

  expect(result.playerScoreDelta).toBe(1);
  expect(result.machineScoreDelta).toBe(0);
  expect(result.round.bombs[0].status).toBe('disarmed');
});

it('awards a point to the machine when cutting the explode wire', () => {
  const round = BombDisposalLogic.createRound({
    difficulty: 1,
    roundIndex: 0,
    playerScore: 0,
    machineScore: 0,
  });

  const bomb = round.bombs[0];
  const explodeWire = bomb.wires.find(wire => wire.role === 'explode');

  const result = BombDisposalLogic.cutWire(round, bomb.id, explodeWire!.id);

  expect(result.playerScoreDelta).toBe(0);
  expect(result.machineScoreDelta).toBe(1);
  expect(result.round.bombs[0].status).toBe('exploded');
});

it('does nothing when cutting a neutral wire', () => {
  const round = BombDisposalLogic.createRound({
    difficulty: 3,
    roundIndex: 0,
    playerScore: 0,
    machineScore: 0,
  });

  const bomb = round.bombs.find(candidate =>
    candidate.wires.some(wire => wire.role === 'neutral')
  );

  const neutralWire = bomb!.wires.find(wire => wire.role === 'neutral');
  const result = BombDisposalLogic.cutWire(round, bomb!.id, neutralWire!.id);

  expect(result.playerScoreDelta).toBe(0);
  expect(result.machineScoreDelta).toBe(0);
  expect(result.round.bombs.find(candidate => candidate.id === bomb!.id)?.status).toBe('active');
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- src/games/bomb-disposal/logic.test.ts`

Expected: FAIL because `cutWire` does not exist yet.

**Step 3: Write minimal implementation**

Add `cutWire` to `src/games/bomb-disposal/logic.ts`:

- Ignore cuts on already resolved bombs.
- Resolve `'safe'` to `disarmed` and return `{ playerScoreDelta: 1, machineScoreDelta: 0 }`.
- Resolve `'explode'` to `exploded` and return `{ playerScoreDelta: 0, machineScoreDelta: 1 }`.
- Leave `'neutral'` cuts without score or status changes.
- Return the updated round object plus the delta so the React component can update HUD state cleanly.

**Step 4: Run test to verify it passes**

Run: `npm test -- src/games/bomb-disposal/logic.test.ts`

Expected: PASS

**Step 5: Commit**

```bash
git add src/games/bomb-disposal/logic.ts src/games/bomb-disposal/logic.test.ts
git commit -m "feat: resolve wire cuts and score outcomes"
```

### Task 4: Add Timeout Resolution and Round Completion Rules

**Files:**
- Modify: `src/games/bomb-disposal/logic.ts`
- Modify: `src/games/bomb-disposal/logic.test.ts`

**Step 1: Write the failing test**

Add tests for end-of-timer behavior and resolved-round detection:

```ts
it('explodes all active bombs when the timer runs out', () => {
  const round = BombDisposalLogic.createRound({
    difficulty: 2,
    roundIndex: 0,
    playerScore: 0,
    machineScore: 0,
  });

  const result = BombDisposalLogic.expireRound(round);

  expect(result.machineScoreDelta).toBe(2);
  expect(result.round.bombs.every(bomb => bomb.status === 'exploded')).toBe(true);
});

it('detects when all bombs in the round are resolved', () => {
  let round = BombDisposalLogic.createRound({
    difficulty: 1,
    roundIndex: 0,
    playerScore: 0,
    machineScore: 0,
  });

  const bomb = round.bombs[0];
  const safeWire = bomb.wires.find(wire => wire.role === 'safe')!;
  const cut = BombDisposalLogic.cutWire(round, bomb.id, safeWire.id);
  round = cut.round;

  expect(BombDisposalLogic.isRoundResolved(round)).toBe(true);
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- src/games/bomb-disposal/logic.test.ts`

Expected: FAIL because `expireRound` and `isRoundResolved` do not exist yet.

**Step 3: Write minimal implementation**

Add helpers to `src/games/bomb-disposal/logic.ts`:

- `expireRound(round)` marks only active bombs as exploded and returns the machine score delta equal to the number of newly exploded bombs.
- `isRoundResolved(round)` returns `true` when no bombs remain active.

Keep score deltas idempotent so repeated expiration calls do not award duplicate machine points.

**Step 4: Run test to verify it passes**

Run: `npm test -- src/games/bomb-disposal/logic.test.ts`

Expected: PASS

**Step 5: Commit**

```bash
git add src/games/bomb-disposal/logic.ts src/games/bomb-disposal/logic.test.ts
git commit -m "feat: add timeout and round resolution rules"
```

### Task 5: Add Match Progression and Early-Termination Logic

**Files:**
- Modify: `src/games/bomb-disposal/logic.ts`
- Modify: `src/games/bomb-disposal/logic.test.ts`

**Step 1: Write the failing test**

Add tests for win target and mathematical elimination:

```ts
it('finishes the match when the player reaches the target score', () => {
  expect(
    BombDisposalLogic.getMatchStatus({
      difficulty: 2,
      playerScore: 3,
      machineScore: 0,
      roundsPlayed: 1,
    }).state
  ).toBe('player-won');
});

it('finishes the match when the machine reaches the target score', () => {
  expect(
    BombDisposalLogic.getMatchStatus({
      difficulty: 3,
      playerScore: 0,
      machineScore: 4,
      roundsPlayed: 2,
    }).state
  ).toBe('machine-won');
});

it('finishes the match early when the trailing side cannot win or tie with the rounds left', () => {
  const status = BombDisposalLogic.getMatchStatus({
    difficulty: 5,
    playerScore: 4,
    machineScore: 1,
    roundsPlayed: 4,
  });

  expect(status.state).toBe('player-won');
  expect(status.reason).toBe('mathematical-elimination');
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- src/games/bomb-disposal/logic.test.ts`

Expected: FAIL because `getMatchStatus` does not exist yet.

**Step 3: Write minimal implementation**

Add `getMatchStatus` and supporting helpers to `src/games/bomb-disposal/logic.ts`:

- The match target is `difficulty + 1`.
- The maximum number of rounds in a match is also `difficulty + 1`.
- `roundsRemaining = maxRounds - roundsPlayed`.
- If either side reaches target, declare the winner immediately.
- Otherwise, if the trailing side cannot equal or exceed the leader even by winning every remaining round, declare the leader the winner with reason `'mathematical-elimination'`.
- Otherwise return an in-progress state.

Document the assumption that each round contributes at most one point swing per side because each visible bomb can only resolve once.

**Step 4: Run test to verify it passes**

Run: `npm test -- src/games/bomb-disposal/logic.test.ts`

Expected: PASS

**Step 5: Commit**

```bash
git add src/games/bomb-disposal/logic.ts src/games/bomb-disposal/logic.test.ts
git commit -m "feat: add bomb disposal match progression rules"
```

### Task 6: Build the React Game Shell

**Files:**
- Create: `src/games/BombDisposal.tsx`
- Modify: `src/games/bomb-disposal/logic.ts`
- Test: `src/games/bomb-disposal/logic.test.ts`

**Step 1: Write the failing test**

Because the existing repo does not yet show component tests for full game screens, keep TDD focused on logic and define a single rendering contract:

```ts
// Optional if adding a component test is practical in this repo:
// src/games/BombDisposal.test.tsx
it('shows the starting difficulty, timer, and scores', () => {
  // render(<BombDisposal />);
  // expect(screen.getByText(/difficulty/i)).toBeInTheDocument();
});
```

If this test setup becomes noisy, keep Task 6 implementation driven by the already-covered logic module and verify through manual browser testing plus a full `npm test` run.

**Step 2: Run test to verify it fails**

Run: `npm test -- src/games/BombDisposal.test.tsx`

Expected: FAIL if you add the component test. If you skip this optional test, do not claim TDD coverage for the UI layer.

**Step 3: Write minimal implementation**

Create `src/games/BombDisposal.tsx` with:

- Local React state for:
  - selected difficulty
  - current scores
  - current round index
  - current round state from `BombDisposalLogic.createRound`
  - match status
  - remaining milliseconds
- A `useEffect` timer that counts down and calls `expireRound` on zero.
- A responsive grid of bomb cards.
- SVG or div-based wires anchored to the top of each bomb card.
- Pointer styling that switches to a scissors cursor on wire hover.
- Cut handling that calls `BombDisposalLogic.cutWire`.
- Automatic transition to the next round when `isRoundResolved` becomes true and the match is still in progress.
- A restart control and a difficulty selector that resets the match.

Use the same visual language already established by `GridWars`, `LogicRobot`, and `TowerDefenseLite`: `glass-card`, rounded containers, compact tactical HUD, and premium button styling.

**Step 4: Run test to verify it passes**

Run one of:

- `npm test -- src/games/BombDisposal.test.tsx`
- `npm test -- src/games/bomb-disposal/logic.test.ts`

Expected: PASS

Then do a manual browser verification with:

Run: `npm run dev`

Expected manual checks:

- Difficulty 1 shows 1 bomb.
- Difficulty 3 shows 3 bombs.
- Timer starts at `20 * difficulty` seconds.
- Safe wire disarms and scores for player.
- Explode wire and timeout score for machine.
- Neutral wire has no effect.
- Match ends on target score or mathematical elimination.

**Step 5: Commit**

```bash
git add src/games/BombDisposal.tsx src/games/bomb-disposal/logic.ts src/games/bomb-disposal/logic.test.ts
git commit -m "feat: add bomb disposal game screen"
```

### Task 7: Integrate the Game into Navigation and Catalog

**Files:**
- Modify: `src/data/games.ts`
- Modify: `src/pages/GamePlayer.tsx`
- Modify: `src/pages/Home.tsx` (only if layout tuning is needed for 5 cards)

**Step 1: Write the failing test**

Prefer a narrow integration test only if the repo already has stable page tests. If not, treat this as a compile-time and manual integration task and rely on `npm test` plus `npm run build` to catch missing imports and broken types.

**Step 2: Run test to verify it fails**

Run: `npm run build`

Expected: currently PASS before integration, so there is no meaningful RED stage here unless you add a page test. Note that this task is an integration task with type/build verification rather than logic TDD.

**Step 3: Write minimal implementation**

Update:

- `src/data/games.ts` to add the new game metadata.
- `src/pages/GamePlayer.tsx` to lazy-load `BombDisposal` and render it for the new route ID.
- `src/pages/Home.tsx` only if card spacing or column behavior needs tuning for a fifth item.

Choose a stable ID such as `bomb-disposal`, with category and difficulty labels consistent with the catalog.

**Step 4: Run test to verify it passes**

Run:

- `npm test`
- `npm run build`

Expected: PASS

**Step 5: Commit**

```bash
git add src/data/games.ts src/pages/GamePlayer.tsx src/pages/Home.tsx
git commit -m "feat: integrate bomb disposal into the game catalog"
```

### Task 8: Add Translations and Thumbnail Asset

**Files:**
- Modify: `src/i18n/locales/es.json`
- Modify: `src/i18n/locales/en.json`
- Create: `public/thumbnails/bomb-disposal.png`

**Step 1: Write the failing test**

Add a narrow safety check to ensure translation keys exist if you want automated coverage, or use build/manual verification if translation tests are not established in the repo.

**Step 2: Run test to verify it fails**

Run: `npm run build`

Expected: may still PASS until the component uses missing keys. This task is better verified through rendering and i18n inspection.

**Step 3: Write minimal implementation**

Add the translation keys required by the component:

- title
- description
- instructions
- score labels
- timer labels
- difficulty labels
- victory and defeat copy
- wire interaction feedback

Create `public/thumbnails/bomb-disposal.png` in the same visual family as the existing game thumbnails.

**Step 4: Run test to verify it passes**

Run:

- `npm test`
- `npm run build`

Expected: PASS

Manual checks:

- Home card title and description translate correctly.
- Game header uses translated title.
- In-game labels switch language correctly.

**Step 5: Commit**

```bash
git add src/i18n/locales/es.json src/i18n/locales/en.json public/thumbnails/bomb-disposal.png
git commit -m "feat: add bomb disposal translations and thumbnail"
```

### Task 9: Final Verification and Polish

**Files:**
- Review: `src/games/BombDisposal.tsx`
- Review: `src/games/bomb-disposal/logic.ts`
- Review: `src/data/games.ts`
- Review: `src/pages/GamePlayer.tsx`
- Review: `src/i18n/locales/es.json`
- Review: `src/i18n/locales/en.json`

**Step 1: Write the failing test**

No new tests here. This is verification and small refactor only after all tests are green.

**Step 2: Run test to verify current state**

Run:

- `npm test`
- `npm run build`

Expected: PASS before any polish changes.

**Step 3: Write minimal implementation**

Only refactor or polish if everything is already passing:

- tighten names
- remove duplication
- improve aria labels on wire buttons
- ensure resolved bombs cannot be re-triggered
- ensure timer cleanup does not leak intervals
- verify mobile spacing and overflow handling

Do not change rules in this task.

**Step 4: Run test to verify it passes**

Run:

- `npm test`
- `npm run build`

Expected: PASS

**Step 5: Commit**

```bash
git add src/games/BombDisposal.tsx src/games/bomb-disposal/logic.ts src/games/bomb-disposal/logic.test.ts src/data/games.ts src/pages/GamePlayer.tsx src/i18n/locales/es.json src/i18n/locales/en.json public/thumbnails/bomb-disposal.png
git commit -m "feat: finalize bomb disposal game"
```

## Notes for Execution

- Keep randomness isolated in helpers so tests can remain stable.
- Avoid overengineering a reusable mini-engine for multiple games.
- If the UI needs heavier interaction tests, add them only after the logic contract is stable.
- Preserve the existing visual system instead of inventing a separate style.
- If manual verification exposes a rules issue, reproduce it with a failing logic test before fixing it.
