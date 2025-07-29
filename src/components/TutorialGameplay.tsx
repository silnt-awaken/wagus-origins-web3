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
  CheckCircle
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

  const handleMine = () => {
    if (!isActive) return;
    const newClicks = clicks + 1;
    setClicks(newClicks);
    if (newClicks >= targetClicks) {
      setIsActive(false);
      onComplete(25);
    }
  };

  const startMining = () => {
    setIsActive(true);
    setClicks(0);
  };

  return (
    <div className="text-center">
      <div className="mb-6">
        <div className="w-32 h-32 mx-auto bg-gradient-to-br from-yellow-600 to-orange-700 rounded-lg flex items-center justify-center cursor-pointer transform transition-transform hover:scale-105" onClick={handleMine}>
          <Pickaxe className="w-16 h-16 text-yellow-200" />
        </div>
      </div>
      <div className="mb-4">
        <div className="w-full bg-gray-700 rounded-full h-4">
          <div 
            className="bg-yellow-500 h-4 rounded-full transition-all duration-300"
            style={{ width: `${(clicks / targetClicks) * 100}%` }}
          ></div>
        </div>
        <p className="text-yellow-400 mt-2">{clicks} / {targetClicks} clicks</p>
      </div>
      {!isActive && clicks === 0 && (
        <button onClick={startMining} className="cyber-glow bg-yellow-600 hover:bg-yellow-500 text-white px-6 py-2 rounded-lg">
          Start Mining
        </button>
      )}
      {clicks >= targetClicks && (
        <div className="text-green-400 flex items-center justify-center gap-2">
          <CheckCircle className="w-5 h-5" />
          Mining Complete! +25 tokens
        </div>
      )}
    </div>
  );
}

