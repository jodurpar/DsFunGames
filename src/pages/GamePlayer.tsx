import { useParams, Link } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { ArrowLeft, AlertTriangle, Loader2, Sparkles, LayoutGrid } from 'lucide-react';
import { GAMES } from '../data/games';
import { useTranslation } from 'react-i18next';
import OrientationGuard from '../components/OrientationGuard';
import { useSEO } from '../hooks/useSEO';

// Lazy loading game components
const HexConquest = lazy(() => import('../games/HexConquest'));
const GridWars = lazy(() => import('../games/GridWars'));
const TowerDefenseLite = lazy(() => import('../games/TowerDefenseLite'));
const LogicRobot = lazy(() => import('../games/LogicRobot'));

function GameLoading() {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center justify-center p-12 sm:p-20 glass-card rounded-[3rem] animate-pulse">
      <div className="relative">
        <div className="absolute inset-0 bg-game-accent/20 blur-xl rounded-full" />
        <Loader2 className="relative w-12 h-12 text-game-accent animate-spin mb-6" />
      </div>
      <p className="text-game-text font-black uppercase tracking-widest text-sm">{t('common.syncing')}</p>
      <p className="text-game-muted text-xs mt-2">{t('common.preparing')}</p>
    </div>
  );
}

export default function GamePlayer() {
  const { t } = useTranslation();
  const { gameId } = useParams();
  const game = GAMES.find(g => g.id === gameId);

  // Dynamic SEO based on whether a game is found or not
  useSEO({
    title: game ? `${t(`games.${game.id}.title`)} | Play Free SEO Game | DsFunGames` : `${t('common.missionNotFound')} | DsFunGames`,
    description: game ? t(`games.${game.id}.description`) : t('common.missionDesc'),
    url: `https://fungames.tacticalhub.com/play/${gameId || ''}`,
    image: game ? game.thumbnail : '/favicon.png'
  });

  if (!game) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="bg-yellow-50 p-6 rounded-[2.5rem] border border-yellow-100 mb-8">
          <AlertTriangle className="w-16 h-16 text-yellow-600" />
        </div>
        <h2 className="text-4xl font-black text-game-text mb-4 tracking-tight">{t('common.missionNotFound')}</h2>
        <p className="text-game-muted max-w-sm mb-8 leading-relaxed">
          {t('common.missionDesc')}
        </p>
        <Link
          to="/"
          className="premium-button flex items-center gap-3 bg-game-accent hover:bg-game-accent-light text-white px-8 py-4 rounded-2xl font-bold shadow-accent"
        >
          <LayoutGrid className="w-5 h-5" />
          {t('common.returnCommand')}
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
            <h3 className="text-2xl font-bold text-game-text mb-2 tracking-tight text-center">{t('common.classified')}</h3>
            <p className="text-game-muted text-center max-w-sm">{t('common.classifiedDesc')}</p>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col h-full gap-4 sm:gap-6">
      {/* Dynamic Game Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0 shrink-0">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="p-2 rounded-xl bg-white border border-game-border shadow-sm hover:border-game-accent/30 transition-all group"
          >
            <ArrowLeft className="w-4 h-4 text-game-muted group-hover:text-game-accent transition-colors" />
          </Link>
          <div className="flex items-center gap-4">
            <div className="flex flex-col">
              <div className="text-game-accent text-[9px] font-black uppercase tracking-tight leading-none mb-0.5 opacity-80">
                {t('common.operation')}
              </div>
              <h1 className="text-lg sm:text-xl font-black text-game-text tracking-tighter uppercase italic leading-none">{t(`games.${game.id}.title`)}</h1>
            </div>
            <div className="h-4 w-px bg-game-border hidden sm:block" />
            <div className="hidden sm:flex items-center gap-2 text-[10px] font-bold text-game-muted uppercase tracking-widest pt-1">
              <span>{t(`categories.${game.category}`)}</span>
              <span className="w-0.5 h-0.5 rounded-full bg-slate-300" />
              <span className="text-yellow-600">{t(`difficulties.${game.difficulty}`)}</span>
            </div>
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-2 text-game-muted/40">
          <span className="text-[9px] font-bold uppercase tracking-widest">{t('common.stability')}: {t('common.secure')}</span>
          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse opacity-60" />
        </div>
      </div>

      <div className="game-container relative flex-1 min-h-0">
        <Suspense fallback={<GameLoading />}>
          <OrientationGuard locked={gameId === 'tower-defense-lite' || gameId === 'logic-robot'}>
            {renderGame()}
          </OrientationGuard>
        </Suspense>
      </div>
    </div>
  );
}
