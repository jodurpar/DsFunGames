import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import { GAMES } from '../data/games';
import HexConquest from '../games/HexConquest';
import GridWars from '../games/GridWars';
import TowerDefenseLite from '../games/TowerDefenseLite';

export default function GamePlayer() {
  const { gameId } = useParams();
  const game = GAMES.find(g => g.id === gameId);

  if (!game) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
        <AlertTriangle className="w-16 h-16 text-yellow-500" />
        <h2 className="text-2xl font-bold">Game Not Found</h2>
        <Link to="/" className="text-game-accent hover:underline">Return to Library</Link>
      </div>
    );
  }

  const renderGame = () => {
    switch (gameId) {
      case 'hex-conquest':
        return <HexConquest />;
      case 'grid-wars':
        return <GridWars />;
      case 'tower-defense-lite':
        return <TowerDefenseLite />;
      default:
        return (
          <div className="flex flex-col items-center justify-center h-96 bg-game-card rounded-2xl border border-white/5 border-dashed">
            <p className="text-game-muted">This game is currently under development.</p>
            <p className="text-sm text-game-muted mt-2">Try "Hex Conquest" or "Grid Wars" instead!</p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-8">
        <Link
          to="/"
          className="p-2 rounded-lg hover:bg-white/5 text-game-muted hover:text-white transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">{game.title}</h1>
          <div className="flex items-center gap-2 text-sm text-game-muted">
            <span>{game.category}</span>
            <span>•</span>
            <span>{game.difficulty}</span>
          </div>
        </div>
      </div>

      <div className="game-container min-h-[500px]">
        {renderGame()}
      </div>
    </div>
  );
}
