import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Play, Info } from 'lucide-react';
import { GAMES } from '../data/games';

export default function Home() {
  return (
    <div className="space-y-12">
      <section className="text-center space-y-4 py-12">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-6xl font-bold tracking-tighter bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent"
        >
          Strategy Simplified.
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-lg text-game-muted max-w-2xl mx-auto"
        >
          Dive into our collection of lightweight, browser-based strategy games. 
          No downloads, no accounts, just pure gameplay.
        </motion.p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {GAMES.map((game, index) => (
          <motion.div
            key={game.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="group relative bg-game-card rounded-2xl overflow-hidden border border-white/5 hover:border-game-accent/50 transition-all duration-300 hover:shadow-lg hover:shadow-game-accent/10"
          >
            <div className="aspect-video relative overflow-hidden">
              <img 
                src={game.thumbnail} 
                alt={game.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-game-card via-transparent to-transparent opacity-80" />
              
              <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                <span className="px-2 py-1 rounded-md bg-black/50 backdrop-blur-sm text-xs font-mono border border-white/10">
                  {game.category}
                </span>
                <span className="px-2 py-1 rounded-md bg-black/50 backdrop-blur-sm text-xs font-mono border border-white/10 text-yellow-400">
                  {game.difficulty}
                </span>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <h3 className="text-xl font-bold text-white group-hover:text-game-accent transition-colors">
                  {game.title}
                </h3>
                <p className="text-sm text-game-muted mt-2 line-clamp-2">
                  {game.description}
                </p>
              </div>

              <div className="pt-4 flex items-center gap-3">
                <Link 
                  to={`/play/${game.id}`}
                  className="flex-1 flex items-center justify-center gap-2 bg-game-accent hover:bg-blue-600 text-white py-2.5 px-4 rounded-xl font-medium transition-all active:scale-95"
                >
                  <Play className="w-4 h-4 fill-current" />
                  Play Now
                </Link>
                <button className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-colors border border-white/5">
                  <Info className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
