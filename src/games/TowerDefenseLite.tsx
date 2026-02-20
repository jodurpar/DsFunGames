import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RefreshCw, Play, Shield, Coins, Heart, Zap } from 'lucide-react';

interface Position {
  x: number;
  y: number;
}

interface Enemy {
  id: number;
  pos: Position;
  pathIndex: number;
  health: number;
  maxHealth: number;
  speed: number;
}

interface Tower {
  id: number;
  pos: Position;
  range: number;
  damage: number;
  lastShot: number;
}

interface Projectile {
  id: number;
  start: Position;
  target: Position;
  progress: number;
}

export default function TowerDefenseLite() {
  const GRID_WIDTH = 10;
  const GRID_HEIGHT = 8;
  const CELL_SIZE = 60;

  const PATH: Position[] = [
    { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }, { x: 3, y: 1 },
    { x: 3, y: 2 }, { x: 3, y: 3 }, { x: 3, y: 4 },
    { x: 4, y: 4 }, { x: 5, y: 4 }, { x: 6, y: 4 },
    { x: 6, y: 3 }, { x: 6, y: 2 },
    { x: 7, y: 2 }, { x: 8, y: 2 }, { x: 9, y: 2 },
  ];

  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [towers, setTowers] = useState<Tower[]>([]);
  const [projectiles, setProjectiles] = useState<Projectile[]>([]);
  const [money, setMoney] = useState(150);
  const [health, setHealth] = useState(20);
  const [wave, setWave] = useState(0);
  const [gameActive, setGameActive] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  const gameLoopRef = useRef<number | null>(null);
  const lastTickRef = useRef<number>(0);
  const enemyIdCounter = useRef(0);
  const towerIdCounter = useRef(0);
  const projectileIdCounter = useRef(0);

  const isPath = (x: number, y: number) => PATH.some(p => p.x === x && p.y === y);
  const hasTower = (x: number, y: number) => towers.some(t => t.pos.x === x && t.pos.y === y);

  const placeTower = (x: number, y: number) => {
    if (isPath(x, y) || hasTower(x, y) || money < 50 || gameOver) return;
    const newTower: Tower = {
      id: towerIdCounter.current++,
      pos: { x, y },
      range: 2.5,
      damage: 15,
      lastShot: 0,
    };
    setTowers([...towers, newTower]);
    setMoney(m => m - 50);
  };

  // Automated Wave Spawning
  useEffect(() => {
    if (wave > 0 && !gameOver) {
      const enemyCount = 5 + wave * 2;
      const newEnemies: Enemy[] = [];
      for (let i = 0; i < enemyCount; i++) {
        newEnemies.push({
          id: enemyIdCounter.current++,
          pos: { ...PATH[0] },
          pathIndex: -i * 3, // Staggered entry
          health: 30 + wave * 15,
          maxHealth: 30 + wave * 15,
          speed: 0.05 + (Math.random() * 0.02),
        });
      }
      setEnemies(newEnemies);
      lastTickRef.current = 0;
      setGameActive(true);
    }
  }, [wave, gameOver]);

  // Automated Progression
  useEffect(() => {
    if (gameActive && enemies.length === 0 && !gameOver && wave > 0) {
      const timer = setTimeout(() => {
        setWave(w => w + 1);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [enemies.length, wave, gameOver, gameActive]);

  const gameTick = useCallback((timestamp: number) => {
    if (!gameActive || gameOver) return;
    lastTickRef.current = timestamp;

    setEnemies(prevEnemies => {
      const updatedEnemies: Enemy[] = [];
      let healthLost = 0;

      prevEnemies.forEach(enemy => {
        const nextIdx = enemy.pathIndex + enemy.speed * 10;
        if (nextIdx >= PATH.length * 10) {
          healthLost += 1;
        } else if (enemy.health > 0) {
          const currentPathStep = Math.max(0, Math.floor(enemy.pathIndex / 10));
          const nextPathStep = Math.min(PATH.length - 1, currentPathStep + 1);
          const t = (enemy.pathIndex % 10) / 10;

          const posX = PATH[currentPathStep].x + (PATH[nextPathStep].x - PATH[currentPathStep].x) * t;
          const posY = PATH[currentPathStep].y + (PATH[nextPathStep].y - PATH[currentPathStep].y) * t;

          updatedEnemies.push({
            ...enemy,
            pos: { x: posX, y: posY },
            pathIndex: nextIdx,
          });
        }
      });

      if (healthLost > 0) {
        setHealth(h => {
          const newH = Math.max(0, h - healthLost);
          if (newH === 0) setGameOver(true);
          return newH;
        });
      }
      return updatedEnemies;
    });

    // Scaling based on wave
    const enemyCount = 5 + wave * 2;
    const scalingFactor = enemyCount / 5;
    const currentCooldown = 100 / scalingFactor; // Frecuencia de disparo muy alta y escalable
    const currentProjSpeed = 0.15 * scalingFactor;

    setTowers(prevTowers => {
      const newTowers = [...prevTowers];
      const newProjectiles: Projectile[] = [];

      newTowers.forEach(tower => {
        if (timestamp - tower.lastShot < currentCooldown) return;

        const target = enemies.find(e => {
          const dist = Math.sqrt(Math.pow(e.pos.x - tower.pos.x, 2) + Math.pow(e.pos.y - tower.pos.y, 2));
          return dist <= tower.range && e.pathIndex >= 0;
        });

        if (target) {
          tower.lastShot = timestamp;
          newProjectiles.push({
            id: projectileIdCounter.current++,
            start: { ...tower.pos },
            target: { ...target.pos },
            progress: 0
          });

          setEnemies(prev => prev.map(e => {
            if (e.id === target.id) {
              const newH = e.health - tower.damage;
              if (newH <= 0) setMoney(m => m + 15);
              return { ...e, health: newH };
            }
            return e;
          }).filter(e => e.health > 0));
        }
      });

      if (newProjectiles.length > 0) setProjectiles(p => [...p, ...newProjectiles]);
      return newTowers;
    });

    setProjectiles(prev => prev.map(p => ({
      ...p,
      progress: p.progress + currentProjSpeed
    })).filter(p => p.progress < 1));

    gameLoopRef.current = requestAnimationFrame(gameTick);
  }, [gameActive, gameOver, enemies, wave]);

  useEffect(() => {
    if (gameActive && !gameOver) {
      gameLoopRef.current = requestAnimationFrame(gameTick);
    } else if (gameLoopRef.current) {
      cancelAnimationFrame(gameLoopRef.current);
    }
    return () => { if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current); };
  }, [gameActive, gameOver, gameTick]);

  const resetGame = () => {
    setEnemies([]);
    setTowers([]);
    setProjectiles([]);
    setMoney(150);
    setHealth(20);
    setWave(0);
    setGameActive(false);
    setGameOver(false);
    lastTickRef.current = 0;
  };

  return (
    <div className="flex flex-col items-center gap-6 max-w-4xl mx-auto p-4">
      <div className="grid grid-cols-4 gap-4 w-full bg-game-card p-4 rounded-2xl border border-white/5 shadow-lg">
        <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-lg">
          <Heart className="w-5 h-5 text-red-500" />
          <span className="font-bold text-lg">{health}</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-lg">
          <Coins className="w-5 h-5 text-yellow-500" />
          <span className="font-bold text-lg">{money}</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-lg">
          <Zap className="w-5 h-5 text-blue-500" />
          <span className="font-bold text-lg">Wave {wave}</span>
        </div>

        {wave === 0 && !gameOver ? (
          <button
            onClick={() => setWave(1)}
            className="flex items-center justify-center gap-2 bg-game-accent hover:bg-blue-600 px-4 py-2 rounded-xl font-bold transition-all shadow-lg shadow-blue-500/20"
          >
            <Play className="w-4 h-4 fill-current" /> Start
          </button>
        ) : !gameOver ? (
          <div className="flex items-center justify-center gap-2 bg-blue-500/10 text-game-accent px-4 py-2 rounded-xl font-bold border border-blue-500/20">
            <Zap className="w-4 h-4 animate-pulse" /> Active
          </div>
        ) : (
          <button
            onClick={resetGame}
            className="flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 px-4 py-2 rounded-xl font-bold transition-all"
          >
            <RefreshCw className="w-4 h-4" /> Reset
          </button>
        )}
      </div>

      <div
        className="relative bg-slate-900 rounded-2xl border-4 border-game-card shadow-2xl overflow-hidden"
        style={{ width: GRID_WIDTH * CELL_SIZE, height: GRID_HEIGHT * CELL_SIZE }}
      >
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: `${CELL_SIZE}px ${CELL_SIZE}px` }} />

        {PATH.map((p, i) => (
          <div key={i} className="absolute bg-slate-800/30" style={{ left: p.x * CELL_SIZE, top: p.y * CELL_SIZE, width: CELL_SIZE, height: CELL_SIZE, border: '1px solid rgba(255,255,255,0.02)' }} />
        ))}

        <div className="absolute bg-green-500/10 border border-green-500/30 flex items-center justify-center text-[10px] font-bold text-green-400/50 uppercase"
          style={{ left: PATH[0].x * CELL_SIZE, top: PATH[0].y * CELL_SIZE, width: CELL_SIZE, height: CELL_SIZE }}>Start</div>
        <div className="absolute bg-red-500/10 border border-red-500/30 flex items-center justify-center text-[10px] font-bold text-red-400/50 uppercase"
          style={{ left: PATH[PATH.length - 1].x * CELL_SIZE, top: PATH[PATH.length - 1].y * CELL_SIZE, width: CELL_SIZE, height: CELL_SIZE }}>Base</div>

        {Array.from({ length: GRID_WIDTH * GRID_HEIGHT }).map((_, i) => {
          const x = i % GRID_WIDTH;
          const y = Math.floor(i / GRID_WIDTH);
          if (isPath(x, y)) return null;
          return <div key={i} onClick={() => placeTower(x, y)} className={`absolute cursor-pointer hover:bg-white/5`} style={{ left: x * CELL_SIZE, top: y * CELL_SIZE, width: CELL_SIZE, height: CELL_SIZE }} />;
        })}

        {towers.map(tower => (
          <motion.div key={tower.id} initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute z-10 flex items-center justify-center" style={{ left: tower.pos.x * CELL_SIZE, top: tower.pos.y * CELL_SIZE, width: CELL_SIZE, height: CELL_SIZE }}>
            <div className="relative group">
              <div className="w-10 h-10 bg-blue-500 rounded-lg shadow-lg flex items-center justify-center border-2 border-blue-400"><Shield className="w-6 h-6 text-white" /></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border-2 border-blue-500/10 rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" style={{ width: tower.range * 2 * CELL_SIZE, height: tower.range * 2 * CELL_SIZE }} />
            </div>
          </motion.div>
        ))}

        {enemies.map(enemy => (
          <div key={enemy.id} className="absolute z-20" style={{ left: enemy.pos.x * CELL_SIZE + CELL_SIZE / 2, top: enemy.pos.y * CELL_SIZE + CELL_SIZE / 2, transform: 'translate(-50%, -50%)' }}>
            <div className="relative h-6 w-6">
              <div className="h-full w-full bg-red-500 rounded-full shadow-lg border-2 border-red-400" />
              <div className="absolute -top-3 left-0 w-full h-1 bg-black/50 rounded-full overflow-hidden">
                <div className="h-full bg-green-500" style={{ width: `${(enemy.health / enemy.maxHealth) * 100}%` }} />
              </div>
            </div>
          </div>
        ))}

        {projectiles.map(p => (
          <div key={p.id} className="absolute z-30 w-2 h-2 bg-yellow-400 rounded-full" style={{ left: (p.start.x + (p.target.x - p.start.x) * p.progress) * CELL_SIZE + CELL_SIZE / 2, top: (p.start.y + (p.target.y - p.start.y) * p.progress) * CELL_SIZE + CELL_SIZE / 2, transform: 'translate(-50%, -50%)' }} />
        ))}

        <AnimatePresence>
          {gameOver && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center" >
              <h2 className="text-4xl font-black text-red-500 mb-2">GAME OVER</h2>
              <p className="text-game-muted mb-6">You survived {wave} waves.</p>
              <button onClick={resetGame} className="flex items-center gap-2 bg-game-accent hover:bg-blue-600 px-8 py-3 rounded-xl font-bold transition-all shadow-xl" >
                <RefreshCw className="w-5 h-5" /> Try Again
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="bg-game-card p-6 rounded-2xl border border-white/5 w-full max-w-2xl text-sm text-game-muted">
        <p>Click empty slots to build towers ($50). Waves proceed automatically. Towers fire faster as the horde grows!</p>
      </div>
    </div>
  );
}