// Scanning Mini-game Component
function ScanningGame({ onComplete }: { onComplete: (reward: number) => void }) {
  const [foundItems, setFoundItems] = useState<number[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const hiddenItems = [1, 3, 5, 7]; // positions of hidden items

  const handleScan = (position: number) => {
    if (!isScanning || foundItems.includes(position)) return;
    
    if (hiddenItems.includes(position)) {
      const newFound = [...foundItems, position];
      setFoundItems(newFound);
      if (newFound.length === hiddenItems.length) {
        setIsScanning(false);
        onComplete(20);
      }
    }
  };

  const startScanning = () => {
    setIsScanning(true);
    setFoundItems([]);
  };

  return (
    <div className="text-center">
      <div className="mb-6">
        <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto">
          {Array.from({ length: 9 }, (_, i) => (
            <div
              key={i}
              className={`w-16 h-16 border-2 rounded-lg cursor-pointer transition-all duration-300 ${
                foundItems.includes(i) 
                  ? 'bg-green-500 border-green-400' 
                  : hiddenItems.includes(i) && isScanning
                  ? 'border-cyan-400 hover:bg-cyan-500/20'
                  : 'border-gray-600 hover:border-gray-500'
              }`}
              onClick={() => handleScan(i)}
            >
              {foundItems.includes(i) && <Search className="w-8 h-8 text-white mx-auto mt-2" />}
            </div>
          ))}
        </div>
      </div>
      <p className="text-cyan-400 mb-4">Found: {foundItems.length} / {hiddenItems.length} items</p>
      {!isScanning && foundItems.length === 0 && (
        <button onClick={startScanning} className="cyber-glow bg-cyan-600 hover:bg-cyan-500 text-white px-6 py-2 rounded-lg">
          Start Scanning
        </button>
      )}
      {foundItems.length === hiddenItems.length && (
        <div className="text-green-400 flex items-center justify-center gap-2">
          <CheckCircle className="w-5 h-5" />
          Scanning Complete! +20 tokens
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

  const generateSequence = () => {
    const newSequence = Array.from({ length: 4 }, () => Math.floor(Math.random() * 4));
    setSequence(newSequence);
    setUserInput([]);
    setIsActive(true);
    setShowSequence(true);
    
    setTimeout(() => setShowSequence(false), 2000);
  };

  const handleInput = (value: number) => {
    if (!isActive || showSequence) return;
    
    const newInput = [...userInput, value];
    setUserInput(newInput);
    
    if (newInput.length === sequence.length) {
      if (JSON.stringify(newInput) === JSON.stringify(sequence)) {
        setIsActive(false);
        onComplete(30);
      } else {
        // Reset on wrong sequence
        setTimeout(() => {
          setUserInput([]);
        }, 1000);
      }
    }
  };

  const colors = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500'];

  return (
    <div className="text-center">
      <div className="mb-6">
        <div className="grid grid-cols-2 gap-2 max-w-xs mx-auto">
          {colors.map((color, i) => (
            <div
              key={i}
              className={`w-16 h-16 ${color} rounded-lg cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                showSequence && sequence[userInput.length] === i ? 'ring-4 ring-white' : ''
              } ${
                userInput.includes(i) ? 'opacity-50' : ''
              }`}
              onClick={() => handleInput(i)}
            >
              {showSequence && sequence.includes(i) && (
                <div className="w-full h-full flex items-center justify-center text-white font-bold">
                  {sequence.indexOf(i) + 1}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      <p className="text-purple-400 mb-4">
        {showSequence ? 'Memorize the sequence!' : `Input: ${userInput.length} / ${sequence.length}`}
      </p>
      {!isActive && (
        <button onClick={generateSequence} className="cyber-glow bg-purple-600 hover:bg-purple-500 text-white px-6 py-2 rounded-lg">
          Start Hacking
        </button>
      )}
      {userInput.length === sequence.length && JSON.stringify(userInput) === JSON.stringify(sequence) && (
        <div className="text-green-400 flex items-center justify-center gap-2">
          <CheckCircle className="w-5 h-5" />
          Hacking Complete! +30 tokens
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

  const attack = () => {
    if (!gameActive || !isPlayerTurn) return;
    
    const damage = Math.floor(Math.random() * 30) + 20;
    const newEnemyHP = Math.max(0, enemyHP - damage);
    setEnemyHP(newEnemyHP);
    
    if (newEnemyHP <= 0) {
      setGameActive(false);
      onComplete(35);
      return;
    }
    
    setIsPlayerTurn(false);
    
    // Enemy turn
    setTimeout(() => {
      const enemyDamage = Math.floor(Math.random() * 25) + 15;
      const newPlayerHP = Math.max(0, playerHP - enemyDamage);
      setPlayerHP(newPlayerHP);
      
      if (newPlayerHP <= 0) {
        setGameActive(false);
      } else {
        setIsPlayerTurn(true);
      }
    }, 1000);
  };

  const startCombat = () => {
    setGameActive(true);
    setPlayerHP(100);
    setEnemyHP(100);
    setIsPlayerTurn(true);
  };

  return (
    <div className="text-center">
      <div className="mb-6 flex justify-between items-center max-w-md mx-auto">
        <div className="text-left">
          <p className="text-green-400 font-semibold">Player</p>
          <div className="w-32 bg-gray-700 rounded-full h-3">
            <div className="bg-green-500 h-3 rounded-full transition-all duration-300" style={{ width: `${playerHP}%` }}></div>
          </div>
          <p className="text-sm text-green-300">{playerHP}/100 HP</p>
        </div>
        <Sword className="w-8 h-8 text-red-400" />
        <div className="text-right">
          <p className="text-red-400 font-semibold">Enemy</p>
          <div className="w-32 bg-gray-700 rounded-full h-3">
            <div className="bg-red-500 h-3 rounded-full transition-all duration-300" style={{ width: `${enemyHP}%` }}></div>
          </div>
          <p className="text-sm text-red-300">{enemyHP}/100 HP</p>
        </div>
      </div>
      
      {gameActive && (
        <p className="text-cyan-400 mb-4">
          {isPlayerTurn ? 'Your turn!' : 'Enemy attacking...'}
        </p>
      )}
      
      {!gameActive && playerHP > 0 && enemyHP <= 0 && (
        <div className="text-green-400 flex items-center justify-center gap-2 mb-4">
          <CheckCircle className="w-5 h-5" />
          Victory! +35 tokens
        </div>
      )}
      
      {!gameActive && playerHP <= 0 && (
        <div className="text-red-400 mb-4">Defeated! Try again.</div>
      )}
      
      {!gameActive && enemyHP === 100 && (
        <button onClick={startCombat} className="cyber-glow bg-red-600 hover:bg-red-500 text-white px-6 py-2 rounded-lg">
          Start Combat
        </button>
      )}
      
      {gameActive && isPlayerTurn && (
        <button onClick={attack} className="cyber-glow bg-red-600 hover:bg-red-500 text-white px-6 py-2 rounded-lg">
          Attack!
        </button>
      )}
    </div>
  );
}

// Magic Mini-game Component
function MagicGame({ onComplete }: { onComplete: (reward: number) => void }) {
  const [mana, setMana] = useState(100);
  const [spellsCast, setSpellsCast] = useState(0);
  const [isCharging, setIsCharging] = useState(false);
  const targetSpells = 3;

  const castSpell = () => {
    if (mana < 30 || isCharging) return;
    
    setMana(mana - 30);
    setSpellsCast(spellsCast + 1);
    
    if (spellsCast + 1 >= targetSpells) {
      onComplete(40);
    }
  };

  const chargeMana = () => {
    if (isCharging) return;
    setIsCharging(true);
    
    const interval = setInterval(() => {
      setMana(prev => {
        const newMana = Math.min(100, prev + 10);
        if (newMana >= 100) {
          setIsCharging(false);
          clearInterval(interval);
        }
        return newMana;
      });
    }, 200);
  };

  return (
    <div className="text-center">
      <div className="mb-6">
        <div className="w-32 h-32 mx-auto bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
          <Sparkles className="w-16 h-16 text-purple-200" />
        </div>
      </div>
      
      <div className="mb-4">
        <p className="text-purple-400 mb-2">Mana: {mana}/100</p>
        <div className="w-full bg-gray-700 rounded-full h-4 max-w-xs mx-auto">
          <div className="bg-purple-500 h-4 rounded-full transition-all duration-300" style={{ width: `${mana}%` }}></div>
        </div>
      </div>
      
      <p className="text-purple-300 mb-4">Spells Cast: {spellsCast} / {targetSpells}</p>
      
      <div className="space-x-4">
        <button 
          onClick={castSpell} 
          disabled={mana < 30 || isCharging}
          className="cyber-glow bg-purple-600 hover:bg-purple-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg"
        >
          Cast Spell (30 mana)
        </button>
        <button 
          onClick={chargeMana} 
          disabled={isCharging || mana >= 100}
          className="cyber-glow bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg"
        >
          {isCharging ? 'Charging...' : 'Charge Mana'}
        </button>
      </div>
      
      {spellsCast >= targetSpells && (
        <div className="text-green-400 flex items-center justify-center gap-2 mt-4">
          <CheckCircle className="w-5 h-5" />
          Magic Training Complete! +40 tokens
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