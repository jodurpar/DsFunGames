import { useParams, Link } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { ArrowLeft, AlertTriangle, Loader2, Sparkles, LayoutGrid } from 'lucide-react';
import { GAMES } from '../data/games';

// Lazy loading game components
const HexConquest = lazy(() => import('../games/HexConquest'));
const GridWars = lazy(() => import('../games/GridWars'));
const TowerDefenseLite = lazy(() => import('../games/TowerDefenseLite'));
const LogicRobot = lazy(() => import('../games/LogicRobot'));

function GameLoading() {
  return (
    <div className="flex flex-col items-center justify-center p-12 sm:p-20 glass-card rounded-[3rem] animate-pulse">
      <div className="relative">
        <div className="absolute inset-0 bg-game-accent/20 blur-xl rounded-full" />
        <Loader2 className="relative w-12 h-12 text-game-accent animate-spin mb-6" />
      </div>
      <p className="text-game-text font-black uppercase tracking-widest text-sm">Synchronizing Systems...</p>
      <p className="text-game-muted text-xs mt-2">Preparing strategic environment</p>
    </div>
  );
}

export default function GamePlayer() {
  const { gameId } = useParams();
  const game = GAMES.find(g => g.id === gameId);

  if (!game) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="bg-yellow-50 p-6 rounded-[2.5rem] border border-yellow-100 mb-8">
          <AlertTriangle className="w-16 h-16 text-yellow-600" />
        </div>
        <h2 className="text-4xl font-black text-game-text mb-4 tracking-tight">Mission Not Found</h2>
        <p className="text-game-muted max-w-sm mb-8 leading-relaxed">
          The requested intelligence sector is currently inaccessible or under maintenance.
        </p>
        <Link
          to="/"
          className="premium-button flex items-center gap-3 bg-game-accent hover:bg-game-accent-light text-white px-8 py-4 rounded-2xl font-bold shadow-accent"
        >
          <LayoutGrid className="w-5 h-5" />
          Return to Command Center
        </Link>
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
      case 'logic-robot':
        return <LogicRobot />;
      default:
        return (
          <div className="flex flex-col items-center justify-center p-12 sm:p-20 glass-card rounded-[3rem] border-dashed border-2">
            <Sparkles className="w-12 h-12 text-game-accent/40 mb-6" />
            <h3 className="text-2xl font-bold text-game-text mb-2 tracking-tight text-center">Classified Development</h3>
            <p className="text-game-muted text-center max-w-sm">This sector is currently being fortified. Our best engineers are on the front line.</p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-10 sm:space-y-14">
      {/* Dynamic Game Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 sm:gap-0">
        <div className="flex items-center gap-6">
          <Link
            to="/"
            className="p-4 rounded-2xl bg-white border border-game-border shadow-sm hover:border-game-accent/30 hover:shadow-md transition-all group"
          >
            <ArrowLeft className="w-6 h-6 text-game-muted group-hover:text-game-accent transition-colors" />
          </Link>
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-lg bg-game-accent/5 border border-game-accent/10 text-game-accent text-[10px] font-bold uppercase tracking-wider mb-1">
              Active Operation
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-game-text tracking-tighter uppercase italic">{game.title}</h1>
            <div className="flex items-center gap-3 text-xs font-bold text-game-muted uppercase tracking-widest">
              <span>{game.category}</span>
              <span className="w-1 h-1 rounded-full bg-slate-300" />
              <span className="text-yellow-600">{game.difficulty} LEVEL</span>
            </div>
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-2 text-game-muted/40">
          <span className="text-[10px] font-bold uppercase tracking-widest">Sector Stability: Secure</span>
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
        </div>
      </div>

      <div className="game-container relative min-h-[500px]">
        <Suspense fallback={<GameLoading />}>
          {renderGame()}
        </Suspense>
      </div>
    </div>
  );
}
