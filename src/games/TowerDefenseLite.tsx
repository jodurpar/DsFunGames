import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { RefreshCw, Play, Shield, Coins, Heart, Zap } from 'lucide-react';
import { useTowerDefenseEngine } from '../hooks/useTowerDefenseEngine';
import { useTranslation, Trans } from 'react-i18next';

export default function TowerDefenseLite() {
  const { t } = useTranslation();
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
      {/* Sidebar: Instructions */}
      <div className="w-full xl:w-80 shrink-0 flex flex-col gap-6 sticky top-24 order-2 xl:order-1">
        <div className="glass-card p-6 sm:p-8 rounded-[2.5rem] flex flex-col gap-6">
          <div className="flex items-center gap-3 text-game-accent">
            <div className="bg-game-accent/10 p-2 rounded-xl">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-sm uppercase tracking-wider">{t('towerDefense.briefingTitle')}</h3>
          </div>

          <div className="space-y-6">
            <div className="bg-game-accent/5 p-4 rounded-2xl border border-game-accent/10">
              <p className="text-[13px] text-game-text font-semibold leading-relaxed">
                {t('towerDefense.mainGoal')}
              </p>
            </div>

            {[
              { id: 1, title: t('towerDefense.step1Title'), desc: t('towerDefense.step1Desc') },
              { id: 2, title: t('towerDefense.step2Title'), desc: t('towerDefense.step2Desc') },
              { id: 3, title: t('towerDefense.step3Title'), desc: t('towerDefense.step3Desc') },
              { id: 4, title: t('towerDefense.step4Title'), desc: t('towerDefense.step4Desc') },
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
            <p className="text-[11px] text-game-muted italic font-medium">{t('towerDefense.luck')}</p>
          </div>
        </div>
      </div>

      {/* Main Game Area */}
      <div className="flex-1 w-full max-w-4xl flex flex-col gap-6 sm:gap-8 items-center order-1 xl:order-2">
        {/* Stats Panel */}
        <div className="w-full glass-card p-4 sm:p-6 rounded-[2.5rem] flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center gap-4 sm:gap-8">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-game-muted uppercase tracking-widest mb-1">{t('towerDefense.health')}</span>
              <div className="flex items-center gap-2">
                <div className="bg-red-50 p-1.5 rounded-lg"><Heart className="w-4 h-4 text-red-500 fill-red-500" /></div>
                <span className="font-black text-xl text-game-text">{health}</span>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-game-muted uppercase tracking-widest mb-1">{t('towerDefense.credits')}</span>
              <div className="flex items-center gap-2">
                <div className="bg-yellow-50 p-1.5 rounded-lg"><Coins className="w-4 h-4 text-yellow-600 fill-yellow-600" /></div>
                <span className="font-black text-xl text-game-text">${money}</span>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-game-muted uppercase tracking-widest mb-1">{t('towerDefense.progress')}</span>
              <div className="flex items-center gap-2 text-game-accent">
                <div className="bg-blue-50 p-1.5 rounded-lg"><Zap className="w-4 h-4" /></div>
                <span className="font-black text-xl">{t('towerDefense.wave')} {wave}</span>
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
                  <Play className="w-4 h-4 fill-current" /> {t('towerDefense.begin')}
                </button>
                {towers.length === 0 && (
                  <button
                    onClick={regeneratePath}
                    title={t('towerDefense.recalculate')}
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
                {t('towerDefense.combatActive')}
              </div>
            ) : (
              <button
                onClick={resetGame}
                className="premium-button flex items-center justify-center gap-2 bg-slate-900 text-white px-8 py-3 rounded-2xl font-bold"
              >
                <RefreshCw className="w-4 h-4" /> {t('towerDefense.reset')}
              </button>
            )}
          </div>
        </div>

        {/* Board */}
        <div className="w-full relative group p-4 sm:p-8 flex justify-center items-center perspective-1000">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/30 to-transparent pointer-events-none rounded-[4rem]" />

          <div
            className="relative bg-[#fcfdfe] rounded-[100px] cursor-crosshair sm:shrink-0 mx-auto transition-transform duration-700"
            style={{
              width: GRID_WIDTH * CELL_SIZE,
              height: GRID_HEIGHT * CELL_SIZE,
              backgroundImage: 'radial-gradient(circle, #e2e8f0 1.5px, transparent 1.5px)',
              backgroundSize: `${CELL_SIZE}px ${CELL_SIZE}px`,
              boxShadow: 'inset 0 4px 10px rgba(255,255,255,1), inset 0 -4px 12px rgba(0,0,0,0.05), 0 20px 40px rgba(0,0,0,0.1), 0 0 0 10px rgba(255,255,255,0.7)',
              border: '1px solid rgba(255,255,255,0.8)'
            }}
          >
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

            <div className="absolute z-10 flex items-center justify-center pointer-events-none"
              style={{ left: path[0].x * CELL_SIZE, top: path[0].y * CELL_SIZE, width: CELL_SIZE, height: CELL_SIZE }}>
              <div className="w-[80%] h-[80%] rotate-45 bg-gradient-to-br from-emerald-400 to-green-900 rounded-xl shadow-[0_10px_20px_rgba(16,185,129,0.4)] border border-emerald-300/50 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-2 bg-emerald-300/40 shadow-[0_0_15px_#6ee7b7] -rotate-45" />
                <div className="w-1/2 h-1/2 bg-emerald-100 rounded-full shadow-[0_0_20px_#a7f3d0] animate-pulse" />
              </div>
            </div>

            <div className="absolute z-10 flex items-center justify-center pointer-events-none perspective-1000"
              style={{ left: path[path.length - 1].x * CELL_SIZE, top: path[path.length - 1].y * CELL_SIZE, width: CELL_SIZE, height: CELL_SIZE }}>
              <div className="w-[80%] h-[90%] bg-gradient-to-t from-slate-900 to-red-900 rounded-3xl shadow-[0_10px_20px_rgba(220,38,38,0.3)] border-b-4 border-red-950 flex flex-col items-center justify-end pb-2 relative overflow-hidden">
                <div className="absolute top-[20%] w-[90%] h-1 bg-red-400 shadow-[0_0_10px_#f87171,0_0_20px_#f87171] rounded-full opacity-80" />
                <div className="absolute bottom-[20%] w-full h-1 bg-red-50 shadow-[0_0_12px_#ef4444] rounded-full opacity-70" />
                <div className="absolute top-1 w-1/2 h-1/2 bg-slate-800 rounded-full border-2 border-red-400/50 shadow-[inset_0_0_10px_rgba(239,68,68,0.5)] flex items-center justify-center">
                  <div className="w-1/2 h-1/2 bg-red-300 rounded-full shadow-[0_0_15px_#fca5a5] animate-pulse" />
                </div>
              </div>
            </div>

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

            {towers.map(tower => (
              <motion.div
                key={tower.id}
                initial={{ scale: 0, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="absolute z-30 flex items-center justify-center perspective-1000"
                style={{ left: tower.pos.x * CELL_SIZE, top: tower.pos.y * CELL_SIZE, width: CELL_SIZE, height: CELL_SIZE }}
              >
                <div className="relative group/tower w-full h-full flex items-center justify-center">
                  <div className="w-[80%] h-[90%] bg-gradient-to-t from-slate-900 to-indigo-900 rounded-3xl shadow-[0_10px_20px_rgba(0,0,0,0.3)] border-b-4 border-indigo-950 flex flex-col items-center justify-end pb-2 relative overflow-hidden">
                    <div className="absolute top-[20%] w-[90%] h-1 bg-indigo-400 shadow-[0_0_10px_#818cf8,0_0_20px_#818cf8] rounded-full opacity-80" />
                    <div className="absolute bottom-[20%] w-full h-1 bg-indigo-50 shadow-[0_0_12px_#6366f1] rounded-full opacity-70" />
                    <div className="absolute top-1 w-1/2 h-1/2 bg-slate-800 rounded-full border-2 border-indigo-400/50 shadow-[inset_0_0_10px_rgba(99,102,241,0.5)] flex items-center justify-center">
                      <div className="w-1/2 h-1/2 bg-indigo-300 rounded-full shadow-[0_0_15px_#a5b4fc] animate-pulse" />
                    </div>
                  </div>
                  <div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-indigo-500/5 border border-indigo-500/20 rounded-full pointer-events-none opacity-0 group-hover/tower:opacity-100 transition-all scale-95 group-hover/tower:scale-100"
                    style={{ width: tower.range * 2 * CELL_SIZE, height: tower.range * 2 * CELL_SIZE }}
                  />
                </div>
              </motion.div>
            ))}

            {enemies.map(enemy => (
              <div
                key={enemy.id}
                className="absolute z-40"
                style={{
                  left: enemy.pos.x * CELL_SIZE + CELL_SIZE / 2,
                  top: enemy.pos.y * CELL_SIZE + CELL_SIZE / 2,
                  transform: 'translate(-50%, -50%)'
                }}
              >
                <div className="relative w-10 h-10 flex items-center justify-center">
                  <motion.div
                    animate={{ y: [-2, 2, -2] }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                    className="w-6 h-6 rotate-45 bg-gradient-to-br from-indigo-500 to-purple-900 rounded-sm shadow-[0_5px_15px_rgba(79,70,229,0.4)] border border-indigo-400/50"
                  />
                  <div className="absolute -bottom-3 w-8 h-2 bg-black/20 rounded-full blur-[2px]" />
                  <div className="absolute -top-3 w-8 h-1.5 bg-slate-900/40 backdrop-blur-sm rounded-full overflow-hidden border border-white/10 shadow-sm">
                    <div
                      className="h-full bg-indigo-400 shadow-[0_0_8px_#818cf8] transition-all"
                      style={{ width: `${(enemy.health / enemy.maxHealth) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}

            {projectiles.map(p => {
              const dx = p.target.x - p.start.x;
              const dy = p.target.y - p.start.y;
              const distance = Math.sqrt(dx * dx + dy * dy);
              const angle = Math.atan2(dy, dx);

              return (
                <div
                  key={p.id}
                  className="absolute z-[45] pointer-events-none origin-left"
                  style={{
                    left: p.start.x * CELL_SIZE + CELL_SIZE / 2,
                    top: p.start.y * CELL_SIZE + CELL_SIZE / 2,
                    width: distance * CELL_SIZE * p.progress,
                    height: 4,
                    background: 'linear-gradient(90deg, rgba(238,242,255,0.8), #818cf8, #ffffff)',
                    boxShadow: '0 0 10px #4f46e5, 0 0 20px #818cf8, 0 0 30px #c7d2fe',
                    transform: `rotate(${angle}rad) translateY(-20px)`,
                    opacity: p.progress > 0.8 ? 1 - (p.progress - 0.8) * 5 : 1,
                    borderRadius: '4px'
                  }}
                />
              );
            })}

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
                    <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tighter uppercase italic">{t('towerDefense.overrun')}</h2>
                    <div className="text-game-muted font-medium max-w-xs mx-auto">
                      <Trans i18nKey="towerDefense.overrunDesc" values={{ count: wave }}>
                        Strategic containment failed. You survived <span className="text-red-600 font-bold">{wave} intensive waves</span> of opposition.
                      </Trans>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm px-4">
                    <button
                      onClick={resetGame}
                      className="premium-button flex-1 flex items-center justify-center gap-3 bg-game-accent hover:bg-game-accent-light text-white px-8 py-4 rounded-2xl font-black shadow-accent transition-all"
                    >
                      <RefreshCw className="w-5 h-5" /> {t('towerDefense.newMission')}
                    </button>
                    <Link
                      to="/"
                      className="premium-button flex-1 flex items-center justify-center gap-3 bg-slate-50 hover:bg-slate-100 text-game-text px-8 py-4 rounded-2xl font-black border border-game-border transition-all"
                    >
                      {t('towerDefense.abort')}
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
