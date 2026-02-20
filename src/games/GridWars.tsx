import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Sword, Zap, Crosshair, Skull, Trophy, RefreshCw } from 'lucide-react';

type CardType = 'tank' | 'infantry' | 'artillery' | 'air' | 'special';

interface Card {
  id: number;
  type: CardType;
  isFlipped: boolean;
  isMatched: boolean;
}

const ICONS = {
  tank: Shield,
  infantry: Sword,
  artillery: Crosshair,
  air: Zap,
  special: Skull,
};

const COLORS = {
  tank: 'text-blue-400',
  infantry: 'text-green-400',
  artillery: 'text-red-400',
  air: 'text-yellow-400',
  special: 'text-purple-400',
};

export default function GridWars() {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const initializeGame = () => {
    const types: CardType[] = ['tank', 'infantry', 'artillery', 'air', 'special'];
    const deck: Card[] = [];
    
    // Create pairs
    types.forEach(type => {
      // 2 pairs of each type = 20 cards total
      for (let i = 0; i < 4; i++) {
        deck.push({
          id: Math.random(),
          type,
          isFlipped: false,
          isMatched: false,
        });
      }
    });

    // Shuffle
    const shuffled = deck.sort(() => Math.random() - 0.5).map((card, index) => ({ ...card, id: index }));
    setCards(shuffled);
    setFlippedCards([]);
    setMoves(0);
    setMatches(0);
    setGameOver(false);
  };

  useEffect(() => {
    initializeGame();
  }, []);

  const handleCardClick = (id: number) => {
    if (flippedCards.length === 2 || cards[id].isFlipped || cards[id].isMatched) return;

    const newCards = [...cards];
    newCards[id].isFlipped = true;
    setCards(newCards);
    
    const newFlipped = [...flippedCards, id];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      checkForMatch(newFlipped[0], newFlipped[1]);
    }
  };

  const checkForMatch = (id1: number, id2: number) => {
    if (cards[id1].type === cards[id2].type) {
      // Match
      setTimeout(() => {
        setCards(prev => prev.map(card => 
          card.id === id1 || card.id === id2 
            ? { ...card, isMatched: true, isFlipped: true } 
            : card
        ));
        setFlippedCards([]);
        setMatches(m => {
          const newMatches = m + 1;
          if (newMatches === 10) setGameOver(true); // 20 cards = 10 pairs
          return newMatches;
        });
      }, 500);
    } else {
      // No match
      setTimeout(() => {
        setCards(prev => prev.map(card => 
          card.id === id1 || card.id === id2 
            ? { ...card, isFlipped: false } 
            : card
        ));
        setFlippedCards([]);
      }, 1000);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center gap-8 max-w-4xl mx-auto">
      <div className="flex justify-between w-full items-center bg-game-card p-4 rounded-xl border border-white/5 shadow-lg">
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <span className="text-xs text-game-muted uppercase tracking-wider">Moves</span>
            <span className="text-2xl font-mono font-bold">{moves}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-game-muted uppercase tracking-wider">Matches</span>
            <span className="text-2xl font-mono font-bold text-game-accent">{matches}/10</span>
          </div>
        </div>
        
        <h2 className="text-xl font-bold tracking-tight hidden md:block">
          TACTICAL MEMORY
        </h2>

        <button 
          onClick={initializeGame}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-5 gap-3 md:gap-4">
        <AnimatePresence>
          {cards.map((card) => {
            const Icon = ICONS[card.type];
            return (
              <motion.button
                key={card.id}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: !card.isFlipped && !card.isMatched ? 1.05 : 1 }}
                onClick={() => handleCardClick(card.id)}
                className={`
                  relative w-14 h-14 sm:w-20 sm:h-20 rounded-xl flex items-center justify-center text-3xl
                  transition-all duration-500 transform preserve-3d perspective-1000
                  ${card.isFlipped || card.isMatched ? 'bg-game-card border-game-accent' : 'bg-game-card border-white/10'}
                  border-2 shadow-xl
                `}
              >
                <div className="relative w-full h-full flex items-center justify-center">
                  {/* Front (Hidden) */}
                  <motion.div 
                    initial={false}
                    animate={{ rotateY: card.isFlipped || card.isMatched ? 180 : 0 }}
                    transition={{ duration: 0.4 }}
                    className="absolute inset-0 backface-hidden bg-game-card flex items-center justify-center rounded-lg"
                    style={{ backfaceVisibility: 'hidden' }}
                  >
                    <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10" />
                  </motion.div>

                  {/* Back (Revealed) */}
                  <motion.div 
                    initial={false}
                    animate={{ rotateY: card.isFlipped || card.isMatched ? 0 : -180 }}
                    transition={{ duration: 0.4 }}
                    className="absolute inset-0 backface-hidden bg-game-card flex items-center justify-center rounded-lg"
                    style={{ backfaceVisibility: 'hidden' }}
                  >
                    <Icon className={`w-8 h-8 ${COLORS[card.type]}`} />
                  </motion.div>
                </div>
              </motion.button>
            );
          })}
        </AnimatePresence>
      </div>

      {gameOver && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
        >
          <div className="bg-game-card p-8 rounded-2xl border border-game-accent shadow-2xl max-w-sm w-full text-center space-y-6">
            <Trophy className="w-16 h-16 text-yellow-400 mx-auto" />
            <div>
              <h3 className="text-3xl font-bold text-white">Mission Complete!</h3>
              <p className="text-game-muted mt-2">You cleared the field in {moves} moves.</p>
            </div>
            <button
              onClick={initializeGame}
              className="w-full py-3 bg-game-accent hover:bg-blue-600 text-white rounded-xl font-bold transition-colors"
            >
              Deploy Again
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
