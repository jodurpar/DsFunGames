import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { RefreshCw, Play, Shield, Coins, Heart, Zap } from 'lucide-react';
import { useTowerDefenseEngine } from '../hooks/useTowerDefenseEngine';

export default function TowerDefenseLite() {
  const {
    state,
    actions,
    utils,
    config
  } = useTowerDefenseEngine();

  const {
    enemies,
    towers,
    projectiles,
    money,
    health,
    wave,
    gameOver,
    path
  } = state;

  const {
    placeTower,
    resetGame,
    startNextWave,
    regeneratePath
  } = actions;

  const {
    isPath
  } = utils;

  const {
    GRID_WIDTH,
    GRID_HEIGHT,
    CELL_SIZE
  } = config;

  return (
    <div className="flex flex-col xl:flex-row gap-6 sm:gap-10 w-full mx-auto justify-center items-start pb-20">
      {/* Sidebar: Instructions (Hidden on small screens, shown as card on XL) */}
      <div className="w-full xl:w-80 shrink-0 flex flex-col gap-6 sticky top-24 order-2 xl:order-1">
        <div className="glass-card p-6 sm:p-8 rounded-[2.5rem] flex flex-col gap-6">
          <div className="flex items-center gap-3 text-game-accent">
            <div className="bg-game-accent/10 p-2 rounded-xl">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-sm uppercase tracking-wider">Tactical Briefing</h3>
          </div>

          <div className="space-y-6">
            <div className="bg-game-accent/5 p-4 rounded-2xl border border-game-accent/10">
              <p className="text-[13px] text-game-text font-semibold leading-relaxed">
                Strategic focus required. Prevent the enemy advance at all costs.
              </p>
            </div>

            {[
              { id: 1, title: 'Establish Defense', desc: 'Click empty slots ($50) to deploy strategic defensive towers.' },
              { id: 2, title: 'Automated Fire', desc: 'Towers engage targets within their radius automatically.' },
              { id: 3, title: 'Secure Funding', desc: 'Neutralizing threats generates credits for fortification.' },
              { id: 4, title: 'Strategic Depth', desc: 'Opposition intensity increases. Plan for long-term survival.' },
            ].map(step => (
              <div key={step.id} className="flex gap-4">
                <div className="w-8 h-8 rounded-xl bg-game-accent/10 flex items-center justify-center text-xs font-black text-game-accent shrink-0">
                  {step.id}
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-game-text">{step.title}</h4>
                  <p className="text-[12px] text-game-muted leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-6 border-t border-game-border">
            <p className="text-[11px] text-game-muted italic font-medium">Protect the base at all costs, Commander.</p>
          </div>
        </div>
      </div>

      {/* Main Game Area */}
      <div className="flex-1 w-full max-w-4xl flex flex-col gap-6 sm:gap-8 items-center order-1 xl:order-2">
        {/* Stats Panel */}
        <div className="w-full glass-card p-4 sm:p-6 rounded-[2.5rem] flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center gap-4 sm:gap-8">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-game-muted uppercase tracking-widest mb-1">Health</span>
              <div className="flex items-center gap-2">
                <div className="bg-red-50 p-1.5 rounded-lg"><Heart className="w-4 h-4 text-red-500 fill-red-500" /></div>
                <span className="font-black text-xl text-game-text">{health}</span>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-game-muted uppercase tracking-widest mb-1">Credits</span>
              <div className="flex items-center gap-2">
                <div className="bg-yellow-50 p-1.5 rounded-lg"><Coins className="w-4 h-4 text-yellow-600 fill-yellow-600" /></div>
                <span className="font-black text-xl text-game-text">${money}</span>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-game-muted uppercase tracking-widest mb-1">Progress</span>
              <div className="flex items-center gap-2 text-game-accent">
                <div className="bg-blue-50 p-1.5 rounded-lg"><Zap className="w-4 h-4" /></div>
                <span className="font-black text-xl">WAVE {wave}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {wave === 0 && !gameOver ? (
              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  onClick={startNextWave}
                  className="premium-button flex items-center justify-center gap-2 bg-game-accent hover:bg-game-accent-light text-white px-8 py-3 rounded-2xl font-bold shadow-accent"
                >
                  <Play className="w-4 h-4 fill-current" /> Begin Mission
                </button>
                {towers.length === 0 && (
                  <button
                    onClick={regeneratePath}
                    title="Re-calculate strategy path"
                    className="p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-colors border border-game-border text-game-muted"
                  >
                    <RefreshCw className="w-5 h-5" />
                  </button>
                )}
              </div>
            ) : !gameOver ? (
              <div className="flex items-center gap-3 bg-blue-50 text-game-accent px-6 py-3 rounded-2xl font-black text-sm border border-blue-100">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-game-accent opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-game-accent"></span>
                </span>
                COMBAT ACTIVE
              </div>
            ) : (
              <button
                onClick={resetGame}
                className="premium-button flex items-center justify-center gap-2 bg-slate-900 text-white px-8 py-3 rounded-2xl font-bold"
              >
                <RefreshCw className="w-4 h-4" /> Reset Mission
              </button>
            )}
          </div>
        </div>

        {/* Board */}
        <div className="w-full relative group p-1 bg-white rounded-[3rem] shadow-2xl border border-game-border">
          <div
            className="relative bg-[#fcfdfe] rounded-[2.5rem] overflow-hidden cursor-crosshair sm:shrink-0 mx-auto"
            style={{
              width: GRID_WIDTH * CELL_SIZE,
              height: GRID_HEIGHT * CELL_SIZE,
              backgroundImage: 'radial-gradient(circle, #e2e8f0 1.5px, transparent 1.5px)',
              backgroundSize: `${CELL_SIZE}px ${CELL_SIZE}px`
            }}
          >
            {/* Dynamic Path */}
            {path.map((p, i) => (
              <div
                key={i}
                className="absolute bg-slate-200/40 transition-colors"
                style={{
                  left: p.x * CELL_SIZE,
                  top: p.y * CELL_SIZE,
                  width: CELL_SIZE,
                  height: CELL_SIZE,
                  border: '2px solid #e2e8f0'
                }}
              />
            ))}

            {/* Start/Base Markers */}
            <div className="absolute z-10 flex items-center justify-center pointer-events-none"
              style={{ left: path[0].x * CELL_SIZE, top: path[0].y * CELL_SIZE, width: CELL_SIZE, height: CELL_SIZE }}>
              <div className="w-8 h-8 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              </div>
            </div>
            <div className="absolute z-10 flex items-center justify-center pointer-events-none"
              style={{ left: path[path.length - 1].x * CELL_SIZE, top: path[path.length - 1].y * CELL_SIZE, width: CELL_SIZE, height: CELL_SIZE }}>
              <div className="w-8 h-8 rounded-full bg-red-500/10 border-2 border-red-500/30 flex items-center justify-center">
                <div className="w-3 h-3 bg-red-500 rounded-sm" />
              </div>
            </div>

            {/* Interactivity Grid */}
            {Array.from({ length: GRID_WIDTH * GRID_HEIGHT }).map((_, i) => {
              const x = i % GRID_WIDTH;
              const y = Math.floor(i / GRID_WIDTH);
              if (isPath(x, y)) return null;
              return (
                <div
                  key={i}
                  onClick={() => placeTower(x, y)}
                  className="absolute cursor-pointer border border-transparent hover:border-game-accent/20 hover:bg-game-accent/[0.02] transition-colors"
                  style={{ left: x * CELL_SIZE, top: y * CELL_SIZE, width: CELL_SIZE, height: CELL_SIZE }}
                />
              );
            })}

            {/* Towers */}
            {towers.map(tower => (
              <motion.div
                key={tower.id}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute z-30 flex items-center justify-center"
                style={{ left: tower.pos.x * CELL_SIZE, top: tower.pos.y * CELL_SIZE, width: CELL_SIZE, height: CELL_SIZE }}
              >
                <div className="relative group/tower">
                  <div className="w-10 h-10 bg-white rounded-2xl shadow-lg border-2 border-game-accent flex items-center justify-center">
                    <Shield className="w-6 h-6 text-game-accent fill-game-accent/10" />
                  </div>
                  {/* Range Circle */}
                  <div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-game-accent/5 border-2 border-game-accent/10 rounded-full pointer-events-none opacity-0 group-hover/tower:opacity-100 transition-all scale-95 group-hover/tower:scale-100"
                    style={{ width: tower.range * 2 * CELL_SIZE, height: tower.range * 2 * CELL_SIZE }}
                  />
                </div>
              </motion.div>
            ))}

            {/* Enemies */}
            {enemies.map(enemy => (
              <div
                key={enemy.id}
                className="absolute z-40 transition-all duration-100"
                style={{
                  left: enemy.pos.x * CELL_SIZE + CELL_SIZE / 2,
                  top: enemy.pos.y * CELL_SIZE + CELL_SIZE / 2,
                  transform: 'translate(-50%, -50%)'
                }}
              >
                <div className="relative h-8 w-8 flex flex-col items-center gap-1">
                  <div className="h-4 w-4 bg-slate-900 rounded-full shadow-xl border-2 border-white ring-2 ring-red-500/20" />
                  <div className="w-6 h-1 bg-slate-200 rounded-full overflow-hidden border border-white">
                    <div
                      className="h-full bg-red-500 transition-all"
                      style={{ width: `${(enemy.health / enemy.maxHealth) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}

            {/* Projectiles */}
            {projectiles.map(p => (
              <div
                key={p.id}
                className="absolute z-50 w-2 h-2 bg-game-accent rounded-full shadow-sm"
                style={{
                  left: (p.start.x + (p.target.x - p.start.x) * p.progress) * CELL_SIZE + CELL_SIZE / 2,
                  top: (p.start.y + (p.target.y - p.start.y) * p.progress) * CELL_SIZE + CELL_SIZE / 2,
                  transform: 'translate(-50%, -50%)'
                }}
              />
            ))}

            {/* Game Over Overlay */}
            <AnimatePresence>
              {gameOver && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-[60] bg-white/95 backdrop-blur-xl flex flex-col items-center justify-center p-8 text-center"
                >
                  <div className="bg-red-50 p-10 rounded-[3rem] border-2 border-red-100 mb-10 shadow-2xl shadow-red-500/10">
                    <div className="w-20 h-20 bg-red-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                      <Zap className="w-10 h-10 text-red-600" />
                    </div>
                    <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tighter uppercase italic">Mission Overrun</h2>
                    <p className="text-game-muted font-medium max-w-xs mx-auto">
                      Strategic containment failed. You survived <span className="text-red-600 font-bold">{wave} intensive waves</span> of opposition.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm px-4">
                    <button
                      onClick={resetGame}
                      className="premium-button flex-1 flex items-center justify-center gap-3 bg-game-accent hover:bg-game-accent-light text-white px-8 py-4 rounded-2xl font-black shadow-accent transition-all"
                    >
                      <RefreshCw className="w-5 h-5" /> New Mission
                    </button>
                    <Link
                      to="/"
                      className="premium-button flex-1 flex items-center justify-center gap-3 bg-slate-50 hover:bg-slate-100 text-game-text px-8 py-4 rounded-2xl font-black border border-game-border transition-all"
                    >
                      Abort
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
