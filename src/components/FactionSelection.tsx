import { useState } from 'react';
import { useGameStore, type Faction } from '@/store/gameStore';
import { Shield, Zap, Heart, Check, ArrowRight } from 'lucide-react';

interface FactionData {
  id: Faction;
  name: string;
  description: string;
  longDescription: string;
  icon: React.ComponentType<any>;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    glow: string;
  };
  values: string[];
  tokenSymbol: string;
}

const factions: FactionData[] = [
  {
    id: 'SUGAW',
    name: 'SUGAW',
    description: 'Uncover corruption in the crypto ecosystem',
    longDescription: 'The SUGAW faction is dedicated to exposing the dark underbelly of the crypto world. As a truth seeker, you will investigate corruption, reveal hidden agendas, and fight against those who exploit the system for personal gain.',
    icon: Shield,
    colors: {
      primary: 'text-red-400',
      secondary: 'text-red-300',
      accent: 'bg-red-500',
      glow: 'sugaw-glow border-red-500/50'
    },
    values: ['Truth', 'Justice', 'Transparency', 'Resistance'],
    tokenSymbol: 'SUGAW'
  },
  {
    id: 'WAGUS',
    name: 'WAGUS',
    description: 'Balanced approach to crypto innovation',
    longDescription: 'The WAGUS faction represents harmony and balance in the digital realm. As a guardian of equilibrium, you will work to create sustainable crypto solutions that benefit everyone while maintaining stability and fairness.',
    icon: Zap,
    colors: {
      primary: 'text-white',
      secondary: 'text-gray-300',
      accent: 'bg-white',
      glow: 'wagus-glow border-white/50'
    },
    values: ['Balance', 'Innovation', 'Sustainability', 'Unity'],
    tokenSymbol: 'WAGUS'
  },
  {
    id: 'BONK',
    name: 'BONK',
    description: 'Laid-back, fun crypto gaming experience',
    longDescription: 'The BONK faction embraces the playful side of crypto culture. As a free spirit, you will focus on community building, meme culture, and making crypto accessible and enjoyable for everyone through humor and creativity.',
    icon: Heart,
    colors: {
      primary: 'text-orange-400',
      secondary: 'text-orange-300',
      accent: 'bg-orange-500',
      glow: 'bonk-glow border-orange-500/50'
    },
    values: ['Fun', 'Community', 'Creativity', 'Accessibility'],
    tokenSymbol: 'BONK'
  }
];

