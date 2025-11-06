'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Defined symbol pools for each difficulty/trait
const LOGIC_SYMBOLS = ['◯', '△', '□', '⬟', '⭐', '◫']; // 6 symbols (12 cards)
const DANGER_SYMBOLS = ['💀', '🔺', '🟥', '🦠', '💥', '🔥', '🔪', '⛓️', '⚰️']; // 9 symbols (18 cards)
const CRYPTO_SYMBOLS = ['🪙', '₩', '🧠', '⚙️', '💎', '🔗', '🌐', '📡', '🔢', '⚛️', '🧬', '👁️']; // 12 symbols (24 cards)

type Trait = 'Logic' | 'Danger' | 'Crypto';

const getSymbolPool = (trait: Trait) => {
  if (trait === 'Logic') return LOGIC_SYMBOLS;
  if (trait === 'Danger') return DANGER_SYMBOLS;
  return CRYPTO_SYMBOLS;
};

const generateDeck = (trait: Trait) => {
  const pool = getSymbolPool(trait);
  const deck = [...pool, ...pool];
  return deck.sort(() => Math.random() - 0.5);
};

// --- Sub-Component: Card ---
interface CardProps {
  symbol: string;
  index: number;
  isFlipped: boolean;
  isMatched: boolean;
  onClick: (index: number) => void;
}

const Card = ({ symbol, index, isFlipped, isMatched, onClick }: CardProps) => {
  const rotation = isFlipped || isMatched ? 180 : 0;
  
  return (
    <motion.button
      onClick={() => onClick(index)}
      className={`relative w-full aspect-square min-w-0 rounded-lg overflow-hidden cursor-pointer p-1 perspective-1000 ${
        isMatched 
        ? 'shadow-[0_0_15px_#00ffcc] pointer-events-none'
        : 'hover:shadow-[0_0_10px_#ff00cc] transition-shadow duration-200'
      }`}
      disabled={isMatched}
      style={{
        transformStyle: 'preserve-3d',
        transition: 'transform 0.6s',
      }}
    >
      <motion.div
        className="relative w-full h-full"
        animate={{ rotateY: rotation }}
        transition={{ duration: 0.6 }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Card Back */}
        <div 
          className="absolute inset-0 bg-zinc-800 border-2 border-pink-500 backface-hidden flex items-center justify-center rounded-lg"
        >
          <span className="text-2xl sm:text-3xl font-bold text-zinc-500">?</span>
        </div>

        {/* Card Face */}
        <div 
          className={`absolute inset-0 backface-hidden flex items-center justify-center rounded-lg transform rotateY-180 transition-all duration-300 ${
            isMatched 
            ? 'bg-green-700/80 border-green-400'
            : 'bg-zinc-900 border-pink-400 shadow-[0_0_10px_#ff00cc]'
          }`}
        >
          <motion.span
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 300 }}
            className="text-4xl sm:text-5xl font-bold text-white"
          >
            {symbol}
          </motion.span>
        </div>
      </motion.div>
    </motion.button>
  );
};

