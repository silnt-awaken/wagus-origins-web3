import { useGameStore } from '@/store/gameStore';
import { Play, Shield, Zap, Heart } from 'lucide-react';

export default function MainMenu() {
  const { setCurrentPage, setShowOverlay } = useGameStore();

  const handleStartGame = () => {
    setCurrentPage('game');
    setShowOverlay(false);
  };

  const handleTutorial = () => {
    setCurrentPage('intro');
  };

  return (
    <div className="min-h-screen cyber-grid flex flex-col items-center justify-center relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 border border-cyan-400 rounded-full animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-24 h-24 border border-cyan-400 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-16 h-16 border border-cyan-400 rounded-full animate-pulse delay-2000"></div>
      </div>

      {/* Main content */}
      <div className="glass-panel p-12 max-w-4xl mx-auto text-center relative z-10">
        {/* Game Logo */}
        <div className="mb-12">
          <h1 className="text-6xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
            WAGUS
          </h1>
          <h2 className="text-3xl font-semibold text-cyan-300 mb-2">ORIGINS</h2>
          <p className="text-lg text-cyan-200 opacity-80">Web3 MMORPG Tutorial</p>
        </div>

        {/* Start Button */}
        <div className="flex flex-col gap-4 mb-12">
          <button
            onClick={handleStartGame}
            className="group relative px-8 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-lg rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/50"
          >
            <span className="relative z-10">Enter Game World</span>
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-400 opacity-0 group-hover:opacity-20 rounded-lg transition-opacity duration-300" />
          </button>
          
          <button
            onClick={handleTutorial}
            className="group relative px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-lg rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/50"
          >
            <span className="relative z-10">Story Mode</span>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 opacity-0 group-hover:opacity-20 rounded-lg transition-opacity duration-300" />
          </button>
        </div>

        {/* Faction Preview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-panel p-6 sugaw-glow border-red-500/30">
            <div className="flex items-center justify-center mb-4">
              <Shield className="w-8 h-8 text-red-400" />
            </div>
            <h3 className="text-xl font-bold text-red-400 mb-2">SUGAW</h3>
            <p className="text-sm text-red-200 opacity-80">Uncover corruption in the crypto ecosystem</p>
            <div className="mt-4 flex justify-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <div className="w-3 h-3 bg-black rounded-full"></div>
            </div>
          </div>

          <div className="glass-panel p-6 wagus-glow border-white/30">
            <div className="flex items-center justify-center mb-4">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">WAGUS</h3>
            <p className="text-sm text-gray-200 opacity-80">Balanced approach to crypto innovation</p>
            <div className="mt-4 flex justify-center space-x-2">
              <div className="w-3 h-3 bg-black rounded-full"></div>
              <div className="w-3 h-3 bg-white rounded-full"></div>
            </div>
          </div>

          <div className="glass-panel p-6 bonk-glow border-orange-500/30">
            <div className="flex items-center justify-center mb-4">
              <Heart className="w-8 h-8 text-orange-400" />
            </div>
            <h3 className="text-xl font-bold text-orange-400 mb-2">BONK</h3>
            <p className="text-sm text-orange-200 opacity-80">Laid-back, fun crypto gaming experience</p>
            <div className="mt-4 flex justify-center space-x-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div className="w-3 h-3 bg-pink-500 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Subtitle */}
        <p className="text-cyan-300 mt-8 text-lg opacity-70">
          Enter the digital city and choose your path
        </p>
      </div>
    </div>
  );
}