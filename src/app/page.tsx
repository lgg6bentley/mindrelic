'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const playSound = () => {
      const sound = document.getElementById('menuSound') as HTMLAudioElement;
      sound?.play();
      window.removeEventListener('click', playSound);
    };

    window.addEventListener('click', playSound);
    return () => window.removeEventListener('click', playSound);
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-zinc-900 via-black to-zinc-950 text-white flex flex-col items-center justify-center px-6 py-12">
      {/* Intro Sound */}
      <audio id="menuSound" src="/sounds/mindrelicmenu.mp3" preload="auto" />

      {/* Title */}
      <h1 className="text-5xl font-bold mb-4 tracking-wide drop-shadow-[0_0_10px_#ff00cc] text-center">
        MindRelic
      </h1>
      <p className="text-center text-base mb-10 max-w-xl text-zinc-400">
        Choose your ritual. Each game encodes its own lore — memory vs strategy, trait vs timing.
      </p>

      {/* Game Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
        {/* Squid Memory Card */}
        <div
          onClick={() => router.push('/squid-memory')}
          className="bg-[#ff00cc] text-black p-6 rounded-xl cursor-pointer hover:scale-105 transition-transform shadow-[0_0_20px_#ff00cc] animate-pulse"
        >
          <div className="flex items-center gap-3 mb-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-6 h-6 text-black"
            >
              <path d="M12 2C9.243 2 7 4.243 7 7v10c0 2.757 2.243 5 5 5s5-2.243 5-5V7c0-2.757-2.243-5-5-5z" />
            </svg>
            <h2 className="text-2xl font-bold">Squid Memory</h2>
          </div>
          <p>Match symbols under pressure. Ritualize your recall.</p>
          <div className="text-xs mt-2">Trait: Focus · Recall · Pattern</div>
        </div>

        {/* Tic Tac Toe Card */}
        <div
          onClick={() => router.push('/tic-tac-toe')}
          className="bg-[#00ffcc] text-black p-6 rounded-xl cursor-pointer hover:scale-105 transition-transform shadow-[0_0_20px_#00ffcc] animate-pulse"
        >
          <div className="flex items-center gap-3 mb-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-6 h-6 text-black"
            >
              <path d="M3 3h6v6H3V3zm6 12H3v6h6v-6zm12-12h-6v6h6V3zm-6 12h6v6h-6v-6z" />
            </svg>
            <h2 className="text-2xl font-bold">Tic Tac Toe</h2>
          </div>
          <p>Classic duel. Encode your moves with mythic intent.</p>
          <div className="text-xs mt-2">Trait: Strategy · Timing · Prediction</div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-12 text-xs tracking-wide text-zinc-500 text-center">
        Founder relics encoded · Rituals active · MindRelic v1.0
      </div>
    </main>
  );
}
