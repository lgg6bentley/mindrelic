'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// --- GAME CONSTANTS ---
const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;
const PADDLE_HEIGHT = 100;
const PADDLE_WIDTH = 15;
const BALL_SIZE = 15;
const INITIAL_BALL_SPEED = 6;
const PADDLE_SPEED = 8;
const MAX_SCORE = 5;

// Utility function to clamp a value between a min and max
const clamp = (num: number, min: number, max: number) => Math.max(min, Math.min(num, max));

// --- Sub-Component: Game Element (Paddle or Ball) ---
interface ElementProps {
  x: number;
  y: number;
  width: number;
  height: number;
  className: string;
}

const GameElement: React.FC<ElementProps> = ({ x, y, width, height, className }) => (
  <motion.div
    className={`absolute rounded-full ${className}`}
    style={{
      width: width,
      height: height,
      left: x,
      top: y,
    }}
    // No animation here, controlled by state/game loop for physics accuracy
  />
);

// --- Main Component: AetherPong ---
const AetherPong: React.FC = () => {
  // Game State
  const [score, setScore] = useState({ player: 0, ai: 0 });
  const [paddleY, setPaddleY] = useState(GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2); // Player Paddle Y
  const [aiPaddleY, setAiPaddleY] = useState(GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2); // AI Paddle Y
  const [ball, setBall] = useState({ 
    x: GAME_WIDTH / 2 - BALL_SIZE / 2, 
    y: GAME_HEIGHT / 2 - BALL_SIZE / 2, 
    vx: INITIAL_BALL_SPEED, 
    vy: INITIAL_BALL_SPEED, 
  });
  const [gameState, setGameState] = useState<'IDLE' | 'RUNNING' | 'PAUSED' | 'OVER'>('IDLE');
  const [message, setMessage] = useState('Press START to enter the Aether Grid.');

  // Ref for the game loop to manage animation frame
  const animationRef = useRef<number | undefined>(undefined);
  const lastTimeRef = useRef<number>(0);
  const gameAreaRef = useRef<HTMLDivElement>(null);

  // --- Game Initialization & Reset ---
  const resetBall = useCallback((xDirection: number) => {
    setBall({
      x: GAME_WIDTH / 2 - BALL_SIZE / 2,
      y: GAME_HEIGHT / 2 - BALL_SIZE / 2,
      vx: xDirection * INITIAL_BALL_SPEED,
      vy: (Math.random() > 0.5 ? 1 : -1) * (Math.random() * 2 + INITIAL_BALL_SPEED / 2),
    });
  }, []);

  const startGame = useCallback(() => {
    if (gameState === 'RUNNING') return;
    if (gameState === 'OVER') setScore({ player: 0, ai: 0 });
    
    // Randomize initial serve direction
    const initialDirection = Math.random() > 0.5 ? 1 : -1;
    resetBall(initialDirection);
    setGameState('RUNNING');
    setMessage('GAME ACTIVE');
  }, [gameState, resetBall]);

  // --- AI Logic ---
  const updateAIPaddle = useCallback((deltaTime: number) => {
    // Simple AI: Follows the ball with a slight delay/inaccuracy
    const targetY = ball.y + BALL_SIZE / 2 - PADDLE_HEIGHT / 2;
    const speed = PADDLE_SPEED * 0.75 * deltaTime; // AI is slightly slower and scaled by deltaTime

    let newAiY = aiPaddleY;
    if (targetY > aiPaddleY) {
      newAiY += speed;
    } else if (targetY < aiPaddleY) {
      newAiY -= speed;
    }

    setAiPaddleY(clamp(newAiY, 0, GAME_HEIGHT - PADDLE_HEIGHT));
  }, [aiPaddleY, ball.y]);

  // --- Collision Detection & Physics ---
  const updateBallPhysics = useCallback((deltaTime: number) => {
    let { x, y, vx, vy } = ball;

    // Time-based movement for smooth, frame-rate independent physics
    x += vx * deltaTime;
    y += vy * deltaTime;
    let newVx = vx;
    let newVy = vy;

    // Wall Collision (Top/Bottom)
    if (y < 0 || y > GAME_HEIGHT - BALL_SIZE) {
      newVy = -vy;
      y = clamp(y, 0, GAME_HEIGHT - BALL_SIZE); // Clamp to prevent sticking
    }

    // Player Paddle Collision (Left Side)
    const playerPaddleX = PADDLE_WIDTH;
    if (x < playerPaddleX + PADDLE_WIDTH && y + BALL_SIZE > paddleY && y < paddleY + PADDLE_HEIGHT && vx < 0) {
      newVx = -vx * 1.05; // Increase speed slightly (10% boost)
      newVy += (y + BALL_SIZE / 2 - (paddleY + PADDLE_HEIGHT / 2)) * 0.3; // Angle reflection based on hit point
      newVx = clamp(newVx, -20, 20); // Cap max speed
      x = playerPaddleX + PADDLE_WIDTH; // Push ball out of paddle
    }

    // AI Paddle Collision (Right Side)
    const aiPaddleX = GAME_WIDTH - PADDLE_WIDTH * 2;
    if (x > aiPaddleX && y + BALL_SIZE > aiPaddleY && y < aiPaddleY + PADDLE_HEIGHT && vx > 0) {
      newVx = -vx * 1.05; // Increase speed slightly
      newVy += (y + BALL_SIZE / 2 - (aiPaddleY + PADDLE_HEIGHT / 2)) * 0.3; // Angle reflection
      newVx = clamp(newVx, -20, 20); // Cap max speed
      x = aiPaddleX; // Push ball out of paddle
    }
    
    // Scoring (Goal)
    if (x < 0) {
      setScore(prev => {
        const newScore = { ...prev, ai: prev.ai + 1 };
        if (newScore.ai >= MAX_SCORE) {
          setMessage(`RITUAL FAILED. AI WINS ${newScore.ai}-${newScore.player}`);
          setGameState('OVER');
        } else {
          setMessage('AI Scored! Serving back...');
          resetBall(1); // Serve to player
        }
        return newScore;
      });
      return;
    }
    
    if (x > GAME_WIDTH - BALL_SIZE) {
      setScore(prev => {
        const newScore = { ...prev, player: prev.player + 1 };
        if (newScore.player >= MAX_SCORE) {
          setMessage(`RELIC ACQUIRED! PLAYER WINS ${newScore.player}-${newScore.ai}`);
          setGameState('OVER');
        } else {
          setMessage('Player Scored! Serving back...');
          resetBall(-1); // Serve to AI
        }
        return newScore;
      });
      return;
    }

    setBall({ x, y, vx: newVx, vy: newVy });
    updateAIPaddle(deltaTime); // Update AI after ball moves
  }, [ball, paddleY, aiPaddleY, resetBall, updateAIPaddle]);

  // --- Game Loop (requestAnimationFrame) ---
  const gameLoop = useCallback((currentTime: number) => {
    if (gameState === 'RUNNING') {
      const deltaTime = (currentTime - lastTimeRef.current) / (1000 / 60); // Time factor relative to 60fps
      
      if (lastTimeRef.current > 0) {
        // Run physics and AI only if delta is valid
        updateBallPhysics(deltaTime);
      }
    }
    
    // Schedule next frame
    lastTimeRef.current = currentTime;
    animationRef.current = requestAnimationFrame(gameLoop);
  }, [gameState, updateBallPhysics]);

  // Start/Stop Game Loop Effect
  useEffect(() => {
    if (gameState === 'RUNNING') {
      lastTimeRef.current = performance.now(); // Reset timer for smoother start
      animationRef.current = requestAnimationFrame(gameLoop);
    } else {
      cancelAnimationFrame(animationRef.current as number);
    }

    return () => {
      cancelAnimationFrame(animationRef.current as number);
    };
  }, [gameState, gameLoop]);

  // --- Input Handlers (Keyboard and Touch/Mouse) ---
  useEffect(() => {
    if (gameState !== 'RUNNING') return;

    // Keyboard Input (W/S)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'w' || e.key === 'W') {
        setPaddleY(prev => clamp(prev - PADDLE_SPEED * 10, 0, GAME_HEIGHT - PADDLE_HEIGHT));
      } else if (e.key === 's' || e.key === 'S') {
        setPaddleY(prev => clamp(prev + PADDLE_SPEED * 10, 0, GAME_HEIGHT - PADDLE_HEIGHT));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState]);

  // Touch/Mouse Input (Follow touch/mouse Y position)
  const handleTouchMove = useCallback((clientY: number) => {
    if (gameState !== 'RUNNING' || !gameAreaRef.current) return;
    
    const rect = gameAreaRef.current.getBoundingClientRect();
    
    // Map client Y position to game area Y position
    const gameY = clientY - rect.top;
    
    // Center paddle on touch point and clamp
    const newPaddleY = clamp(
      gameY - (PADDLE_HEIGHT * (rect.height / GAME_HEIGHT)) / 2, // Adjust for responsive height
      0, 
      rect.height - (PADDLE_HEIGHT * (rect.height / GAME_HEIGHT))
    ) * (GAME_HEIGHT / rect.height); // Rescale back to game coordinates

    setPaddleY(newPaddleY);
  }, [gameState]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    handleTouchMove(e.clientY);
  }, [handleTouchMove]);

  const handleTouch = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    // Prevent scrolling
    e.preventDefault(); 
    handleTouchMove(e.touches[0].clientY);
  }, [handleTouchMove]);

  // --- Rendering ---
  const isGameOver = gameState === 'OVER';
  const aspectRatio = GAME_WIDTH / GAME_HEIGHT;
  
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-zinc-950 text-white p-4 font-mono">
      <h1 className="text-4xl font-extrabold text-[#00aaff] drop-shadow-[0_0_15px_#00aaff] mb-4 tracking-wider uppercase">
        Aether Pong
      </h1>
      
      {/* Scoreboard */}
      <motion.div 
        className="flex justify-between w-full max-w-xl p-3 bg-zinc-900 border border-zinc-700 rounded-xl mb-6 shadow-xl"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="text-center w-1/2">
          <div className="text-xs text-zinc-400 uppercase tracking-widest">Player (W/S)</div>
          <motion.div 
            className={`text-4xl font-bold ${score.player > score.ai ? 'text-green-400' : 'text-zinc-500'}`}
            key={score.player} // Key for animation on score change
            initial={{ scale: 1.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          >
            {score.player}
          </motion.div>
        </div>
        <div className="text-center w-1/2 border-l border-zinc-700">
          <div className="text-xs text-zinc-400 uppercase tracking-widest">AI Warden</div>
          <motion.div 
            className={`text-4xl font-bold ${score.ai > score.player ? 'text-red-400' : 'text-zinc-500'}`}
            key={score.ai}
            initial={{ scale: 1.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          >
            {score.ai}
          </motion.div>
        </div>
      </motion.div>

      {/* Game Area */}
      <motion.div
        ref={gameAreaRef}
        className="relative bg-black border-4 border-[#00aaff] shadow-[0_0_25px_#00aaff80] cursor-none"
        style={{
          width: '90vw', // Fluid width
          maxWidth: `${GAME_WIDTH}px`,
          height: `calc(90vw / ${aspectRatio})`, // Aspect ratio locked height
          maxHeight: `${GAME_HEIGHT}px`,
        }}
        // Enable mouse and touch control on the game area
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouch}
        onTouchStart={handleTouch}
      >
        {/* Game Elements are rendered in percentages based on the container size */}
        <div className="absolute inset-0">
          <div className="absolute left-1/2 top-0 w-1 h-full bg-[#00aaff40] transform -translate-x-1/2">
             {/* Center Line (Aether Grid Marker) */}
          </div>
          
          {/* Player Paddle */}
          <GameElement
            x={PADDLE_WIDTH}
            y={paddleY}
            width={PADDLE_WIDTH}
            height={PADDLE_HEIGHT}
            className="bg-white shadow-[0_0_10px_#fff,0_0_20px_#fff] z-10"
          />

          {/* AI Paddle */}
          <GameElement
            x={GAME_WIDTH - PADDLE_WIDTH * 2}
            y={aiPaddleY}
            width={PADDLE_WIDTH}
            height={PADDLE_HEIGHT}
            className="bg-red-500 shadow-[0_0_10px_#ff0000,0_0_20px_#ff0000] z-10"
          />

          {/* Ball */}
          <GameElement
            x={ball.x}
            y={ball.y}
            width={BALL_SIZE}
            height={BALL_SIZE}
            className="bg-[#00aaff] shadow-[0_0_10px_#00aaff,0_0_20px_#00aaff] rounded-full z-20"
          />
        </div>
        
        {/* Overlay for Start/Game Over */}
        {(gameState !== 'RUNNING' || isGameOver) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center p-6"
          >
            <p className={`text-xl font-semibold mb-4 ${isGameOver ? (score.player > score.ai ? 'text-green-400' : 'text-red-400') : 'text-zinc-300'}`}>
              {message}
            </p>
            <motion.button
              onClick={startGame}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="mt-4 px-6 py-3 bg-[#00aaff] text-zinc-900 font-bold rounded-full shadow-lg border border-white hover:bg-[#00d0ff] transition-colors"
            >
              {gameState === 'OVER' ? 'Re-Enter Aether' : 'START'}
            </motion.button>
            <p className="mt-4 text-xs text-zinc-500">
                Controls: Keyboard (W/S) or Mouse/Touch move on the game screen.
            </p>
          </motion.div>
        )}
      </motion.div>
    </main>
  );
};

export default AetherPong;