export default function FactionSelection() {
  const { setSelectedFaction, setCurrentPage, setShowOverlay } = useGameStore();
  const [selectedFaction, setLocalSelectedFaction] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleFactionSelect = (factionId: string) => {
    setLocalSelectedFaction(factionId);
    setShowConfirmation(true);
  };

  const handleConfirm = () => {
    if (selectedFaction) {
      setSelectedFaction(selectedFaction as Faction);
      setShowOverlay(true);
      setCurrentPage('progress');
    }
  };

  const handleBack = () => {
    setShowConfirmation(false);
    setLocalSelectedFaction(null);
  };

  const selectedFactionData = factions.find(f => f.id === selectedFaction);

  if (showConfirmation && selectedFactionData) {
    return (
      <div className="min-h-screen cyber-grid flex items-center justify-center relative overflow-hidden">
        <div className="glass-panel p-8 max-w-4xl mx-auto relative z-10">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-cyan-400 mb-4">Confirm Your Choice</h2>
            <p className="text-cyan-300 opacity-80">This decision will shape your journey through the digital city</p>
          </div>

          <div className={`glass-panel p-8 ${selectedFactionData.colors.glow} max-w-2xl mx-auto`}>
            <div className="text-center mb-6">
              <div className="flex justify-center mb-4">
                <div className={`w-20 h-20 rounded-full ${selectedFactionData.colors.accent} flex items-center justify-center`}>
                  <selectedFactionData.icon className="w-10 h-10 text-white" />
                </div>
              </div>
              <h3 className={`text-3xl font-bold ${selectedFactionData.colors.primary} mb-2`}>
                {selectedFactionData.name}
              </h3>
              <p className={`text-lg ${selectedFactionData.colors.secondary} mb-6`}>
                {selectedFactionData.description}
              </p>
            </div>

            <div className="mb-6">
              <p className={`${selectedFactionData.colors.secondary} leading-relaxed`}>
                {selectedFactionData.longDescription}
              </p>
            </div>

            <div className="mb-6">
              <h4 className={`text-lg font-semibold ${selectedFactionData.colors.primary} mb-3`}>Core Values:</h4>
              <div className="grid grid-cols-2 gap-2">
                {selectedFactionData.values.map((value, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Check className={`w-4 h-4 ${selectedFactionData.colors.primary}`} />
                    <span className={selectedFactionData.colors.secondary}>{value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-8">
              <div className={`p-4 rounded-lg bg-black/20 border ${selectedFactionData.colors.glow.includes('red') ? 'border-red-500/30' : selectedFactionData.colors.glow.includes('white') ? 'border-white/30' : 'border-orange-500/30'}`}>
                <p className={`text-sm ${selectedFactionData.colors.secondary} mb-2`}>You will earn:</p>
                <p className={`text-xl font-bold ${selectedFactionData.colors.primary}`}>
                  {selectedFactionData.tokenSymbol} Tokens
                </p>
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={handleBack}
                className="text-gray-400 hover:text-gray-200 transition-colors duration-200 px-6 py-2"
              >
                Back to Selection
              </button>
              <button
                onClick={handleConfirm}
                className={`cyber-glow bg-gradient-to-r ${selectedFactionData.colors.glow.includes('red') ? 'from-red-500 to-red-600 hover:from-red-400 hover:to-red-500' : selectedFactionData.colors.glow.includes('white') ? 'from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600' : 'from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500'} text-white font-bold py-3 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 flex items-center gap-2`}
              >
                Confirm Choice
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen cyber-grid flex items-center justify-center relative overflow-hidden">
      <div className="glass-panel p-8 max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-5xl font-bold text-cyan-400 mb-4">Choose Your Faction</h2>
          <p className="text-xl text-cyan-300 opacity-80 max-w-3xl mx-auto">
            You have completed your training and earned tokens from all factions. Now choose your path through the digital realm. Your faction will determine your future rewards and abilities.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {factions.map((faction) => {
            const Icon = faction.icon;
            return (
              <div
                key={faction.id}
                className={`glass-panel p-8 ${faction.colors.glow} cursor-pointer transition-all duration-300 transform hover:scale-105 hover:-translate-y-2`}
                onClick={() => handleFactionSelect(faction.id)}
              >
                <div className="text-center mb-6">
                  <div className="flex justify-center mb-4">
                    <div className={`w-16 h-16 rounded-full ${faction.colors.accent} flex items-center justify-center`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <h3 className={`text-2xl font-bold ${faction.colors.primary} mb-2`}>
                    {faction.name}
                  </h3>
                  <p className={`${faction.colors.secondary} mb-4`}>
                    {faction.description}
                  </p>
                </div>

                <div className="mb-6">
                  <h4 className={`text-sm font-semibold ${faction.colors.primary} mb-3 uppercase tracking-wide`}>
                    Core Values
                  </h4>
                  <div className="space-y-2">
                    {faction.values.map((value, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${faction.colors.accent}`}></div>
                        <span className={`text-sm ${faction.colors.secondary}`}>{value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="text-center">
                  <div className={`inline-block px-4 py-2 rounded-full bg-black/30 border ${faction.colors.glow.includes('red') ? 'border-red-500/30' : faction.colors.glow.includes('white') ? 'border-white/30' : 'border-orange-500/30'}`}>
                    <span className={`text-sm font-semibold ${faction.colors.primary}`}>
                      Earn {faction.tokenSymbol} Tokens
                    </span>
                  </div>
                </div>

                <div className="mt-6 text-center">
                  <button className={`w-full py-3 rounded-lg font-semibold transition-all duration-300 ${faction.colors.glow.includes('red') ? 'bg-red-500/20 hover:bg-red-500/30 text-red-400' : faction.colors.glow.includes('white') ? 'bg-white/20 hover:bg-white/30 text-white' : 'bg-orange-500/20 hover:bg-orange-500/30 text-orange-400'}`}>
                    Select {faction.name}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center mt-12">
          <p className="text-cyan-300 opacity-60">
            Choose wisely - your faction will shape your entire journey
          </p>
        </div>
      </div>
    </div>
  );
}