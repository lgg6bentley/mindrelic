import Link from 'next/link';

// Theme concept: Broken grid, mismatched tiles, red/yellow warning palette on a dark background.

const MemoryMatchNotFound = () => {
  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-6 text-center font-sans">
      
      {/* Container for the Mismatched / Glitch Title */}
      <div className="relative mb-8">
        
        {/* Main Title - The "Found" part is broken/mismatched */}
        <h1 className="text-8xl md:text-9xl font-black text-red-500 tracking-tighter z-10 relative">
          404 
          <span className="text-yellow-400 block -mt-4 text-6xl md:text-7xl">
            CORRUPTED
          </span>
        </h1>
        
        {/* Mismatch/Shadow Layer 1 (Offset Blue/Teal) */}
        <h1 className="absolute top-0 left-0 text-8xl md:text-9xl font-black text-teal-400/30 tracking-tighter translate-x-1.5 translate-y-1.5 opacity-70">
          404 
          <span className="block -mt-4 text-6xl md:text-7xl">
            CORRUPTED
          </span>
        </h1>

      </div>
      
      {/* Error Message Panel - Resembles a Broken Data Block */}
      <div className="bg-gray-800 px-6 py-3 text-lg md:text-xl rounded-md text-red-400 border border-red-600 shadow-xl shadow-red-900/50">
        // ASSET_LOAD_FAILURE: Index Mismatch (0x404)
      </div>

      {/* Grid Pattern / Fragmentation Line */}
      <div className="w-1/2 h-px my-10 bg-gradient-to-r from-transparent via-yellow-500 to-transparent animate-pulse"></div>

      {/* Descriptive Text */}
      <p className="mt-4 text-lg text-gray-300 max-w-lg">
        **ERROR**: Memory Address Failed to Match. The requested data block is missing or has been permanently deleted from the registry.
      </p>

      {/* CTA: Home Button to "Restart" */}
      <Link 
        href="/" 
        className="mt-12 inline-block px-8 py-3 bg-yellow-500 text-gray-900 font-bold text-lg rounded-lg 
                   uppercase shadow-lg shadow-yellow-500/50 hover:bg-yellow-400 transition duration-200 
                   transform hover:scale-[1.05] border-2 border-yellow-700"
        aria-label="Restart system navigation"
      >
        RE-INITIALIZE
      </Link>
      
    </div>
  );
};

export default MemoryMatchNotFound;
