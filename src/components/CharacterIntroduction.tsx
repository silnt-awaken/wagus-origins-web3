import { useState, useEffect } from 'react';
import { useGameStore } from '@/store/gameStore';
import { ArrowRight, User } from 'lucide-react';

const dialogueSequence = [
  {
    speaker: 'SUGAW',
    text: 'Welcome to the digital city, newcomer. I am SUGAW.',
    mood: 'neutral'
  },
  {
    speaker: 'SUGAW',
    text: 'This place may look beautiful, but beneath the surface lies corruption that runs deep.',
    mood: 'serious'
  },
  {
    speaker: 'SUGAW',
    text: 'The crypto ecosystem has been infiltrated by those who seek to exploit and manipulate.',
    mood: 'warning'
  },
  {
    speaker: 'SUGAW',
    text: 'But there is hope. Three factions have emerged, each with their own vision for the future.',
    mood: 'hopeful'
  },
  {
    speaker: 'SUGAW',
    text: 'You must choose your path wisely. The fate of this digital realm depends on it.',
    mood: 'determined'
  },
  {
    speaker: 'SUGAW',
    text: 'Are you ready to learn the truth and make your choice?',
    mood: 'questioning'
  }
];

export default function CharacterIntroduction() {
  const { setCurrentPage } = useGameStore();
  const [currentDialogue, setCurrentDialogue] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [showContinue, setShowContinue] = useState(false);

  useEffect(() => {
    if (currentDialogue < dialogueSequence.length) {
      const dialogue = dialogueSequence[currentDialogue];
      setDisplayedText('');
      setIsTyping(true);
      setShowContinue(false);

      let index = 0;
      const typeInterval = setInterval(() => {
        if (index < dialogue.text.length) {
          setDisplayedText(dialogue.text.slice(0, index + 1));
          index++;
        } else {
          setIsTyping(false);
          setShowContinue(true);
          clearInterval(typeInterval);
        }
      }, 50);

      return () => clearInterval(typeInterval);
    }
  }, [currentDialogue]);

  const handleContinue = () => {
    if (currentDialogue < dialogueSequence.length - 1) {
      setCurrentDialogue(currentDialogue + 1);
    } else {
      setCurrentPage('tutorial');
    }
  };

  const handleSkip = () => {
    setCurrentPage('tutorial');
  };

  const getMoodColor = (mood: string) => {
    switch (mood) {
      case 'serious': return 'text-red-400';
      case 'warning': return 'text-orange-400';
      case 'hopeful': return 'text-green-400';
      case 'determined': return 'text-blue-400';
      case 'questioning': return 'text-purple-400';
      default: return 'text-cyan-400';
    }
  };

  return (
    <div className="min-h-screen cyber-grid flex items-center justify-center relative overflow-hidden">
      {/* Futuristic city background elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full">
          {/* City skyline silhouette */}
          <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-cyan-900/20 to-transparent"></div>
          {/* Floating data streams */}
          <div className="absolute top-1/4 left-1/4 w-1 h-32 bg-cyan-400 opacity-30 animate-pulse"></div>
          <div className="absolute top-1/3 right-1/3 w-1 h-24 bg-red-400 opacity-30 animate-pulse delay-500"></div>
          <div className="absolute bottom-1/3 left-1/2 w-1 h-40 bg-green-400 opacity-30 animate-pulse delay-1000"></div>
        </div>
      </div>

      <div className="glass-panel p-8 max-w-6xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
          {/* Character Portrait */}
          <div className="lg:col-span-1 flex justify-center">
            <div className="relative">
              <div className="w-64 h-64 rounded-full bg-gradient-to-br from-red-500/20 to-black/40 border-2 border-red-500/50 flex items-center justify-center sugaw-glow">
                <User className="w-32 h-32 text-red-400" />
              </div>
              {/* Character name */}
              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
                <h3 className="text-2xl font-bold text-red-400 text-center">SUGAW</h3>
                <p className="text-sm text-red-300 opacity-70 text-center">Truth Seeker</p>
              </div>
            </div>
          </div>

          {/* Dialogue Box */}
          <div className="lg:col-span-2">
            <div className="glass-panel p-6 border-red-500/30">
              {/* Speaker indicator */}
              <div className="flex items-center mb-4">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-3 animate-pulse"></div>
                <span className="text-red-400 font-semibold text-lg">
                  {dialogueSequence[currentDialogue]?.speaker}
                </span>
              </div>

              {/* Dialogue text */}
              <div className="mb-6">
                <p className={`text-lg leading-relaxed ${getMoodColor(dialogueSequence[currentDialogue]?.mood)} min-h-[3rem]`}>
                  {displayedText}
                  {isTyping && <span className="animate-pulse">|</span>}
                </p>
              </div>

              {/* Progress indicator */}
              <div className="flex justify-between items-center mb-4">
                <div className="flex space-x-2">
                  {dialogueSequence.map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full ${
                        index <= currentDialogue ? 'bg-red-400' : 'bg-gray-600'
                      }`}
                    ></div>
                  ))}
                </div>
                <span className="text-sm text-gray-400">
                  {currentDialogue + 1} / {dialogueSequence.length}
                </span>
              </div>

              {/* Action buttons */}
              <div className="flex justify-between items-center">
                <button
                  onClick={handleSkip}
                  className="text-gray-400 hover:text-gray-200 transition-colors duration-200 text-sm"
                >
                  Skip Introduction
                </button>
                
                {showContinue && (
                  <button
                    onClick={handleContinue}
                    className="cyber-glow bg-gradient-to-r from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 text-white font-semibold py-2 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
                  >
                    {currentDialogue < dialogueSequence.length - 1 ? 'Continue' : 'Begin Training'}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Lore exposition */}
        <div className="mt-8 text-center">
          <p className="text-cyan-300 opacity-70 text-lg">
            The Digital City • Year 2087 • Crypto Wars Era
          </p>
        </div>
      </div>
    </div>
  );
}