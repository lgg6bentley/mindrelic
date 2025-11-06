'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link'; // Import Link for internal navigation

// --- Component: GameCard ---
interface GameCardProps {
  title: string;
  href: string;
  description: string;
  traits: string;
  bgColor: string;
  shadowColor: string;
  iconPath: string; // SVG path or a simple icon indicator
}

const GameCard = ({ title, href, description, traits, bgColor, shadowColor, iconPath }: GameCardProps) => {
  const router = useRouter();
  return (
    <div
      onClick={() => router.push(href)}
      className={`${bgColor} text-black p-6 rounded-xl cursor-pointer hover:scale-[1.03] transition-transform duration-300 shadow-[0_0_20px_var(${shadowColor})]`}
      style={{
          '--shadow-color': shadowColor,
          animation: 'pulse 3s infinite',
      } as React.CSSProperties} // Cast required for CSS variables in React style object
    >
      <div className="flex items-center gap-3 mb-2">
        {/* Placeholder SVG Icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-6 h-6 text-black"
        >
          {/* Using the iconPath prop for the main icon shape */}
          <path d={iconPath} />
        </svg>
        <h2 className="text-2xl font-bold">{title}</h2>
      </div>
      <p>{description}</p>
      <div className="text-xs mt-2 font-medium tracking-wider opacity-90">Trait: {traits}</div>
    </div>
  );
};

// --- Component: Header ---
const Header = () => (
  <header className="w-full max-w-6xl flex justify-between items-center py-4 px-6 border-b border-zinc-800/50 absolute top-0">
    <Link href="/" className="text-2xl font-extrabold tracking-widest text-white drop-shadow-[0_0_5px_#ffffff50]">
      MindRelic
    </Link>
    <nav>
      <Link href="/about" className="text-sm text-zinc-400 hover:text-[#ff00cc] transition-colors duration-200 ml-6">
        Relic Lore
      </Link>
      <Link href="/stats" className="text-sm text-zinc-400 hover:text-[#ff00cc] transition-colors duration-200 ml-6">
        Stats
      </Link>
    </nav>
  </header>
);

// --- Component: Home Page ---
export default function Home() {
  const router = useRouter();

  // Handle sound on first user interaction
  useEffect(() => {
    const playSound = () => {
      const sound = document.getElementById('menuSound') as HTMLAudioElement;
      sound?.play().catch(e => console.log("Sound play prevented:", e)); // Add catch for browser policy
      window.removeEventListener('click', playSound);
    };

    window.addEventListener('click', playSound, { once: true });
    return () => window.removeEventListener('click', playSound);
  }, []);
  
  // Game data array for easy iteration and expansion
  const games = [
    {
      title: "Squid Memory",
      href: "/squid-memory",
      description: "Match symbols under pressure. Ritualize your recall.",
      traits: "Focus · Recall · Pattern",
      bgColor: "bg-[#ff00cc]",
      shadowColor: "#ff00cc",
      iconPath: "M12 2C9.243 2 7 4.243 7 7v10c0 2.757 2.243 5 5 5s5-2.243 5-5V7c0-2.757-2.243-5-5-5z", // Original Memory icon
    },
    {
      title: "Tic Tac Toe",
      href: "/tic-tac-toe",
      description: "Classic duel. Encode your moves with mythic intent.",
      traits: "Strategy · Timing · Prediction",
      bgColor: "bg-[#00ffcc]",
      shadowColor: "#00ffcc",
      iconPath: "M3 3h6v6H3V3zm6 12H3v6h6v-6zm12-12h-6v6h6V3zm-6 12h6v6h-6v-6z", // Original Grid icon
    },
    // --- NEW GAME 1: Aether Pong ---
    {
      title: "Aether Pong",
      href: "/aether-pong",
      description: "A trial of reflexes and anticipation. Channel the Aether flow.",
      traits: "Reflex · Precision · Rhythm",
      bgColor: "bg-[#ffcc00]",
      shadowColor: "#ffcc00",
      iconPath: "M12 2a10 10 0 100 20 10 10 0 000-20zm0 18a8 8 0 110-16 8 8 0 010 16zM11 7h2v10h-2z", // Simple line/barrier icon
    },
   // --- NEW GAME 2: Crypto Trivia Challenge ---
{
title: "Crypto Trivia Challenge",
href: "/trivia-c", // Using the existing path
description: "Test your knowledge of Bitcoin, Ethereum, and DeFi.",
traits: "Knowledge · Speed · Finance",
bgColor: "bg-indigo-600",
shadowColor: "#4f46e5", // Indigo 600 color
iconPath: "M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 18c-3.86 0-7-3.14-7-7V6.3l7-3.11 7 3.11V12c0 3.86-3.14 7-7 7zm-2-9h4v2h-4v-2zm0-4h4v2h-4v-2z", // Simple coin/shield icon
},
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-zinc-900 via-black to-zinc-950 text-white flex flex-col items-center pt-24 pb-12 px-6">
      {/* Intro Sound */}
      <audio id="menuSound" src="/sounds/mindrelicmenu.mp3" preload="auto" />
      
      {/* Header */}
      <Header />

      {/* Title Section */}
      <section className="flex flex-col items-center justify-center max-w-3xl mb-12 mt-10">
        <h1 className="text-6xl font-extrabold mb-4 tracking-tighter drop-shadow-[0_0_15px_#ff00cc] text-center">
          MINDRELIC REALMS
        </h1>
        <p className="text-center text-lg max-w-xl text-zinc-400 font-light">
          Choose your ritual. Each game encodes its own lore — **memory vs strategy**, **trait vs timing**. Prepare to enhance your cognitive relics.
        </p>
      </section>

      {/* Game Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 w-full max-w-5xl">
        {games.map((game) => (
          <GameCard 
            key={game.title}
            title={game.title}
            href={game.href}
            description={game.description}
            traits={game.traits}
            bgColor={game.bgColor}
            shadowColor={game.shadowColor}
            iconPath={game.iconPath}
          />
        ))}
      </div>

      {/* Footer */}
      <div className="mt-20 text-xs tracking-wide text-zinc-600 text-center border-t border-zinc-800 pt-4 w-full max-w-5xl">
        MindRelic v2.0 Beta · lgg6bentley · gameplay active.
      </div>
    </main>
  );
}
