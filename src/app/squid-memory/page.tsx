'use client';
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const symbols = ['◯', '△', '□', '💀', '🎮', '🪙', '🔺', '🟥', '🟢', '👁️', '₩', '🧠'];
type Difficulty = 'Easy' | 'Medium' | 'Hard';

const getSymbolPool = (difficulty: Difficulty) => {
  if (difficulty === 'Easy') return symbols.slice(0, 6);      // 6 symbols × 2 = 12 cards
  return symbols.slice(0, 12);                                 // 12 symbols × 2 = 24 cards
};

const generateDeck = (difficulty: Difficulty) => {
  const pool = getSymbolPool(difficulty);
  const deck = [...pool, ...pool];
  return deck.sort(() => Math.random() - 0.5);
};

export default function SquidMemoryGame({ activeGame }: { activeGame?: string }) {
  const [difficulty, setDifficulty] = useState<Difficulty>('Hard');
  const [deck, setDeck] = useState<string[]>([]);
  const [startGame, setStartGame] = useState(false);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const [attempts, setAttempts] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [vipMessage, setVipMessage] = useState<string | null>(null);
  const [lockBoard, setLockBoard] = useState(false);
  const [showFrontman, setShowFrontman] = useState(false);

  const matchSoundRef = useRef<HTMLAudioElement>(null);
  const errorSoundRef = useRef<HTMLAudioElement>(null);

  const [countdownActive, setCountdownActive] = useState(false);
const [countdownValue, setCountdownValue] = useState(3);

  useEffect(() => {
    if (activeGame === 'memory-match') handleReset();
  }, [activeGame]);

  useEffect(() => {
    if (startGame) setDeck(generateDeck(difficulty));
  }, [startGame, difficulty]);

  useEffect(() => {
    if (!startTime) return;
    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  useEffect(() => {
    if (flipped.length === 2) {
      const [first, second] = flipped;
      setLockBoard(true);
      setAttempts(prev => prev + 1);

      if (deck[first] === deck[second]) {
        setMatched(prev => [...prev, first, second]);
        matchSoundRef.current?.play();
      } else {
        errorSoundRef.current?.play();
      }

      setTimeout(() => {
        setFlipped([]);
        setLockBoard(false);
      }, 1000);
    }
  }, [flipped, deck]);

  useEffect(() => {
    if (matched.length === deck.length && deck.length > 0) {
      const duration = ((Date.now() - (startTime ?? Date.now())) / 1000).toFixed(1);
      setVipMessage(`VIP Alert: All pairs matched in ${attempts} attempts over ${duration} seconds.`);
    }
  }, [matched, deck.length, startTime, attempts]);

  useEffect(() => {
  const interval = setInterval(() => {
    if (Math.random() < 0.5) {
      setShowFrontman(true);
      setTimeout(() => setShowFrontman(false), 1500);
    }
  }, 2000);
  return () => clearInterval(interval);
}, []);

  const handleFlip = (index: number) => {
    if (lockBoard || flipped.includes(index) || matched.includes(index) || flipped.length >= 2) return;
    if (!startTime) setStartTime(Date.now());
    setFlipped(prev => [...prev, index]);
  };

  const handleReset = () => {
    setStartGame(false);
    setDeck([]);
    setFlipped([]);
    setMatched([]);
    setAttempts(0);
    setElapsedTime(0);
    setVipMessage(null);
    setLockBoard(false);
    setStartTime(null);
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-zinc-900 via-black to-zinc-950 text-white px-4">
  <section className="w-full max-w-md text-center space-y-10">
    {/* Title */}
    <h1 className="text-3xl font-bold text-pink-400 drop-shadow-[0_0_6px_#ff00cc]">
      Squid Memory Match
    </h1>

    {/* Lore Intro */}
<div className="space-y-4 mt-6 text-center">
  <motion.p
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 1 }}
    className="text-sm text-zinc-400 italic"
  >
    Choose your path. Each trait reveals a different memory trial. Only the worthy ascend.
  </motion.p>

  {/* Trait Selector Grid */}
  <div className="grid grid-cols-3 gap-4">
    {[
      {
        label: 'Logic',
        color: 'blue',
        traits: ['◯', '△', '□'],
        lore: 'Precision and pattern. Match with reason.',
      },
      {
        label: 'Danger',
        color: 'red',
        traits: ['💀', '🔺', '🟥'],
        lore: 'Chaos and risk. Match under pressure.',
      },
      {
        label: 'Crypto',
        color: 'yellow',
        traits: ['🪙', '₩', '🧠'],
        lore: 'Value and volatility. Match with intuition.',
      },
    ].map(({ label, color, traits, lore }) => (
      <motion.button
        key={label}
        onClick={() => setDifficulty(label as Difficulty)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`border-2 rounded-lg p-4 text-sm font-bold shadow-md bg-black border-${color}-500 hover:border-pink-500 ${
          difficulty === label
            ? `shadow-[0_0_12px_#${color === 'red' ? 'ff0000' : color === 'blue' ? '00ccff' : 'ffd700'}]`
            : ''
        }`}
      >
        <div className={`text-xl mb-2 text-${color}-400`}>{label}</div>
        <div className="flex justify-center gap-2 text-2xl mb-2">
          {traits.map((t, i) => (
            <span key={i}>{t}</span>
          ))}
        </div>
        <p className="text-xs text-zinc-500 italic">{lore}</p>
      </motion.button>
    ))}
  </div>
</div>

{/* Ceremonial Countdown Start Button */}
{!startGame && !countdownActive && (
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.8 }}
    className="mt-8 flex flex-col items-center"
  >
    <motion.button
      onClick={() => {
        setCountdownActive(true);
        setCountdownValue(3);
        let count = 3;
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
      }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="px-6 py-3 bg-gradient-to-r from-pink-600 to-red-600 text-white font-bold rounded-full shadow-lg border border-pink-400"
    >
      Begin the Ritual
    </motion.button>
  </motion.div>
)}

{/* Dynamic Countdown Display */}
{countdownActive && (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.5 }}
    className="mt-4 text-2xl font-bold text-pink-400 animate-pulse"
  >
    Memory trial begins in {countdownValue}...
  </motion.div>
)}
        {/* Card Grid */}
        {startGame && (
          <div className="relative">
            <div className="mx-auto max-w-[360px] sm:max-w-[600px] px-2">
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {deck.map((symbol, idx) => {
                  const isFlipped = flipped.includes(idx);
                  const isMatched = matched.includes(idx);
                  const showSymbol = isFlipped || isMatched;

                  return (
                    <button
                      key={idx}
                      onClick={() => handleFlip(idx)}
                      className={`relative w-full aspect-square min-w-0 rounded-lg border overflow-hidden transition-all duration-300 ${
                        isMatched
                          ? 'bg-green-700 border-green-400 shadow-[0_0_15px_#00ffcc]'
                          : isFlipped
                          ? 'bg-pink-700 border-pink-400 shadow-[0_0_15px_#ff00cc]'
                          : 'bg-black border-zinc-700 hover:border-pink-500'
                      }`}
                    >
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: showSymbol ? 1 : 0 }}
                        transition={{ duration: 0.4 }}
                        className="absolute inset-0 flex items-center justify-center pointer-events-none"
                      >
                        <span className="text-xl sm:text-2xl font-bold text-white">{symbol}</span>
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 1 }}
                        animate={{ opacity: showSymbol ? 0 : 1 }}
                        transition={{ duration: 0.4 }}
                        className="absolute inset-0 flex items-center justify-center pointer-events-none"
                      >
                        <span className="text-xl sm:text-2xl font-bold text-zinc-700">?</span>
                      </motion.div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Frontman Distraction */}
            {showFrontman && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 2 }}
                className="absolute inset-0 flex items-center justify-center pointer-events-none z-50"
              >
                <img
                  src="/images/front-man.png"
                  alt="Frontman"
                  className="w-40 h-40 animate-pulse drop-shadow-[0_0_20px_red]"
                />
              </motion.div>
            )}

            {/* Win Banner */}
             {vipMessage && (
                            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 bg-black bg-opacity-90 flex flex-col items-center justify-center text-center p-6 rounded-lg z-40"
              >
                <h3 className="text-2xl text-yellow-400 font-bold mb-4">{vipMessage}</h3>
                <button
                  onClick={handleReset}
                  className="mt-4 bg-yellow-400 hover:bg-yellow-500 text-black px-4 py-2 rounded shadow-md text-sm font-semibold"
                >
                  Play Again
                </button>
              </motion.div>
            )}
          </div>
        )}
      </section>

      {/* Sound Effects */}
      <audio ref={matchSoundRef} src="/sounds/match.mp3" preload="auto" />
      <audio ref={errorSoundRef} src="/sounds/error.mp3" preload="auto" />
    </main>
  );
}