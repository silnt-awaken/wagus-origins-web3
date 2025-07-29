import { useState, useEffect } from 'react';
import { useGameStore } from '@/store/gameStore';
import { 
  Pickaxe, 
  Search, 
  Terminal, 
  Sword, 
  Sparkles, 
  Package, 
  BarChart3, 
  Coins,
  Play,
  CheckCircle,
  HelpCircle,
  Target,
  Zap,
  Timer,
  Trophy
} from 'lucide-react';

type Activity = 'mining' | 'scanning' | 'hacking' | 'combat' | 'magic';

interface ActivityData {
  id: Activity;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  minigame: React.ComponentType<any>;
}

// Mining Mini-game Component
function MiningGame({ onComplete }: { onComplete: (reward: number) => void }) {
  const [clicks, setClicks] = useState(0);
  const [targetClicks] = useState(10);
  const [isActive, setIsActive] = useState(false);
  const [showTutorial, setShowTutorial] = useState(true);
  const [clickPower, setClickPower] = useState(1);
  const [combo, setCombo] = useState(0);
  const [lastClickTime, setLastClickTime] = useState(0);

  const handleMine = () => {
    if (!isActive) return;
    
    const now = Date.now();
    const timeDiff = now - lastClickTime;
    
    // Combo system for rapid clicks
    if (timeDiff < 500 && combo < 5) {
      setCombo(combo + 1);
      setClickPower(1 + combo * 0.2);
    } else {
      setCombo(0);
      setClickPower(1);
    }
    
    setLastClickTime(now);
    const newClicks = clicks + clickPower;
    setClicks(newClicks);
    
    if (newClicks >= targetClicks) {
      setIsActive(false);
      onComplete(25 + Math.floor(combo * 5)); // Bonus for combos
    }
  };

  const startMining = () => {
    setIsActive(true);
    setClicks(0);
    setShowTutorial(false);
    setCombo(0);
    setClickPower(1);
  };

  return (
    <div className="text-center">
      {showTutorial && (
        <div className="mb-6 p-4 bg-blue-900/30 border border-blue-500/50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <HelpCircle className="w-5 h-5 text-blue-400" />
            <h3 className="text-blue-400 font-semibold">Mining Tutorial</h3>
          </div>
          <p className="text-blue-300 text-sm mb-2">Click rapidly on the mining node to extract resources!</p>
          <p className="text-blue-300 text-xs">💡 Tip: Fast consecutive clicks build combo multipliers!</p>
        </div>
      )}
      
      <div className="mb-6 relative">
        <div 
          className={`w-32 h-32 mx-auto bg-gradient-to-br from-yellow-600 to-orange-700 rounded-lg flex items-center justify-center cursor-pointer transform transition-all duration-200 ${
            isActive ? 'hover:scale-110 active:scale-95' : 'hover:scale-105'
          } ${combo > 0 ? 'ring-4 ring-yellow-400 ring-opacity-50' : ''}`}
          onClick={handleMine}
        >
          <Pickaxe className={`w-16 h-16 text-yellow-200 transition-transform duration-200 ${
            isActive && combo > 0 ? 'animate-pulse' : ''
          }`} />
        </div>
        
        {combo > 0 && (
          <div className="absolute -top-2 -right-2 bg-yellow-500 text-black px-2 py-1 rounded-full text-xs font-bold animate-bounce">
            {combo}x COMBO!
          </div>
        )}
      </div>
      
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-yellow-400">Progress</span>
          <span className="text-yellow-400">{Math.floor(clicks)} / {targetClicks}</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-4 relative overflow-hidden">
          <div 
            className="bg-gradient-to-r from-yellow-500 to-orange-500 h-4 rounded-full transition-all duration-300 relative"
            style={{ width: `${Math.min((clicks / targetClicks) * 100, 100)}%` }}
          >
            <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
          </div>
        </div>
        
        {combo > 0 && (
          <div className="flex items-center justify-center gap-2 mt-2">
            <Zap className="w-4 h-4 text-yellow-400" />
            <p className="text-yellow-400 text-sm">Power: {clickPower.toFixed(1)}x</p>
          </div>
        )}
      </div>
      
      {!isActive && clicks === 0 && (
        <button onClick={startMining} className="cyber-glow bg-yellow-600 hover:bg-yellow-500 text-white px-6 py-2 rounded-lg transition-all duration-300">
          <div className="flex items-center gap-2">
            <Play className="w-4 h-4" />
            Start Mining
          </div>
        </button>
      )}
      
      {clicks >= targetClicks && (
        <div className="space-y-2">
          <div className="text-green-400 flex items-center justify-center gap-2">
            <Trophy className="w-5 h-5" />
            Mining Complete!
          </div>
          <div className="text-yellow-400 text-sm">
            +{25 + Math.floor(combo * 5)} tokens {combo > 0 && `(+${Math.floor(combo * 5)} combo bonus!)`}
          </div>
        </div>
      )}
    </div>
  );
}

