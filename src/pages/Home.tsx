import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Play } from 'lucide-react';
import { GAMES } from '../data/games';
import { useTranslation } from 'react-i18next';
import { useSEO } from '../hooks/useSEO';

export default function Home() {
  const { t } = useTranslation();

  useSEO({
    title: `DsFunGames - Tactical Hub | Play Strategy Browser Games`,
    description: `DsFunGames - The ultimate hub for single-player browser tactic and strategy games. Play Tower Defense, Hex Conquest, Logic Robot, and Grid Wars directly on your web browser without downloads.`,
    keywords: "html5 games, browser games, strategy games, tower defense, logic games, turn based strategy, grid wars, react games, dsfungames",
    url: "https://fungames.tacticalhub.com/",
    image: "/favicon.png"
  });

  return (
    <div className="space-y-12 sm:space-y-20">
      {/* Hero Section */}
      <section className="text-center space-y-6 pt-6 sm:pt-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-game-accent/5 border border-game-accent/10 text-game-accent text-[11px] font-bold uppercase tracking-widest mb-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-game-accent opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-game-accent"></span>
          </span>
          {t('home.heroBadge')}
        </div>

        <div className="space-y-4">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-game-text leading-[1.1]"
          >
            {t('home.heroTitle').split(',')[0]}, <br className="hidden sm:block" />
            <span className="text-game-accent">{t('home.heroTitle').split(',')[1] || t('home.heroSubtitle')}</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-base sm:text-lg text-game-muted max-w-2xl mx-auto leading-relaxed"
          >
            {t('home.heroSubtitle')}
          </motion.p>
        </div>
      </section>

      {/* Games Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 px-2 pb-20">
        {GAMES.map((game, index) => (
          <motion.div
            key={game.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group glass-card rounded-[2rem] p-4 sm:p-5 hover:border-game-accent/30 transition-all duration-500 hover:-translate-y-2"
          >
            {/* Thumbnail */}
            <div className="aspect-[4/3] relative overflow-hidden rounded-2xl bg-slate-50 border border-game-border flex items-center justify-center group-hover:shadow-lg transition-all duration-500">
              <img
                src={game.thumbnail}
                alt={t(`games.${game.id}.title`)}
                className="w-full h-full object-contain p-2 transition-transform duration-700 group-hover:scale-110"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/5 to-transparent pointer-events-none" />

              <div className="absolute top-3 left-3">
                <span className="px-2.5 py-1 rounded-lg bg-white/90 backdrop-blur-md text-[10px] font-bold text-game-text border border-black/5 shadow-sm uppercase tracking-wide">
                  {t(`categories.${game.category}`)}
                </span>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <div className="flex justify-between items-start gap-2">
                  <h3 className="text-xl font-bold text-game-text group-hover:text-game-accent transition-colors leading-tight">
                    {t(`games.${game.id}.title`)}
                  </h3>
                  <span className="text-[10px] font-mono font-bold text-yellow-600 bg-yellow-50 px-1.5 py-0.5 rounded border border-yellow-100">
                    {t(`difficulties.${game.difficulty}`)}
                  </span>
                </div>
                <p className="text-sm text-game-muted mt-2 line-clamp-2 leading-relaxed min-h-[40px]">
                  {t(`games.${game.id}.description`)}
                </p>
              </div>

              <Link
                to={`/play/${game.id}`}
                className="premium-button w-full flex items-center justify-center gap-3 bg-game-accent hover:bg-game-accent-light text-white py-4 rounded-2xl text-sm font-bold shadow-accent hover:shadow-xl transition-all"
              >
                <div className="bg-white/20 p-1.5 rounded-lg">
                  <Play className="w-3.5 h-3.5 fill-current" />
                </div>
                {t('common.start')}
              </Link>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
