import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { RefreshCw, Trophy } from 'lucide-react';

type Owner = 'player' | 'ai' | null;

export default function HexConquest() {
  const GRID_SIZE = 25; // 5x5 grid
  const [grid, setGrid] = useState<Owner[]>(Array(GRID_SIZE).fill(null));
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState<Owner | 'draw' | null>(null);

  const handleCellClick = (index: number) => {
    if (grid[index] || !isPlayerTurn || gameOver) return;

    const newGrid = [...grid];
    newGrid[index] = 'player';
    setGrid(newGrid);
    setIsPlayerTurn(false);
  };

  // AI Turn
  useEffect(() => {
    if (!isPlayerTurn && !gameOver) {
      const timeout = setTimeout(() => {
        const availableMoves = grid.map((cell, idx) => cell === null ? idx : null).filter(val => val !== null) as number[];
        
        if (availableMoves.length > 0) {
          const randomMove = availableMoves[Math.floor(Math.random() * availableMoves.length)];
          const newGrid = [...grid];
          newGrid[randomMove] = 'ai';
          setGrid(newGrid);
          setIsPlayerTurn(true);
        }
      }, 500); // Artificial delay for AI thinking

      return () => clearTimeout(timeout);
    }
  }, [isPlayerTurn, gameOver, grid]);

  // Check Game Over
  useEffect(() => {
    const isFull = grid.every(cell => cell !== null);
    if (isFull) {
      setGameOver(true);
      const playerScore = grid.filter(c => c === 'player').length;
      const aiScore = grid.filter(c => c === 'ai').length;
      
      if (playerScore > aiScore) setWinner('player');
      else if (aiScore > playerScore) setWinner('ai');
      else setWinner('draw');
    }
  }, [grid]);

  const resetGame = () => {
    setGrid(Array(GRID_SIZE).fill(null));
    setIsPlayerTurn(true);
    setGameOver(false);
    setWinner(null);
  };

  return (
    <div className="flex flex-col items-center justify-center gap-8 max-w-2xl mx-auto">
      <div className="flex justify-between w-full items-center bg-game-card p-4 rounded-xl border border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-blue-500" />
          <span className="font-mono text-sm">Player: {grid.filter(c => c === 'player').length}</span>
        </div>
        <div className="font-bold text-xl">
          {gameOver ? (
            <span className={winner === 'player' ? 'text-green-400' : 'text-red-400'}>
              {winner === 'player' ? 'YOU WIN!' : winner === 'ai' ? 'AI WINS!' : 'DRAW!'}
            </span>
          ) : (
            <span className="text-game-muted animate-pulse">
              {isPlayerTurn ? 'Your Turn' : 'AI Thinking...'}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm">AI: {grid.filter(c => c === 'ai').length}</span>
          <div className="w-4 h-4 rounded-full bg-red-500" />
        </div>
      </div>

      <div className="grid grid-cols-5 gap-3 bg-game-card p-6 rounded-2xl border border-white/5 shadow-2xl">
        {grid.map((cell, index) => (
          <motion.button
            key={index}
            whileHover={{ scale: !cell && !gameOver ? 1.05 : 1 }}
            whileTap={{ scale: !cell && !gameOver ? 0.95 : 1 }}
            onClick={() => handleCellClick(index)}
            disabled={!!cell || !isPlayerTurn || gameOver}
            className={`
              w-16 h-16 rounded-lg transition-all duration-300 flex items-center justify-center
              ${cell === 'player' ? 'bg-blue-500 shadow-lg shadow-blue-500/50' : 
                cell === 'ai' ? 'bg-red-500 shadow-lg shadow-red-500/50' : 
                'bg-white/5 hover:bg-white/10'}
            `}
          >
            {cell === 'player' && <div className="w-3 h-3 bg-white rounded-full" />}
            {cell === 'ai' && <div className="w-3 h-3 bg-white rounded-sm" />}
          </motion.button>
        ))}
      </div>

      {gameOver && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={resetGame}
          className="flex items-center gap-2 px-6 py-3 bg-game-accent hover:bg-blue-600 text-white rounded-xl font-bold transition-colors shadow-lg shadow-blue-500/20"
        >
          <RefreshCw className="w-5 h-5" />
          Play Again
        </motion.button>
      )}

      <div className="text-center text-sm text-game-muted max-w-md">
        <p>Strategy: Capture more cells than the AI. Plan your moves to block the AI from taking key positions.</p>
      </div>
    </div>
  );
}
