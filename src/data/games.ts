export interface Game {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  category: 'Strategy' | 'Puzzle' | 'Arcade';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  players: string;
}

export const GAMES: Game[] = [
  {
    id: 'hex-conquest',
    title: 'Hex Conquest',
    description: 'A turn-based strategy game where you capture territory on a hexagonal grid.',
    thumbnail: 'https://picsum.photos/seed/hex/400/300',
    category: 'Strategy',
    difficulty: 'Medium',
    players: '1 Player'
  },
  {
    id: 'tower-defense-lite',
    title: 'Tower Defense Lite',
    description: 'Defend your base against waves of enemies in this minimalist tower defense.',
    thumbnail: 'https://picsum.photos/seed/tower/400/300',
    category: 'Strategy',
    difficulty: 'Hard',
    players: '1 Player'
  },
  {
    id: 'grid-wars',
    title: 'Grid Wars',
    description: 'Tactical grid combat. Outmaneuver your opponent in this chess-like game.',
    thumbnail: 'https://picsum.photos/seed/grid/400/300',
    category: 'Strategy',
    difficulty: 'Medium',
    players: '2 Players (Local)'
  }
];