// Scanning Mini-game Component
function ScanningGame({ onComplete }: { onComplete: (reward: number) => void }) {
  const [foundItems, setFoundItems] = useState<number[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [showTutorial, setShowTutorial] = useState(true);
  const [scanAttempts, setScanAttempts] = useState(0);
  const [recentlyScanned, setRecentlyScanned] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(30);
  const hiddenItems = [1, 3, 5, 7]; // positions of hidden items

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isScanning && timeLeft > 0) {
      timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    } else if (timeLeft === 0 && isScanning) {
      setIsScanning(false);
    }
    return () => clearTimeout(timer);
  }, [isScanning, timeLeft]);

  const handleScan = (position: number) => {
    if (!isScanning || foundItems.includes(position) || timeLeft === 0) return;
    
    setScanAttempts(prev => prev + 1);
    setRecentlyScanned(prev => [...prev, position]);
    
    // Clear recent scan indicator after animation
    setTimeout(() => {
      setRecentlyScanned(prev => prev.filter(p => p !== position));
    }, 500);
    
    if (hiddenItems.includes(position)) {
      const newFound = [...foundItems, position];
      setFoundItems(newFound);
      if (newFound.length === hiddenItems.length) {
        setIsScanning(false);
        const efficiency = Math.max(0, 100 - (scanAttempts - hiddenItems.length) * 10);
        const timeBonus = Math.floor(timeLeft / 5);
        onComplete(20 + Math.floor(efficiency / 10) + timeBonus);
      }
    }
  };

  const startScanning = () => {
    setIsScanning(true);
    setFoundItems([]);
    setShowTutorial(false);
    setScanAttempts(0);
    setRecentlyScanned([]);
    setTimeLeft(30);
  };

  return (
    <div className="text-center">
      {showTutorial && (
        <div className="mb-6 p-4 bg-cyan-900/30 border border-cyan-500/50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-5 h-5 text-cyan-400" />
            <h3 className="text-cyan-400 font-semibold">Scanning Tutorial</h3>
          </div>
          <p className="text-cyan-300 text-sm mb-2">Scan the grid to find {hiddenItems.length} hidden items!</p>
          <p className="text-cyan-300 text-xs">💡 Tip: Efficient scanning gives bonus rewards!</p>
        </div>
      )}
      
      {isScanning && (
        <div className="mb-4 flex justify-between items-center max-w-xs mx-auto">
          <div className="flex items-center gap-2">
            <Timer className="w-4 h-4 text-cyan-400" />
            <span className={`text-sm font-mono ${
              timeLeft <= 10 ? 'text-red-400 animate-pulse' : 'text-cyan-400'
            }`}>
              {timeLeft}s
            </span>
          </div>
          <div className="text-cyan-400 text-sm">
            Attempts: {scanAttempts}
          </div>
        </div>
      )}
      
      <div className="mb-6">
        <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto">
          {Array.from({ length: 9 }, (_, i) => {
            const isFound = foundItems.includes(i);
            const isHidden = hiddenItems.includes(i);
            const isRecentlyScanned = recentlyScanned.includes(i);
            
            return (
              <div
                key={i}
                className={`w-16 h-16 border-2 rounded-lg cursor-pointer transition-all duration-300 relative ${
                  isFound
                    ? 'bg-green-500 border-green-400 scale-105' 
                    : isRecentlyScanned && !isHidden
                    ? 'bg-red-500/30 border-red-400 animate-pulse'
                    : isRecentlyScanned && isHidden
                    ? 'bg-green-500/30 border-green-400'
                    : isScanning
                    ? 'border-cyan-400 hover:bg-cyan-500/20 hover:scale-105'
                    : 'border-gray-600 hover:border-gray-500'
                } ${timeLeft === 0 ? 'cursor-not-allowed opacity-50' : ''}`}
                onClick={() => handleScan(i)}
              >
                {isFound && (
                  <div className="w-full h-full flex items-center justify-center">
                    <Search className="w-8 h-8 text-white animate-bounce" />
                  </div>
                )}
                {isRecentlyScanned && !isFound && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-ping"></div>
                  </div>
                )}
                {isScanning && !isFound && !isRecentlyScanned && (
                  <div className="absolute inset-0 bg-cyan-400/10 animate-pulse"></div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-cyan-400">Progress</span>
          <span className="text-cyan-400">{foundItems.length} / {hiddenItems.length} found</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-cyan-500 to-blue-500 h-3 rounded-full transition-all duration-500"
            style={{ width: `${(foundItems.length / hiddenItems.length) * 100}%` }}
          ></div>
        </div>
      </div>
      
      {!isScanning && foundItems.length === 0 && (
        <button onClick={startScanning} className="cyber-glow bg-cyan-600 hover:bg-cyan-500 text-white px-6 py-2 rounded-lg transition-all duration-300">
          <div className="flex items-center gap-2">
            <Play className="w-4 h-4" />
            Start Scanning
          </div>
        </button>
      )}
      
      {(foundItems.length === hiddenItems.length || (timeLeft === 0 && isScanning)) && (
        <div className="space-y-2">
          {foundItems.length === hiddenItems.length ? (
            <>
              <div className="text-green-400 flex items-center justify-center gap-2">
                <Trophy className="w-5 h-5" />
                Scanning Complete!
              </div>
              <div className="text-cyan-400 text-sm">
                +{20 + Math.floor(Math.max(0, 100 - (scanAttempts - hiddenItems.length) * 10) / 10) + Math.floor(timeLeft / 5)} tokens
                {scanAttempts === hiddenItems.length && ' (Perfect efficiency!)'}
              </div>
            </>
          ) : (
            <div className="text-red-400 flex items-center justify-center gap-2">
              <Timer className="w-5 h-5" />
              Time's up! Found {foundItems.length}/{hiddenItems.length}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Hacking Mini-game Component
function HackingGame({ onComplete }: { onComplete: (reward: number) => void }) {
  const [sequence, setSequence] = useState<number[]>([]);
  const [userInput, setUserInput] = useState<number[]>([]);
  const [isActive, setIsActive] = useState(false);
  const [showSequence, setShowSequence] = useState(false);
  const [showTutorial, setShowTutorial] = useState(true);
  const [attempts, setAttempts] = useState(0);
  const [sequenceIndex, setSequenceIndex] = useState(0);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [difficulty, setDifficulty] = useState(1);
  const [showTime, setShowTime] = useState(3000);

  const generateSequence = () => {
    const length = Math.min(3 + difficulty, 6);
    const newSequence = Array.from({ length }, () => Math.floor(Math.random() * 4));
    setSequence(newSequence);
    setUserInput([]);
    setIsActive(true);
    setShowSequence(true);
    setSequenceIndex(0);
    setIsCorrect(null);
    setShowTutorial(false);
    
    const displayTime = Math.max(2000 - (difficulty * 200), 1000);
    setShowTime(displayTime);
    setTimeout(() => setShowSequence(false), displayTime);
  };

  const handleInput = (value: number) => {
    if (!isActive || showSequence) return;
    
    const newInput = [...userInput, value];
    setUserInput(newInput);
    
    // Check if current input is correct
    const currentIndex = newInput.length - 1;
    const isCurrentCorrect = newInput[currentIndex] === sequence[currentIndex];
    
    if (!isCurrentCorrect) {
      setIsCorrect(false);
      setAttempts(prev => prev + 1);
      // Reset after showing error
      setTimeout(() => {
        setUserInput([]);
        setIsCorrect(null);
      }, 1000);
      return;
    }
    
    if (newInput.length === sequence.length) {
      setIsCorrect(true);
      setIsActive(false);
      const bonus = Math.max(0, 50 - attempts * 10) + (difficulty * 5);
      setTimeout(() => {
        onComplete(30 + bonus);
      }, 1000);
    }
  };

  const colors = [
    { bg: 'bg-red-500', name: 'Red', glow: 'shadow-red-500/50' },
    { bg: 'bg-blue-500', name: 'Blue', glow: 'shadow-blue-500/50' },
    { bg: 'bg-green-500', name: 'Green', glow: 'shadow-green-500/50' },
    { bg: 'bg-yellow-500', name: 'Yellow', glow: 'shadow-yellow-500/50' }
  ];

  return (
    <div className="text-center">
      {showTutorial && (
        <div className="mb-6 p-4 bg-purple-900/30 border border-purple-500/50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Terminal className="w-5 h-5 text-purple-400" />
            <h3 className="text-purple-400 font-semibold">Hacking Tutorial</h3>
          </div>
          <p className="text-purple-300 text-sm mb-2">Memorize the sequence, then repeat it!</p>
          <p className="text-purple-300 text-xs">💡 Tip: Fewer mistakes = higher rewards!</p>
        </div>
      )}
      
      {isActive && (
        <div className="mb-4">
          <div className="flex justify-between items-center max-w-xs mx-auto mb-2">
            <span className="text-purple-400 text-sm">Difficulty: {difficulty}</span>
            <span className="text-purple-400 text-sm">Attempts: {attempts}</span>
          </div>
          {showSequence && (
            <div className="text-purple-300 text-sm animate-pulse">
              Memorizing sequence... {Math.ceil((showTime - (Date.now() % showTime)) / 1000)}s
            </div>
          )}
        </div>
      )}
      
      <div className="mb-6">
        <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto">
          {colors.map((color, i) => {
            const isCurrentTarget = showSequence && sequence[sequenceIndex] === i;
            const isInUserInput = userInput.includes(i);
            const isCurrentInput = userInput.length > 0 && userInput[userInput.length - 1] === i;
            
            return (
              <div
                key={i}
                className={`w-20 h-20 ${color.bg} rounded-lg cursor-pointer transition-all duration-300 transform relative ${
                  !isActive ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
                } ${
                  isCurrentTarget ? `ring-4 ring-white ${color.glow} shadow-lg scale-110` : ''
                } ${
                  isCorrect === false && isCurrentInput ? 'animate-shake ring-4 ring-red-400' : ''
                } ${
                  isCorrect === true && isCurrentInput ? 'animate-bounce ring-4 ring-green-400' : ''
                }`}
                onClick={() => handleInput(i)}
              >
                {showSequence && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    {sequence.map((seqVal, seqIndex) => {
                      if (seqVal === i) {
                        return (
                          <div key={seqIndex} className="text-white font-bold text-lg animate-pulse">
                            {seqIndex + 1}
                          </div>
                        );
                      }
                      return null;
                    })}
                  </div>
                )}
                
                {!showSequence && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">{color.name}</span>
                  </div>
                )}
                
                {userInput.includes(i) && !showSequence && (
                  <div className="absolute top-1 right-1 w-3 h-3 bg-white rounded-full animate-ping"></div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-purple-400">Progress</span>
          <span className="text-purple-400">{userInput.length} / {sequence.length}</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-3 max-w-xs mx-auto">
          <div 
            className={`h-3 rounded-full transition-all duration-300 ${
              isCorrect === false ? 'bg-red-500' : 'bg-gradient-to-r from-purple-500 to-pink-500'
            }`}
            style={{ width: `${(userInput.length / Math.max(sequence.length, 1)) * 100}%` }}
          ></div>
        </div>
      </div>
      
      <p className="text-purple-400 mb-4">
        {showSequence 
          ? 'Memorize the sequence!' 
          : isActive 
          ? 'Repeat the sequence!'
          : 'Ready to hack?'
        }
      </p>
      
      {!isActive && sequence.length === 0 && (
        <button onClick={generateSequence} className="cyber-glow bg-purple-600 hover:bg-purple-500 text-white px-6 py-2 rounded-lg transition-all duration-300">
          <div className="flex items-center gap-2">
            <Play className="w-4 h-4" />
            Start Hacking
          </div>
        </button>
      )}
      
      {isCorrect === true && (
        <div className="space-y-2">
          <div className="text-green-400 flex items-center justify-center gap-2">
            <Trophy className="w-5 h-5" />
            Hacking Complete!
          </div>
          <div className="text-purple-400 text-sm">
            +{30 + Math.max(0, 50 - attempts * 10) + (difficulty * 5)} tokens
            {attempts === 0 && ' (Perfect execution!)'}
          </div>
        </div>
      )}
      
      {isCorrect === false && (
        <div className="text-red-400 text-sm animate-pulse">
          Wrong sequence! Try again...
        </div>
      )}
    </div>
  );
}

// Combat Mini-game Component
function CombatGame({ onComplete }: { onComplete: (reward: number) => void }) {
  const [playerHP, setPlayerHP] = useState(100);
  const [enemyHP, setEnemyHP] = useState(100);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [gameActive, setGameActive] = useState(false);
  const [showTutorial, setShowTutorial] = useState(true);
  const [playerMana, setPlayerMana] = useState(50);
  const [combatLog, setCombatLog] = useState<string[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [lastAction, setLastAction] = useState<'attack' | 'defend' | 'magic' | null>(null);
  const [playerDefending, setPlayerDefending] = useState(false);
  const [turnCount, setTurnCount] = useState(0);

  const addToLog = (message: string) => {
    setCombatLog(prev => [...prev.slice(-2), message]);
  };

  const attack = () => {
    if (!gameActive || !isPlayerTurn || isAnimating) return;
    
    setIsAnimating(true);
    setLastAction('attack');
    const damage = Math.floor(Math.random() * 30) + 20;
    const newEnemyHP = Math.max(0, enemyHP - damage);
    setEnemyHP(newEnemyHP);
    addToLog(`You deal ${damage} damage!`);
    
    if (newEnemyHP <= 0) {
      setGameActive(false);
      const bonus = Math.max(0, 50 - turnCount * 5) + (playerHP > 50 ? 20 : 0);
      addToLog('Victory!');
      setTimeout(() => onComplete(35 + bonus), 1000);
      return;
    }
    
    setIsPlayerTurn(false);
    setPlayerDefending(false);
    
    // Enemy turn
    setTimeout(() => {
      const enemyDamage = Math.floor(Math.random() * 25) + 15;
      const actualDamage = playerDefending ? Math.floor(enemyDamage * 0.5) : enemyDamage;
      const newPlayerHP = Math.max(0, playerHP - actualDamage);
      setPlayerHP(newPlayerHP);
      addToLog(`Enemy deals ${actualDamage} damage!`);
      
      if (newPlayerHP <= 0) {
        setGameActive(false);
        addToLog('Defeat!');
      } else {
        setIsPlayerTurn(true);
        setTurnCount(prev => prev + 1);
        // Restore some mana each turn
        setPlayerMana(prev => Math.min(100, prev + 15));
      }
      setIsAnimating(false);
    }, 1500);
  };

  const defend = () => {
    if (!gameActive || !isPlayerTurn || isAnimating) return;
    
    setIsAnimating(true);
    setLastAction('defend');
    setPlayerDefending(true);
    setPlayerMana(prev => Math.min(100, prev + 25));
    addToLog('You prepare to defend and restore mana!');
    
    setIsPlayerTurn(false);
    
    // Enemy turn with reduced damage
    setTimeout(() => {
      const enemyDamage = Math.floor(Math.random() * 25) + 15;
      const actualDamage = Math.floor(enemyDamage * 0.3); // Heavy damage reduction
      const newPlayerHP = Math.max(0, playerHP - actualDamage);
      setPlayerHP(newPlayerHP);
      addToLog(`Blocked! Only ${actualDamage} damage taken!`);
      
      if (newPlayerHP <= 0) {
        setGameActive(false);
        addToLog('Defeat!');
      } else {
        setIsPlayerTurn(true);
        setTurnCount(prev => prev + 1);
      }
      setPlayerDefending(false);
      setIsAnimating(false);
    }, 1500);
  };

  const magicAttack = () => {
    if (!gameActive || !isPlayerTurn || isAnimating || playerMana < 40) return;
    
    setIsAnimating(true);
    setLastAction('magic');
    setPlayerMana(prev => prev - 40);
    const damage = Math.floor(Math.random() * 40) + 35; // Higher damage
    const newEnemyHP = Math.max(0, enemyHP - damage);
    setEnemyHP(newEnemyHP);
    addToLog(`Magic blast deals ${damage} damage!`);
    
    if (newEnemyHP <= 0) {
      setGameActive(false);
      const bonus = Math.max(0, 50 - turnCount * 5) + (playerHP > 50 ? 20 : 0) + 15; // Magic bonus
      addToLog('Victory!');
      setTimeout(() => onComplete(35 + bonus), 1000);
      return;
    }
    
    setIsPlayerTurn(false);
    setPlayerDefending(false);
    
    // Enemy turn
    setTimeout(() => {
      const enemyDamage = Math.floor(Math.random() * 25) + 15;
      const newPlayerHP = Math.max(0, playerHP - enemyDamage);
      setPlayerHP(newPlayerHP);
      addToLog(`Enemy deals ${enemyDamage} damage!`);
      
      if (newPlayerHP <= 0) {
        setGameActive(false);
        addToLog('Defeat!');
      } else {
        setIsPlayerTurn(true);
        setTurnCount(prev => prev + 1);
        setPlayerMana(prev => Math.min(100, prev + 15));
      }
      setIsAnimating(false);
    }, 1500);
  };

  const startCombat = () => {
    setGameActive(true);
    setPlayerHP(100);
    setEnemyHP(100);
    setPlayerMana(50);
    setIsPlayerTurn(true);
    setShowTutorial(false);
    setCombatLog(['Combat begins!']);
    setTurnCount(0);
    setPlayerDefending(false);
    setIsAnimating(false);
  };

  return (
    <div className="text-center">
      {showTutorial && (
        <div className="mb-6 p-4 bg-red-900/30 border border-red-500/50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Sword className="w-5 h-5 text-red-400" />
            <h3 className="text-red-400 font-semibold">Combat Tutorial</h3>
          </div>
          <p className="text-red-300 text-sm mb-2">Use Attack, Defend, or Magic to defeat your enemy!</p>
          <p className="text-red-300 text-xs">💡 Tip: Defending reduces damage and restores mana!</p>
        </div>
      )}
      
      <div className="mb-6 flex justify-between items-center max-w-lg mx-auto">
        <div className="text-left">
          <p className="text-green-400 font-semibold mb-1">Player</p>
          <div className="w-36 bg-gray-700 rounded-full h-4 mb-1">
            <div 
              className={`h-4 rounded-full transition-all duration-500 ${
                playerHP > 60 ? 'bg-green-500' : playerHP > 30 ? 'bg-yellow-500' : 'bg-red-500'
              } ${lastAction === 'defend' ? 'animate-pulse' : ''}`}
              style={{ width: `${playerHP}%` }}
            ></div>
          </div>
          <p className="text-sm text-green-300 mb-2">{playerHP}/100 HP</p>
          
          <div className="w-36 bg-gray-700 rounded-full h-2">
            <div className="bg-blue-500 h-2 rounded-full transition-all duration-300" style={{ width: `${playerMana}%` }}></div>
          </div>
          <p className="text-xs text-blue-300">{playerMana}/100 MP</p>
        </div>
        
        <div className="flex flex-col items-center">
          <Sword className={`w-10 h-10 text-red-400 transition-transform duration-300 ${
            isAnimating ? 'scale-125 rotate-12' : ''
          }`} />
          <p className="text-xs text-gray-400 mt-1">Turn {turnCount + 1}</p>
        </div>
        
        <div className="text-right">
          <p className="text-red-400 font-semibold mb-1">Enemy</p>
          <div className="w-36 bg-gray-700 rounded-full h-4 mb-1">
            <div 
              className={`bg-red-500 h-4 rounded-full transition-all duration-500 ${
                lastAction === 'attack' || lastAction === 'magic' ? 'animate-pulse' : ''
              }`}
              style={{ width: `${enemyHP}%` }}
            ></div>
          </div>
          <p className="text-sm text-red-300">{enemyHP}/100 HP</p>
        </div>
      </div>
      
      {/* Combat Log */}
      {gameActive && combatLog.length > 0 && (
        <div className="mb-4 p-3 bg-gray-800/50 rounded-lg max-w-md mx-auto">
          <h4 className="text-cyan-400 text-sm font-semibold mb-2">Combat Log</h4>
          {combatLog.map((log, index) => (
            <p key={index} className="text-gray-300 text-xs mb-1">{log}</p>
          ))}
        </div>
      )}
      
      {gameActive && (
        <p className={`text-cyan-400 mb-4 transition-all duration-300 ${
          isAnimating ? 'animate-pulse' : ''
        }`}>
          {isPlayerTurn && !isAnimating ? 'Choose your action!' : isAnimating ? 'Action in progress...' : 'Enemy turn...'}
        </p>
      )}
      
      {!gameActive && playerHP > 0 && enemyHP <= 0 && (
        <div className="space-y-2 mb-4">
          <div className="text-green-400 flex items-center justify-center gap-2">
            <Trophy className="w-5 h-5" />
            Victory!
          </div>
          <div className="text-green-300 text-sm">
            +{35 + Math.max(0, 50 - turnCount * 5) + (playerHP > 50 ? 20 : 0) + (lastAction === 'magic' ? 15 : 0)} tokens
            {turnCount <= 3 && ' (Quick victory bonus!)'}
          </div>
        </div>
      )}
      
      {!gameActive && playerHP <= 0 && (
        <div className="text-red-400 mb-4 flex items-center justify-center gap-2">
          <Sword className="w-5 h-5" />
          Defeated! Try again.
        </div>
      )}
      
      {!gameActive && enemyHP === 100 && (
        <button onClick={startCombat} className="cyber-glow bg-red-600 hover:bg-red-500 text-white px-6 py-2 rounded-lg transition-all duration-300">
          <div className="flex items-center gap-2">
            <Play className="w-4 h-4" />
            Start Combat
          </div>
        </button>
      )}
      
      {gameActive && isPlayerTurn && !isAnimating && (
        <div className="flex gap-3 justify-center flex-wrap">
          <button 
            onClick={attack}
            className="cyber-glow bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg transition-all duration-300 flex items-center gap-2"
          >
            <Sword className="w-4 h-4" />
            Attack
          </button>
          
          <button 
            onClick={defend}
            className="cyber-glow bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg transition-all duration-300 flex items-center gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            Defend
          </button>
          
          <button 
            onClick={magicAttack}
            disabled={playerMana < 40}
            className={`cyber-glow text-white px-4 py-2 rounded-lg transition-all duration-300 flex items-center gap-2 ${
              playerMana >= 40 
                ? 'bg-purple-600 hover:bg-purple-500' 
                : 'bg-gray-600 cursor-not-allowed opacity-50'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Magic (40 MP)
          </button>
        </div>
      )}
    </div>
  );
}

// Magic Mini-game Component
function MagicGame({ onComplete }: { onComplete: (reward: number) => void }) {
  const [mana, setMana] = useState(100);
  const [spellsCast, setSpellsCast] = useState(0);
  const [isCharging, setIsCharging] = useState(false);
  const [showTutorial, setShowTutorial] = useState(true);
  const [activeSpells, setActiveSpells] = useState<string[]>([]);
  const [spellCombo, setSpellCombo] = useState(0);
  const [lastSpellTime, setLastSpellTime] = useState(0);
  const [spellPower, setSpellPower] = useState(1);
  const [isAnimating, setIsAnimating] = useState(false);
  const targetSpells = 5;

  const spellTypes = [
    { name: 'Fireball', cost: 25, power: 1, color: 'text-red-400', icon: '🔥' },
    { name: 'Lightning', cost: 35, power: 1.5, color: 'text-yellow-400', icon: '⚡' },
    { name: 'Frost', cost: 30, power: 1.2, color: 'text-blue-400', icon: '❄️' },
    { name: 'Heal', cost: 20, power: 0.8, color: 'text-green-400', icon: '💚' }
  ];

  const castSpell = (spellIndex: number) => {
    const spell = spellTypes[spellIndex];
    if (mana < spell.cost || isCharging || isAnimating) return;
    
    setIsAnimating(true);
    setShowTutorial(false);
    
    const now = Date.now();
    const timeDiff = now - lastSpellTime;
    
    // Combo system for quick casting
    if (timeDiff < 2000 && spellCombo < 3) {
      setSpellCombo(prev => prev + 1);
      setSpellPower(1 + spellCombo * 0.3);
    } else {
      setSpellCombo(0);
      setSpellPower(1);
    }
    
    setLastSpellTime(now);
    setMana(prev => prev - spell.cost);
    setSpellsCast(prev => prev + 1);
    
    // Add visual spell effect
    setActiveSpells(prev => [...prev, `${spell.name}-${Date.now()}`]);
    
    // Remove spell effect after animation
    setTimeout(() => {
      setActiveSpells(prev => prev.filter(s => !s.includes(`${spell.name}-${Date.now()}`)));
      setIsAnimating(false);
    }, 1000);
    
    if (spellsCast + 1 >= targetSpells) {
      const comboBonus = spellCombo * 10;
      const efficiencyBonus = mana > 20 ? 15 : 0;
      setTimeout(() => {
        onComplete(40 + comboBonus + efficiencyBonus);
      }, 1000);
    }
  };

  const chargeMana = () => {
    if (isCharging || isAnimating) return;
    setIsCharging(true);
    setShowTutorial(false);
    
    const interval = setInterval(() => {
      setMana(prev => {
        const newMana = Math.min(100, prev + 12);
        if (newMana >= 100) {
          setIsCharging(false);
          clearInterval(interval);
        }
        return newMana;
      });
    }, 150);
  };

  const meditate = () => {
    if (isCharging || isAnimating) return;
    setIsAnimating(true);
    setShowTutorial(false);
    
    // Meditation restores mana and increases spell power temporarily
    setMana(prev => Math.min(100, prev + 40));
    setSpellPower(prev => prev + 0.5);
    
    setTimeout(() => {
      setIsAnimating(false);
    }, 2000);
  };

  return (
    <div className="text-center">
      {showTutorial && (
        <div className="mb-6 p-4 bg-purple-900/30 border border-purple-500/50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <h3 className="text-purple-400 font-semibold">Magic Tutorial</h3>
          </div>
          <p className="text-purple-300 text-sm mb-2">Cast {targetSpells} spells using different magic types!</p>
          <p className="text-purple-300 text-xs">💡 Tip: Quick casting builds combo multipliers!</p>
        </div>
      )}
      
      <div className="mb-6 relative">
        <div className={`w-40 h-40 mx-auto bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center transition-all duration-500 ${
          isAnimating ? 'scale-110 shadow-2xl shadow-purple-500/50' : 'scale-100'
        } ${isCharging ? 'animate-pulse' : ''}`}>
          <Sparkles className={`w-20 h-20 text-purple-200 transition-all duration-300 ${
            spellCombo > 0 ? 'animate-spin' : ''
          }`} />
          
          {/* Floating spell effects */}
          {activeSpells.map((spell, index) => (
            <div 
              key={spell}
              className="absolute animate-ping"
              style={{
                top: `${20 + index * 15}%`,
                left: `${20 + index * 20}%`,
                fontSize: '24px'
              }}
            >
              {spellTypes.find(s => spell.includes(s.name))?.icon}
            </div>
          ))}
        </div>
        
        {spellCombo > 0 && (
          <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-purple-500 text-white px-3 py-1 rounded-full text-sm font-bold animate-bounce">
            {spellCombo}x COMBO! Power: {spellPower.toFixed(1)}x
          </div>
        )}
      </div>
      
      <div className="mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-purple-400">Mana</span>
          <span className={`${mana < 30 ? 'text-red-400 animate-pulse' : 'text-purple-400'}`}>
            {mana}/100
          </span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-4 max-w-md mx-auto relative overflow-hidden">
          <div 
            className={`h-4 rounded-full transition-all duration-300 ${
              isCharging ? 'bg-gradient-to-r from-blue-400 to-purple-500 animate-pulse' : 'bg-gradient-to-r from-purple-500 to-blue-500'
            }`}
            style={{ width: `${mana}%` }}
          >
            <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
          </div>
        </div>
      </div>
      
      <div className="mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-purple-400">Progress</span>
          <span className="text-purple-400">{spellsCast} / {targetSpells} spells</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-3 max-w-md mx-auto">
          <div 
            className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-500"
            style={{ width: `${(spellsCast / targetSpells) * 100}%` }}
          ></div>
        </div>
      </div>
      
      {/* Spell Buttons */}
      <div className="grid grid-cols-2 gap-3 max-w-md mx-auto mb-4">
        {spellTypes.map((spell, index) => (
          <button 
            key={spell.name}
            onClick={() => castSpell(index)} 
            disabled={mana < spell.cost || isCharging || isAnimating}
            className={`cyber-glow text-white px-4 py-3 rounded-lg transition-all duration-300 flex items-center gap-2 justify-center ${
              mana >= spell.cost && !isCharging && !isAnimating
                ? 'bg-purple-600 hover:bg-purple-500 hover:scale-105' 
                : 'bg-gray-600 cursor-not-allowed opacity-50'
            }`}
          >
            <span className="text-lg">{spell.icon}</span>
            <div className="text-left">
              <div className={`text-sm font-semibold ${spell.color}`}>{spell.name}</div>
              <div className="text-xs text-gray-300">{spell.cost} mana</div>
            </div>
          </button>
        ))}
      </div>
      
      {/* Utility Actions */}
      <div className="flex gap-3 justify-center mb-4">
        <button 
          onClick={chargeMana} 
          disabled={isCharging || mana >= 100 || isAnimating}
          className={`cyber-glow text-white px-4 py-2 rounded-lg transition-all duration-300 flex items-center gap-2 ${
            !isCharging && mana < 100 && !isAnimating
              ? 'bg-blue-600 hover:bg-blue-500' 
              : 'bg-gray-600 cursor-not-allowed opacity-50'
          }`}
        >
          <Zap className="w-4 h-4" />
          {isCharging ? 'Charging...' : 'Charge Mana'}
        </button>
        
        <button 
          onClick={meditate}
          disabled={isCharging || isAnimating}
          className={`cyber-glow text-white px-4 py-2 rounded-lg transition-all duration-300 flex items-center gap-2 ${
            !isCharging && !isAnimating
              ? 'bg-indigo-600 hover:bg-indigo-500' 
              : 'bg-gray-600 cursor-not-allowed opacity-50'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          Meditate
        </button>
      </div>
      
      {spellsCast >= targetSpells && (
        <div className="space-y-2">
          <div className="text-green-400 flex items-center justify-center gap-2">
            <Trophy className="w-5 h-5" />
            Magic Training Complete!
          </div>
          <div className="text-purple-400 text-sm">
            +{40 + (spellCombo * 10) + (mana > 20 ? 15 : 0)} tokens
            {spellCombo > 0 && ` (+${spellCombo * 10} combo bonus!)`}
            {mana > 20 && ' (+15 efficiency bonus!)'}
          </div>
        </div>
      )}
    </div>
  );
}

const activities: ActivityData[] = [
  {
    id: 'mining',
    name: 'Mining',
    description: 'Extract valuable resources from the digital realm',
    icon: Pickaxe,
    color: 'text-yellow-400',
    minigame: MiningGame
  },
  {
    id: 'scanning',
    name: 'Scanning',
    description: 'Discover hidden secrets in the environment',
    icon: Search,
    color: 'text-cyan-400',
    minigame: ScanningGame
  },
  {
    id: 'hacking',
    name: 'Hacking',
    description: 'Infiltrate systems and unlock encrypted data',
    icon: Terminal,
    color: 'text-purple-400',
    minigame: HackingGame
  },
  {
    id: 'combat',
    name: 'Combat',
    description: 'Engage in tactical battles against enemies',
    icon: Sword,
    color: 'text-red-400',
    minigame: CombatGame
  },
  {
    id: 'magic',
    name: 'Magic',
    description: 'Harness mystical powers and cast spells',
    icon: Sparkles,
    color: 'text-purple-400',
    minigame: MagicGame
  }
];

export default function TutorialGameplay() {
  const { 
    selectedFaction, 
    tokenBalance, 
    progress, 
    addTokens, 
    updateProgress, 
    setCurrentPage,
    completeTutorial,
    setShowOverlay
  } = useGameStore();
  
  const [currentActivity, setCurrentActivity] = useState<Activity | null>(null);
  const [completedActivities, setCompletedActivities] = useState<Activity[]>([]);

  const handleActivityComplete = (activity: Activity, reward: number) => {
    // Award tokens to all factions during tutorial
    addTokens('SUGAW', reward);
    addTokens('WAGUS', reward);
    addTokens('BONK', reward);
    updateProgress(activity, 100);
    setCompletedActivities(prev => [...prev, activity]);
    
    // Check if all activities are completed
    if (completedActivities.length + 1 === activities.length) {
      completeTutorial();
    }
    setCurrentActivity(null);
  };

  const getFactionColor = () => {
    switch (selectedFaction) {
      case 'SUGAW': return 'text-red-400';
      case 'WAGUS': return 'text-white';
      case 'BONK': return 'text-orange-400';
      default: return 'text-cyan-400';
    }
  };

  const getTotalTokens = () => {
    return tokenBalance.SUGAW + tokenBalance.WAGUS + tokenBalance.BONK;
  };

  if (currentActivity) {
    const activity = activities.find(a => a.id === currentActivity)!;
    const Minigame = activity.minigame;
    
    return (
      <div className="min-h-screen cyber-grid flex items-center justify-center relative overflow-hidden">
        <div className="glass-panel p-8 max-w-2xl mx-auto relative z-10">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <activity.icon className={`w-8 h-8 ${activity.color}`} />
              <h2 className={`text-3xl font-bold ${activity.color}`}>{activity.name}</h2>
            </div>
            <p className="text-cyan-300 opacity-80">{activity.description}</p>
          </div>
          
          <div className="mb-8">
            <Minigame onComplete={(reward) => handleActivityComplete(currentActivity, reward)} />
          </div>
          
          <div className="text-center">
            <button 
              onClick={() => setCurrentActivity(null)}
              className="text-gray-400 hover:text-gray-200 transition-colors duration-200"
            >
              Back to Activities
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen cyber-grid p-8 relative overflow-hidden">
      {/* Header */}
      <div className="glass-panel p-6 mb-8 max-w-6xl mx-auto">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-cyan-400 mb-2">Tutorial Training</h1>
            <p className="text-cyan-300 opacity-80">Master the core mechanics of the digital realm</p>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="text-sm text-gray-400">Status</p>
              <p className="text-xl font-bold text-cyan-400">Training</p>
            </div>
            
            <div className="text-center">
              <p className="text-sm text-gray-400">Tokens Earned</p>
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-cyan-400" />
                <p className="text-xl font-bold text-cyan-400">{getTotalTokens()}</p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button 
                onClick={() => setCurrentPage('inventory')}
                className="cyber-glow bg-cyan-600 hover:bg-cyan-500 text-white p-2 rounded-lg transition-all duration-300"
              >
                <Package className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setCurrentPage('progress')}
                className="cyber-glow bg-cyan-600 hover:bg-cyan-500 text-white p-2 rounded-lg transition-all duration-300"
              >
                <BarChart3 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Activities Grid */}
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activities.map((activity) => {
            const Icon = activity.icon;
            const isCompleted = completedActivities.includes(activity.id);
            const progressValue = progress[activity.id];
            
            return (
              <div key={activity.id} className="glass-panel p-6 relative">
                {isCompleted && (
                  <div className="absolute top-4 right-4">
                    <CheckCircle className="w-6 h-6 text-green-400" />
                  </div>
                )}
                
                <div className="text-center mb-6">
                  <div className="flex justify-center mb-4">
                    <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${activity.color.includes('yellow') ? 'from-yellow-600 to-orange-700' : activity.color.includes('cyan') ? 'from-cyan-600 to-blue-700' : activity.color.includes('purple') ? 'from-purple-600 to-blue-700' : activity.color.includes('red') ? 'from-red-600 to-red-700' : 'from-purple-600 to-blue-700'} flex items-center justify-center`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <h3 className={`text-xl font-bold ${activity.color} mb-2`}>{activity.name}</h3>
                  <p className="text-gray-300 text-sm mb-4">{activity.description}</p>
                </div>
                
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">Progress</span>
                    <span className={activity.color}>{progressValue}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${activity.color.includes('yellow') ? 'bg-yellow-500' : activity.color.includes('cyan') ? 'bg-cyan-500' : activity.color.includes('purple') ? 'bg-purple-500' : activity.color.includes('red') ? 'bg-red-500' : 'bg-purple-500'}`}
                      style={{ width: `${progressValue}%` }}
                    ></div>
                  </div>
                </div>
                
                <button 
                  onClick={() => setCurrentActivity(activity.id)}
                  disabled={isCompleted}
                  className={`w-full py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                    isCompleted 
                      ? 'bg-green-600/20 text-green-400 cursor-not-allowed' 
                      : `cyber-glow ${activity.color.includes('yellow') ? 'bg-yellow-600 hover:bg-yellow-500' : activity.color.includes('cyan') ? 'bg-cyan-600 hover:bg-cyan-500' : activity.color.includes('purple') ? 'bg-purple-600 hover:bg-purple-500' : activity.color.includes('red') ? 'bg-red-600 hover:bg-red-500' : 'bg-purple-600 hover:bg-purple-500'} text-white`
                  }`}
                >
                  {isCompleted ? (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Completed
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5" />
                      Start Training
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
        
        {completedActivities.length === activities.length && (
          <div className="glass-panel p-8 mt-8 text-center">
            <h2 className="text-3xl font-bold text-green-400 mb-4">Training Complete!</h2>
            <p className="text-cyan-300 mb-6">You have mastered all core mechanics. Now it's time to choose your faction and begin your journey!</p>
            <div className="flex justify-center gap-4">
              <button 
                onClick={() => {
                  setShowOverlay(true);
                  setCurrentPage('faction-selection');
                }}
                className="cyber-glow bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white px-8 py-3 rounded-lg font-semibold"
              >
                Choose Your Faction
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}