import React, { useState, useEffect, useCallback } from 'react';
import { useGameStore } from '@/store/gameStore';
import { X, Zap, Search, Lock, Sparkles } from 'lucide-react';

interface MiniGameProps {
  type: 'mining' | 'scanning' | 'hacking' | 'magic';
  onComplete: (success: boolean, tokens: number) => void;
  onClose: () => void;
}

export const MiniGames: React.FC<MiniGameProps> = ({ type, onComplete, onClose }) => {
  const { currentPage, setCurrentPage, addTokens, updateProgress, selectedFaction } = useGameStore();

  const renderGame = () => {
    switch (type) {
      case 'mining':
        return <MiningGame onComplete={onComplete} onClose={onClose} />;
      case 'scanning':
        return <ScanningGame onComplete={onComplete} onClose={onClose} />;
      case 'hacking':
        return <HackingGame onComplete={onComplete} onClose={onClose} />;
      case 'magic':
        return <MagicGame onComplete={onComplete} onClose={onClose} />;
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-gray-900 border-2 border-cyan-500 rounded-lg p-6 max-w-2xl w-full mx-4 shadow-2xl shadow-cyan-500/25">
        {renderGame()}
      </div>
    </div>
  );
};

// Mining Mini-Game: Click timing game
const MiningGame: React.FC<{ onComplete: (success: boolean, tokens: number) => void; onClose: () => void }> = ({ onComplete, onClose }) => {
  const [power, setPower] = useState(0);
  const [direction, setDirection] = useState(1);
  const [attempts, setAttempts] = useState(3);
  const [score, setScore] = useState(0);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (!isActive) return;
    
    const interval = setInterval(() => {
      setPower(prev => {
        const newPower = prev + direction * 2;
        if (newPower >= 100) {
          setDirection(-1);
          return 100;
        }
        if (newPower <= 0) {
          setDirection(1);
          return 0;
        }
        return newPower;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [direction, isActive]);

  const handleMine = () => {
    if (attempts <= 0) return;
    
    const perfectZone = power >= 80 && power <= 95;
    const goodZone = power >= 60 && power <= 100;
    
    if (perfectZone) {
      setScore(prev => prev + 30);
    } else if (goodZone) {
      setScore(prev => prev + 15);
    } else {
      setScore(prev => prev + 5);
    }
    
    setAttempts(prev => prev - 1);
    
    if (attempts === 1) {
      const tokens = Math.floor(score / 10) + 10;
      setTimeout(() => onComplete(score >= 50, tokens), 500);
    }
  };

  const startMining = () => {
    setIsActive(true);
    setPower(0);
    setDirection(1);
  };

  return (
    <div className="text-center">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-cyan-400 flex items-center gap-2">
          <Zap className="w-6 h-6" />
          Data Mining
        </h2>
        <button onClick={onClose} className="text-gray-400 hover:text-white">
          <X className="w-6 h-6" />
        </button>
      </div>
      
      <p className="text-gray-300 mb-6">Click when the power meter is in the optimal zone (80-95%) to extract maximum data!</p>
      
      <div className="mb-6">
        <div className="bg-gray-800 rounded-lg p-4 mb-4">
          <div className="relative h-8 bg-gray-700 rounded">
            <div 
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 rounded transition-all duration-75"
              style={{ width: `${power}%` }}
            />
            <div className="absolute top-0 left-[80%] w-[15%] h-full bg-cyan-500/30 rounded" />
          </div>
          <div className="text-center mt-2 text-cyan-400 font-bold">{power.toFixed(0)}%</div>
        </div>
        
        <div className="flex justify-between text-sm text-gray-400 mb-4">
          <span>Attempts: {attempts}</span>
          <span>Score: {score}</span>
        </div>
        
        {!isActive ? (
          <button 
            onClick={startMining}
            className="px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-bold"
          >
            Start Mining
          </button>
        ) : (
          <button 
            onClick={handleMine}
            disabled={attempts <= 0}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-lg font-bold"
          >
            EXTRACT DATA!
          </button>
        )}
      </div>
    </div>
  );
};

// Scanning Mini-Game: Find hidden objects
const ScanningGame: React.FC<{ onComplete: (success: boolean, tokens: number) => void; onClose: () => void }> = ({ onComplete, onClose }) => {
  const [grid, setGrid] = useState<boolean[][]>([]);
  const [revealed, setRevealed] = useState<boolean[][]>([]);
  const [found, setFound] = useState(0);
  const [attempts, setAttempts] = useState(10);
  const [gameStarted, setGameStarted] = useState(false);
  
  const GRID_SIZE = 6;
  const HIDDEN_ITEMS = 4;

  useEffect(() => {
    initializeGrid();
  }, []);

  const initializeGrid = () => {
    const newGrid = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(false));
    const newRevealed = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(false));
    
    // Place hidden items randomly
    let placed = 0;
    while (placed < HIDDEN_ITEMS) {
      const row = Math.floor(Math.random() * GRID_SIZE);
      const col = Math.floor(Math.random() * GRID_SIZE);
      if (!newGrid[row][col]) {
        newGrid[row][col] = true;
        placed++;
      }
    }
    
    setGrid(newGrid);
    setRevealed(newRevealed);
  };

  const handleScan = (row: number, col: number) => {
    if (!gameStarted || revealed[row][col] || attempts <= 0) return;
    
    const newRevealed = [...revealed];
    newRevealed[row][col] = true;
    setRevealed(newRevealed);
    setAttempts(prev => prev - 1);
    
    if (grid[row][col]) {
      setFound(prev => {
        const newFound = prev + 1;
        if (newFound === HIDDEN_ITEMS) {
          setTimeout(() => onComplete(true, 25), 500);
        }
        return newFound;
      });
    } else if (attempts === 1) {
      setTimeout(() => onComplete(found >= 2, Math.max(5, found * 5)), 500);
    }
  };

  return (
    <div className="text-center">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-cyan-400 flex items-center gap-2">
          <Search className="w-6 h-6" />
          Environmental Scan
        </h2>
        <button onClick={onClose} className="text-gray-400 hover:text-white">
          <X className="w-6 h-6" />
        </button>
      </div>
      
      <p className="text-gray-300 mb-6">Scan the grid to find {HIDDEN_ITEMS} hidden data fragments!</p>
      
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-400 mb-4">
          <span>Found: {found}/{HIDDEN_ITEMS}</span>
          <span>Scans Left: {attempts}</span>
        </div>
        
        <div className="grid grid-cols-6 gap-2 mb-6 max-w-md mx-auto">
          {grid.map((row, rowIndex) => 
            row.map((hasItem, colIndex) => (
              <button
                key={`${rowIndex}-${colIndex}`}
                onClick={() => handleScan(rowIndex, colIndex)}
                disabled={!gameStarted || revealed[rowIndex][colIndex]}
                className={`
                  w-12 h-12 rounded border-2 transition-all duration-200
                  ${revealed[rowIndex][colIndex] 
                    ? hasItem 
                      ? 'bg-green-600 border-green-400' 
                      : 'bg-red-600 border-red-400'
                    : 'bg-gray-700 border-gray-500 hover:border-cyan-400'
                  }
                  ${!gameStarted || revealed[rowIndex][colIndex] ? 'cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                {revealed[rowIndex][colIndex] && hasItem && '💎'}
                {revealed[rowIndex][colIndex] && !hasItem && '❌'}
              </button>
            ))
          )}
        </div>
        
        {!gameStarted ? (
          <button 
            onClick={() => setGameStarted(true)}
            className="px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-bold"
          >
            Start Scanning
          </button>
        ) : null}
      </div>
    </div>
  );
};

// Hacking Mini-Game: Pattern matching
const HackingGame: React.FC<{ onComplete: (success: boolean, tokens: number) => void; onClose: () => void }> = ({ onComplete, onClose }) => {
  const [sequence, setSequence] = useState<number[]>([]);
  const [playerSequence, setPlayerSequence] = useState<number[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [gamePhase, setGamePhase] = useState<'showing' | 'input' | 'waiting'>('waiting');
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);

  const generateSequence = (length: number) => {
    const newSequence = [];
    for (let i = 0; i < length; i++) {
      newSequence.push(Math.floor(Math.random() * 4));
    }
    return newSequence;
  };

  const startLevel = () => {
    const newSequence = generateSequence(2 + level);
    setSequence(newSequence);
    setPlayerSequence([]);
    setCurrentStep(0);
    setGamePhase('showing');
    
    // Show sequence
    setTimeout(() => {
      setGamePhase('input');
    }, (2 + level) * 800);
  };

  const handleInput = (value: number) => {
    if (gamePhase !== 'input') return;
    
    const newPlayerSequence = [...playerSequence, value];
    setPlayerSequence(newPlayerSequence);
    
    if (newPlayerSequence[currentStep] !== sequence[currentStep]) {
      // Wrong input
      setTimeout(() => onComplete(score >= 50, Math.max(5, score)), 500);
      return;
    }
    
    if (newPlayerSequence.length === sequence.length) {
      // Level complete
      const newScore = score + (level * 20);
      setScore(newScore);
      
      if (level >= 3) {
        setTimeout(() => onComplete(true, newScore), 500);
      } else {
        setLevel(prev => prev + 1);
        setTimeout(() => {
          setGamePhase('waiting');
        }, 1000);
      }
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const colors = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500'];
  const colorNames = ['Red', 'Blue', 'Green', 'Yellow'];

  return (
    <div className="text-center">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-cyan-400 flex items-center gap-2">
          <Lock className="w-6 h-6" />
          System Breach
        </h2>
        <button onClick={onClose} className="text-gray-400 hover:text-white">
          <X className="w-6 h-6" />
        </button>
      </div>
      
      <p className="text-gray-300 mb-6">Memorize and repeat the security sequence to breach the system!</p>
      
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-400 mb-4">
          <span>Level: {level}/3</span>
          <span>Score: {score}</span>
        </div>
        
        <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto mb-6">
          {colors.map((color, index) => (
            <button
              key={index}
              onClick={() => handleInput(index)}
              disabled={gamePhase !== 'input'}
              className={`
                w-20 h-20 rounded-lg border-2 transition-all duration-200
                ${color}
                ${gamePhase === 'showing' && sequence[Math.floor(Date.now() / 800) % sequence.length] === index 
                  ? 'border-white scale-110' 
                  : 'border-gray-600'
                }
                ${gamePhase === 'input' ? 'hover:scale-105 cursor-pointer' : 'cursor-not-allowed opacity-70'}
              `}
            >
              <span className="text-white font-bold">{colorNames[index]}</span>
            </button>
          ))}
        </div>
        
        {gamePhase === 'waiting' && (
          <button 
            onClick={startLevel}
            className="px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-bold"
          >
            {level === 1 ? 'Start Hack' : `Level ${level}`}
          </button>
        )}
        
        {gamePhase === 'showing' && (
          <div className="text-cyan-400 font-bold">Memorize the sequence...</div>
        )}
        
        {gamePhase === 'input' && (
          <div className="text-green-400 font-bold">Enter the sequence!</div>
        )}
      </div>
    </div>
  );
};

// Magic Mini-Game: Gesture drawing
const MagicGame: React.FC<{ onComplete: (success: boolean, tokens: number) => void; onClose: () => void }> = ({ onComplete, onClose }) => {
  const [currentSpell, setCurrentSpell] = useState(0);
  const [drawnPath, setDrawnPath] = useState<{x: number, y: number}[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(3);
  
  const spells = [
    { name: 'Lightning Bolt', pattern: 'zigzag', description: 'Draw a zigzag pattern' },
    { name: 'Fire Circle', pattern: 'circle', description: 'Draw a circular motion' },
    { name: 'Ice Shard', pattern: 'triangle', description: 'Draw a triangular shape' }
  ];

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDrawing(true);
    const rect = e.currentTarget.getBoundingClientRect();
    setDrawnPath([{ x: e.clientX - rect.left, y: e.clientY - rect.top }]);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setDrawnPath(prev => [...prev, { x: e.clientX - rect.left, y: e.clientY - rect.top }]);
  };

  const handleMouseUp = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    
    // Simple pattern recognition (placeholder)
    const accuracy = Math.random() * 0.4 + 0.6; // 60-100% accuracy
    const spellScore = Math.floor(accuracy * 30);
    setScore(prev => prev + spellScore);
    setAttempts(prev => prev - 1);
    
    if (currentSpell < spells.length - 1) {
      setTimeout(() => {
        setCurrentSpell(prev => prev + 1);
        setDrawnPath([]);
      }, 1000);
    } else {
      setTimeout(() => onComplete(score >= 60, score), 1000);
    }
  };

  return (
    <div className="text-center">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-cyan-400 flex items-center gap-2">
          <Sparkles className="w-6 h-6" />
          Cyber Magic
        </h2>
        <button onClick={onClose} className="text-gray-400 hover:text-white">
          <X className="w-6 h-6" />
        </button>
      </div>
      
      <p className="text-gray-300 mb-6">Cast spells by drawing the correct magical patterns!</p>
      
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-400 mb-4">
          <span>Spell: {currentSpell + 1}/{spells.length}</span>
          <span>Score: {score}</span>
        </div>
        
        <div className="mb-4">
          <h3 className="text-lg font-bold text-purple-400 mb-2">{spells[currentSpell].name}</h3>
          <p className="text-gray-300">{spells[currentSpell].description}</p>
        </div>
        
        <div 
          className="w-80 h-60 bg-gray-800 border-2 border-purple-500 rounded-lg mx-auto mb-4 relative cursor-crosshair"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={() => setIsDrawing(false)}
        >
          <svg className="absolute inset-0 w-full h-full">
            {drawnPath.length > 1 && (
              <path
                d={`M ${drawnPath[0].x} ${drawnPath[0].y} ${drawnPath.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ')}`}
                stroke="#a855f7"
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
              />
            )}
          </svg>
          
          {drawnPath.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center text-gray-500">
              Draw here to cast the spell
            </div>
          )}
        </div>
        
        <button 
          onClick={() => setDrawnPath([])}
          className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg"
        >
          Clear
        </button>
      </div>
    </div>
  );
};

export default MiniGames;