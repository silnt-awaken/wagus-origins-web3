import { useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import MainMenu from '@/components/MainMenu';
import CharacterIntroduction from '@/components/CharacterIntroduction';
import FactionSelection from '@/components/FactionSelection';
import TutorialGameplay from '@/components/TutorialGameplay';
import InventoryManagement from '@/components/InventoryManagement';
import ProgressDashboard from '@/components/ProgressDashboard';
import PhaserGame from '@/components/PhaserGame';

function App() {
  const { currentPage } = useGameStore();

  const renderPage = () => {
    switch (currentPage) {
      case 'menu':
        return <MainMenu />;
      case 'intro':
        return <CharacterIntroduction />;
      case 'faction-selection':
        return <FactionSelection />;
      case 'tutorial':
        return <TutorialGameplay />;
      case 'inventory':
        return <InventoryManagement />;
      case 'progress':
        return <ProgressDashboard />;
      case 'game':
        return null; // No overlay when in game mode
      default:
        return <MainMenu />;
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gray-900">
      {currentPage === 'game' ? (
        <PhaserGame />
      ) : (
        <div className="flex items-center justify-center min-h-screen">
          <div className="bg-black/80 backdrop-blur-sm border border-cyan-500/50 rounded-lg shadow-2xl shadow-cyan-500/25 max-w-4xl max-h-[90vh] overflow-auto">
            {renderPage()}
          </div>
        </div>
    )}
  </div>
);
}

export default App;
