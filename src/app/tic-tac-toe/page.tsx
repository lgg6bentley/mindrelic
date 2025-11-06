'use client';
import { useState, useRef } from 'react';

type Player = 'circle' | 'triangle';
type Cell = Player | null;

const icons: Record<Player, string> = {
  circle: '₩',
  triangle: '🪙',
};

export default function SquidTicTacToe() {
  const [board, setBoard] = useState<Cell[]>(Array(9).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState<Player>('circle');
  const [winner, setWinner] = useState<Player | 'draw' | null>(null);
  const [score, setScore] = useState<{ circle: number; triangle: number }>({ circle: 0, triangle: 0 });
  const [round, setRound] = useState(1);
  const [gameOver, setGameOver] = useState(false);

  const moveSoundRef = useRef<HTMLAudioElement>(null);
  const winSoundRef = useRef<HTMLAudioElement>(null);
  const drawSoundRef = useRef<HTMLAudioElement>(null);

  const handleClick = (index: number) => {
    if (board[index] || winner || gameOver) return;

    // moveSoundRef.current?.play(); 

    const newBoard = [...board];
    newBoard[index] = currentPlayer;
    setBoard(newBoard);

    const result = checkWinner(newBoard);
    if (result) {
      setWinner(result);
      if (result !== 'draw') {
        // winSoundRef.current?.play();
        const updatedScore = { ...score, [result]: score[result] + 1 };
        setScore(updatedScore);

        if (updatedScore[result] === 2) {
          setGameOver(true);
        } else {
          setTimeout(() => nextRound(), 2000);
        }
      } else {
        // drawSoundRef.current?.play();
        setTimeout(() => nextRound(), 2000);
      }
    } else {
      setCurrentPlayer(currentPlayer === 'circle' ? 'triangle' : 'circle');
    }
  };

  const checkWinner = (board: Cell[]): Player | 'draw' | null => {
    const winningLines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6],
    ];

    for (const [a, b, c] of winningLines) {
      const cellA = board[a];
      const cellB = board[b];
      const cellC = board[c];

      if (cellA && cellA === cellB && cellA === cellC) {
        return cellA;
      }
    }

    return board.every(cell => cell !== null) ? 'draw' : null;
  };

  const nextRound = () => {
    setBoard(Array(9).fill(null));
    setCurrentPlayer('circle');
    setWinner(null);
    setRound(prev => prev + 1);
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setCurrentPlayer('circle');
    setWinner(null);
    setScore({ circle: 0, triangle: 0 });
    setRound(1);
    setGameOver(false);
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-900 via-black to-zinc-950 px-4">
      <section className="flex gap-8 w-full max-w-4xl p-6 sm:p-10 rounded-xl border border-green-500 shadow-[0_0_30px_#00ffcc] bg-gradient-to-br from-zinc-900 via-black to-zinc-950 text-center">
        
        {/* Score Panel - Updated score size */}
        <div className="flex flex-col justify-center items-center text-green-300 text-lg font-semibold space-y-6 w-40 border-r border-green-700 pr-4">
          <div>
            ₩ Wins: <span className="text-white **text-2xl**">{score.circle}</span>
          </div>
          <div>
            🪙 Wins: <span className="text-white **text-2xl**">{score.triangle}</span>
          </div>
          <div className="text-sm text-zinc-400">Round {round}</div>
        </div>

        {/* Game Panel */}
        <div className="flex-1 space-y-8 flex flex-col items-center">
          {/* Title - Updated size and shadow */}
          <h2 className="text-green-400 **text-4xl** font-bold tracking-wide **drop-shadow-[0_0_10px_#00ffcc]**">
            Squid Tic Tac Toe
          </h2>

          {/* Game Grid */}
          <div className="grid grid-cols-3 gap-4 justify-center">
            {board.map((cell, i) => (
              <button
                key={i}
                onClick={() => handleClick(i)}
                className={`w-20 h-20 sm:w-28 sm:h-28 text-5xl sm:text-7xl font-bold rounded-lg border transition-all duration-300 hover:scale-105 ${
                  cell === 'circle'
                    ? 'bg-pink-700 border-pink-400 text-white shadow-[0_0_15px_#ff00cc]'
                    : cell === 'triangle'
                    ? 'bg-green-700 border-green-400 text-white shadow-[0_0_15px_#00ffcc]'
                    : 'bg-black border-zinc-700 text-zinc-700 hover:border-green-500'
                }`}
              >
                {cell ? icons[cell] : ''}
              </button>
            ))}
          </div>

          {/* Winner Message */}
          {winner && (
            <div className="space-y-2 animate-pulse">
              <p className="text-yellow-300 text-xl font-semibold">
                {winner === 'draw' ? 'It’s a draw!' : `${icons[winner]} wins this round!`}
              </p>
              {!gameOver && (
                <p className="text-zinc-400 text-sm">Next round starting...</p>
              )}
            </div>
          )}

          {/* Game Over Message */}
          {gameOver && (
            <div className="space-y-4">
              <p className="text-yellow-300 text-xl font-semibold animate-pulse">
                {score.circle === 2 ? '₩ wins the game!' : '🪙 wins the game!'}
              </p>
              <button
                onClick={resetGame}
                className="bg-yellow-300 text-black px-6 py-3 rounded hover:bg-yellow-400 transition font-bold text-lg"
              >
                Play Again
              </button>
            </div>
          )}

          {/* Turn Indicator */}
          {!winner && !gameOver && (
            <p className="text-zinc-400 text-md">
              Current turn:{' '}
              <span className="text-white font-bold text-xl animate-pulse">
                {icons[currentPlayer]}
              </span>
            </p>
          )}
        </div>
      </section>

      {/* Sound Effects */}
      <audio ref={moveSoundRef} src="/sounds/moveSound.mp3" preload="auto" />
      <audio ref={winSoundRef} src="/sounds/winSound.mp3" preload="auto" />
      <audio ref={drawSoundRef} src="/sounds/drawSound.mp3" preload="auto" />
    </main>
  );
}