// --- Main Component ---
export default function SquidMemoryGame() {
  const [trait, setTrait] = useState<Trait>('Crypto'); // Default to hardest
  const [deck, setDeck] = useState<string[]>([]);
  const [startGame, setStartGame] = useState(false);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const [attempts, setAttempts] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [vipMessage, setVipMessage] = useState<string | null>(null);
  const [lockBoard, setLockBoard] = useState(false);
  const [showDistraction, setShowDistraction] = useState(false);
  const [countdownActive, setCountdownActive] = useState(false);
  const [countdownValue, setCountdownValue] = useState(3);

  // Sound Refs (assumes assets are in /public/sounds)
  const matchSoundRef = useRef<HTMLAudioElement>(null);
  const errorSoundRef = useRef<HTMLAudioElement>(null);

  const handleReset = useCallback(() => {
    setStartGame(false);
    setDeck([]);
    setFlipped([]);
    setMatched([]);
    setAttempts(0);
    setElapsedTime(0);
    setVipMessage(null);
    setLockBoard(false);
    setStartTime(null);
    setCountdownActive(false);
    setCountdownValue(3);
  }, []);

  // 1. Game Setup Effect (Generate deck when starting or changing trait)
  useEffect(() => {
    if (startGame) {
      setDeck(generateDeck(trait));
    }
  }, [startGame, trait]);

  // 2. Timer Effect
  useEffect(() => {
    if (!startTime || matched.length === deck.length && deck.length > 0) return;
    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime, matched.length, deck.length]);

  // 3. Match Checking Logic
  useEffect(() => {
    if (flipped.length === 2) {
      const [first, second] = flipped;
      setLockBoard(true);
      setAttempts(prev => prev + 1);

      if (deck[first] === deck[second]) {
        // Match Found
        matchSoundRef.current?.play();
        setMatched(prev => [...prev, first, second]);
        // Delay clearing flipped to show both cards momentarily
        setTimeout(() => {
          setFlipped([]);
          setLockBoard(false);
        }, 800); 
      } else {
        // No Match
        errorSoundRef.current?.play();
        setTimeout(() => {
          setFlipped([]);
          setLockBoard(false);
        }, 1200); // Slightly longer delay for mismatch penalty
      }
    }
  }, [flipped, deck]);

  // 4. Game Win Condition
  useEffect(() => {
    if (matched.length === deck.length && deck.length > 0) {
      const duration = ((Date.now() - (startTime ?? Date.now())) / 1000).toFixed(1);
      setVipMessage(`Relic Attained! Matched all ${deck.length / 2} pairs in ${attempts} attempts over ${duration} seconds.`);
    }
  }, [matched, deck.length, startTime, attempts]);

  // 5. Distraction Effect (Disturbing Noise/Pattern)
  useEffect(() => {
    if (!startGame || vipMessage) return;
    const interval = setInterval(() => {
      if (Math.random() < 0.4) { // 40% chance every 4 seconds
        setShowDistraction(true);
        setTimeout(() => setShowDistraction(false), 1000); // Flash distraction for 1 second
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [startGame, vipMessage]);

  // 6. Countdown Logic
  const startCountdown = () => {
    handleReset(); // Ensure reset before starting countdown
    setCountdownActive(true);
    let count = 3;
    setCountdownValue(count);
    
    const countdownInterval = setInterval(() => {
      count -= 1;
      setCountdownValue(count);
      if (count === 0) {
        clearInterval(countdownInterval);
        setStartGame(true);
        setStartTime(Date.now());
        setCountdownActive(false);
      }
    }, 1000);
  };

  const handleFlip = (index: number) => {
    if (lockBoard || flipped.includes(index) || matched.includes(index) || flipped.length >= 2 || !startGame) return;
    if (!startTime) setStartTime(Date.now());
    setFlipped(prev => [...prev, index]);
  };

  const cardGridClasses = {
    'Logic': 'grid-cols-4 sm:grid-cols-6', // 12 cards
    'Danger': 'grid-cols-3 sm:grid-cols-6', // 18 cards, requires adjusting the layout
    'Crypto': 'grid-cols-4 sm:grid-cols-6', // 24 cards
  };

  const currentSymbols = getSymbolPool(trait);
  const cardCount = currentSymbols.length * 2;
  // Dynamic grid setup for better responsiveness based on card count
  const getDynamicGridClass = (count: number) => {
      // 12 Cards (Logic): 4x3 layout
      if (count === 12) return "grid-cols-4 gap-2 sm:grid-cols-4 sm:gap-3 max-w-[400px]"; 
      // 18 Cards (Danger): 6x3 layout 
      if (count === 18) return "grid-cols-4 gap-2 sm:grid-cols-6 sm:gap-3 max-w-[500px]"; 
      // 24 Cards (Crypto): 6x4 layout (Max 6 cols on sm for speed)
      if (count === 24) return "grid-cols-4 gap-2 sm:grid-cols-6 sm:gap-2 max-w-[550px]"; 
      return "grid-cols-4 gap-2 max-w-[400px]";
  };
  
  const currentGridClass = getDynamicGridClass(deck.length);

  return (
    <main className="min-h-screen flex flex-col items-center justify-start py-12 bg-gradient-to-br from-zinc-900 via-black to-zinc-950 text-white px-4">
      <section className="w-full max-w-5xl text-center space-y-8">
        {/* Title */}
        <h1 className="text-4xl font-extrabold text-[#ff00cc] drop-shadow-[0_0_15px_#ff00cc] tracking-tight">
          SQUID MEMORY RITUAL
        </h1>

        {/* Game Stats & Info */}
        <div className="flex justify-center w-full max-w-lg mx-auto bg-zinc-800/50 p-3 rounded-xl border border-zinc-700 shadow-xl">
          <div className="flex-1">
            <div className="text-xs text-zinc-400 uppercase tracking-wider">Time</div>
            <div className="text-2xl font-mono text-[#00ffcc]">{elapsedTime.toString().padStart(2, '0')}s</div>
          </div>
          <div className="flex-1 border-x border-zinc-700/50">
            <div className="text-xs text-zinc-400 uppercase tracking-wider">Attempts</div>
            <div className="text-2xl font-mono text-pink-400">{attempts}</div>
          </div>
          <div className="flex-1">
            <div className="text-xs text-zinc-400 uppercase tracking-wider">Trait</div>
            <div className="text-xl font-bold text-white">{trait}</div>
          </div>
        </div>

        {/* Trait Selector Grid */}
        {!startGame && !countdownActive && (
          <div className="p-4 bg-zinc-900/50 rounded-xl max-w-lg mx-auto">
            <p className="text-sm text-zinc-400 italic mb-4">
              Choose your Relic Trait to begin the cognitive trial:
            </p>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Logic' as Trait, color: 'blue', cards: 12, lore: 'Precision & Pattern: Minimal distractions, moderate cards.' },
                { label: 'Danger' as Trait, color: 'red', cards: 18, lore: 'Chaos & Risk: Medium complexity, higher chance of distraction.' },
                { label: 'Crypto' as Trait, color: 'yellow', cards: 24, lore: 'Value & Volatility: Maximum complexity and cognitive load.' },
              ].map(({ label, color, cards, lore }) => (
                <motion.button
                  key={label}
                  onClick={() => setTrait(label)}
                  whileHover={{ scale: 1.05, boxShadow: `0 0 20px rgba(var(--color-${color}), 0.6)` }}
                  whileTap={{ scale: 0.95 }}
                  className={`border-2 rounded-xl p-3 text-sm font-bold transition-all duration-300 ${
                    trait === label
                      ? `border-white bg-gradient-to-br from-zinc-700 to-black shadow-[0_0_15px_var(--shadow-color)]`
                      : `border-zinc-700 bg-zinc-900/70 hover:border-pink-500/50`
                  }`}
                  style={{
                    '--shadow-color': label === 'Logic' ? '#00ccff' : label === 'Danger' ? '#ff0000' : '#ffcc00'
                  } as React.CSSProperties}
                >
                  <div className={`text-xl mb-1 text-${color}-400`}>{label}</div>
                  <div className="text-xs text-zinc-500 italic">{cards} Cards</div>
                  <p className="text-xs text-zinc-600 mt-1 hidden sm:block">{lore}</p>
                </motion.button>
              ))}
            </div>
            <motion.button
              onClick={startCountdown}
              className="mt-6 px-8 py-3 bg-gradient-to-r from-pink-600 to-red-600 text-white font-extrabold rounded-full shadow-lg border border-pink-400 hover:scale-[1.02] transition-transform"
            >
              Begin Ritual ($$$)
            </motion.button>
          </div>
        )}

        {/* Dynamic Countdown Display */}
        {countdownActive && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="mt-6 text-5xl font-extrabold text-[#ff00cc] animate-pulse"
          >
            {countdownValue > 0 ? countdownValue : 'START!'}
          </motion.div>
        )}
        
        {/* Card Grid */}
        {startGame && (
          <div className="relative mx-auto" style={{maxWidth: '800px'}}>
            <div className={`grid ${currentGridClass} mx-auto transition-all duration-500`}>
              {deck.map((symbol, idx) => (
                <Card
                  key={idx}
                  index={idx}
                  symbol={symbol}
                  isFlipped={flipped.includes(idx) || matched.includes(idx)}
                  isMatched={matched.includes(idx)}
                  onClick={handleFlip}
                />
              ))}
            </div>

            {/* Distraction Overlay (Replaces Frontman Image) */}
            <AnimatePresence>
              {showDistraction && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.1 }}
                  className="absolute inset-0 flex items-center justify-center pointer-events-none z-50 backdrop-blur-[1px]"
                >
                  <motion.div
                    initial={{ scale: 0, rotate: 0 }}
                    animate={{ scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 0.8, repeat: Infinity, repeatType: 'reverse' }}
                    className="text-9xl drop-shadow-[0_0_20px_#ff0000] text-red-700 select-none"
                  >
                    !
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Win Banner */}
            {vipMessage && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, type: 'spring' }}
                className="absolute inset-0 bg-black bg-opacity-95 flex flex-col items-center justify-center text-center p-6 rounded-lg z-40"
              >
                <h3 className="text-4xl text-yellow-400 font-extrabold mb-4 drop-shadow-[0_0_10px_#ffcc00]">
                  {vipMessage}
                </h3>
                <motion.button
                  onClick={handleReset}
                  whileHover={{ scale: 1.1, rotate: 1 }}
                  whileTap={{ scale: 0.9 }}
                  className="mt-6 bg-yellow-400 hover:bg-yellow-500 text-black px-6 py-3 rounded-full shadow-lg text-lg font-bold transition-all"
                >
                  Begin New Ritual
                </motion.button>
              </motion.div>
            )}
          </div>
        )}
      </section>

      {/* Sound Effects (Assuming assets exist) */}
      <audio ref={matchSoundRef} src="/sounds/match.mp3" preload="auto" />
      <audio ref={errorSoundRef} src="/sounds/error.mp3" preload="auto" />
    </main>
  );
}
