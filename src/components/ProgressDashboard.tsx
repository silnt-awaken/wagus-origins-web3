import { useGameStore } from '@/store/gameStore';
import { 
  BarChart3, 
  ArrowLeft, 
  Trophy, 
  Target, 
  Coins, 
  Star,
  CheckCircle,
  Clock,
  TrendingUp
} from 'lucide-react';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  unlocked: boolean;
  progress: number;
  maxProgress: number;
}

export default function ProgressDashboard() {
  const { 
    setCurrentPage, 
    selectedFaction, 
    tokenBalance, 
    progress, 
    tutorialCompleted 
  } = useGameStore();

  const getFactionColor = () => {
    switch (selectedFaction) {
      case 'SUGAW': return 'text-red-400';
      case 'WAGUS': return 'text-white';
      case 'BONK': return 'text-orange-400';
      default: return 'text-cyan-400';
    }
  };

  const getFactionGradient = () => {
    switch (selectedFaction) {
      case 'SUGAW': return 'from-red-500 to-red-600';
      case 'WAGUS': return 'from-gray-600 to-gray-700';
      case 'BONK': return 'from-orange-500 to-orange-600';
      default: return 'from-cyan-500 to-blue-600';
    }
  };

  const getFactionTokens = () => {
    if (!selectedFaction) return 0;
    return tokenBalance[selectedFaction];
  };

  const getTotalProgress = () => {
    const activities = Object.values(progress);
    return Math.round(activities.reduce((sum, val) => sum + val, 0) / activities.length);
  };

  const getCompletedActivities = () => {
    return Object.values(progress).filter(val => val >= 100).length;
  };

  const getTotalActivities = () => {
    return Object.keys(progress).length;
  };

  // Mock achievements based on progress
  const achievements: Achievement[] = [
    {
      id: 'first_mine',
      name: 'First Strike',
      description: 'Complete your first mining session',
      icon: Trophy,
      unlocked: progress.mining >= 100,
      progress: Math.min(progress.mining, 100),
      maxProgress: 100
    },
    {
      id: 'scanner',
      name: 'Digital Detective',
      description: 'Master the scanning mechanics',
      icon: Target,
      unlocked: progress.scanning >= 100,
      progress: Math.min(progress.scanning, 100),
      maxProgress: 100
    },
    {
      id: 'hacker',
      name: 'System Infiltrator',
      description: 'Successfully hack a secure system',
      icon: Star,
      unlocked: progress.hacking >= 100,
      progress: Math.min(progress.hacking, 100),
      maxProgress: 100
    },
    {
      id: 'warrior',
      name: 'Combat Veteran',
      description: 'Win your first battle',
      icon: CheckCircle,
      unlocked: progress.combat >= 100,
      progress: Math.min(progress.combat, 100),
      maxProgress: 100
    },
    {
      id: 'mage',
      name: 'Spell Weaver',
      description: 'Master the magical arts',
      icon: Star,
      unlocked: progress.magic >= 100,
      progress: Math.min(progress.magic, 100),
      maxProgress: 100
    },
    {
      id: 'completionist',
      name: 'Tutorial Master',
      description: 'Complete all tutorial activities',
      icon: Trophy,
      unlocked: tutorialCompleted,
      progress: getCompletedActivities(),
      maxProgress: getTotalActivities()
    }
  ];

  const unlockedAchievements = achievements.filter(a => a.unlocked);

  return (
    <div className="min-h-screen cyber-grid p-8 relative overflow-hidden">
      {/* Header */}
      <div className="glass-panel p-6 mb-8 max-w-6xl mx-auto">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setCurrentPage('tutorial')}
              className="cyber-glow bg-gray-600 hover:bg-gray-500 text-white p-2 rounded-lg transition-all duration-300"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-cyan-400 flex items-center gap-3">
                <BarChart3 className="w-8 h-8" />
                Progress Dashboard
              </h1>
              <p className="text-cyan-300 opacity-80">Track your journey through the digital realm</p>
            </div>
          </div>
          
          <div className="text-center">
            <p className="text-sm text-gray-400">Current Faction</p>
            <p className={`text-2xl font-bold ${getFactionColor()}`}>{selectedFaction}</p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto space-y-8">
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="glass-panel p-6 text-center">
            <div className="flex justify-center mb-3">
              <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${getFactionGradient()} flex items-center justify-center`}>
                <Coins className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-2xl font-bold text-cyan-400">{getFactionTokens()}</p>
            <p className="text-gray-400 text-sm">Total Tokens</p>
          </div>
          
          <div className="glass-panel p-6 text-center">
            <div className="flex justify-center mb-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-2xl font-bold text-green-400">{getTotalProgress()}%</p>
            <p className="text-gray-400 text-sm">Overall Progress</p>
          </div>
          
          <div className="glass-panel p-6 text-center">
            <div className="flex justify-center mb-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-2xl font-bold text-purple-400">{getCompletedActivities()}/{getTotalActivities()}</p>
            <p className="text-gray-400 text-sm">Activities Done</p>
          </div>
          
          <div className="glass-panel p-6 text-center">
            <div className="flex justify-center mb-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-yellow-500 to-yellow-600 flex items-center justify-center">
                <Trophy className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-2xl font-bold text-yellow-400">{unlockedAchievements.length}</p>
            <p className="text-gray-400 text-sm">Achievements</p>
          </div>
        </div>

        {/* Activity Progress */}
        <div className="glass-panel p-8">
          <h2 className="text-2xl font-bold text-cyan-400 mb-6 flex items-center gap-3">
            <Target className="w-6 h-6" />
            Activity Progress
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {Object.entries(progress).map(([activity, value]) => {
              const getActivityColor = (act: string) => {
                switch (act) {
                  case 'mining': return 'text-yellow-400';
                  case 'scanning': return 'text-cyan-400';
                  case 'hacking': return 'text-purple-400';
                  case 'combat': return 'text-red-400';
                  case 'magic': return 'text-blue-400';
                  default: return 'text-gray-400';
                }
              };
              
              const getActivityBg = (act: string) => {
                switch (act) {
                  case 'mining': return 'bg-yellow-500';
                  case 'scanning': return 'bg-cyan-500';
                  case 'hacking': return 'bg-purple-500';
                  case 'combat': return 'bg-red-500';
                  case 'magic': return 'bg-blue-500';
                  default: return 'bg-gray-500';
                }
              };
              
              return (
                <div key={activity} className="text-center">
                  <div className="relative w-20 h-20 mx-auto mb-4">
                    <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-gray-700"
                        stroke="currentColor"
                        strokeWidth="3"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className={getActivityColor(activity)}
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeDasharray={`${value}, 100`}
                        strokeLinecap="round"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className={`text-sm font-bold ${getActivityColor(activity)}`}>
                        {Math.round(value)}%
                      </span>
                    </div>
                  </div>
                  <h3 className={`font-semibold capitalize ${getActivityColor(activity)}`}>
                    {activity}
                  </h3>
                  {value >= 100 && (
                    <CheckCircle className="w-5 h-5 text-green-400 mx-auto mt-2" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Achievements */}
        <div className="glass-panel p-8">
          <h2 className="text-2xl font-bold text-cyan-400 mb-6 flex items-center gap-3">
            <Trophy className="w-6 h-6" />
            Achievements
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {achievements.map((achievement) => {
              const Icon = achievement.icon;
              return (
                <div 
                  key={achievement.id}
                  className={`glass-panel p-6 transition-all duration-300 ${
                    achievement.unlocked 
                      ? 'border-yellow-500/50 bg-yellow-500/10' 
                      : 'border-gray-600/50 opacity-60'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      achievement.unlocked 
                        ? 'bg-yellow-500 text-white' 
                        : 'bg-gray-600 text-gray-400'
                    }`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    
                    <div className="flex-1">
                      <h3 className={`font-bold mb-1 ${
                        achievement.unlocked ? 'text-yellow-400' : 'text-gray-400'
                      }`}>
                        {achievement.name}
                      </h3>
                      <p className="text-gray-300 text-sm mb-3">
                        {achievement.description}
                      </p>
                      
                      {!achievement.unlocked && (
                        <div>
                          <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                            <div 
                              className="bg-cyan-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }}
                            ></div>
                          </div>
                          <p className="text-xs text-gray-400">
                            {achievement.progress} / {achievement.maxProgress}
                          </p>
                        </div>
                      )}
                      
                      {achievement.unlocked && (
                        <div className="flex items-center gap-2 text-green-400">
                          <CheckCircle className="w-4 h-4" />
                          <span className="text-sm font-semibold">Unlocked!</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tutorial Status */}
        <div className="glass-panel p-8">
          <h2 className="text-2xl font-bold text-cyan-400 mb-6 flex items-center gap-3">
            <Clock className="w-6 h-6" />
            Tutorial Status
          </h2>
          
          <div className="text-center">
            {tutorialCompleted ? (
              <div>
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-12 h-12 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-green-400 mb-4">Tutorial Complete!</h3>
                <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
                  Congratulations! You have successfully mastered all core mechanics of WAGUS: Origins. 
                  You're now ready to explore the full digital realm and engage in multiplayer adventures.
                </p>
                <div className="flex justify-center gap-4">
                  <button 
                    onClick={() => setCurrentPage('menu')}
                    className="cyber-glow bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-semibold"
                  >
                    Return to Menu
                  </button>
                  <button 
                    onClick={() => setCurrentPage('inventory')}
                    className="cyber-glow bg-cyan-600 hover:bg-cyan-500 text-white px-8 py-3 rounded-lg font-semibold"
                  >
                    View Inventory
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full flex items-center justify-center">
                  <Clock className="w-12 h-12 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-cyan-400 mb-4">Tutorial In Progress</h3>
                <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
                  Continue your training to master all core mechanics. Complete all activities to unlock the full WAGUS: Origins experience.
                </p>
                <div className="mb-6">
                  <div className="w-full bg-gray-700 rounded-full h-4 max-w-md mx-auto">
                    <div 
                      className="bg-gradient-to-r from-cyan-500 to-blue-600 h-4 rounded-full transition-all duration-300"
                      style={{ width: `${getTotalProgress()}%` }}
                    ></div>
                  </div>
                  <p className="text-cyan-400 mt-2 font-semibold">{getTotalProgress()}% Complete</p>
                </div>
                <button 
                  onClick={() => setCurrentPage('tutorial')}
                  className="cyber-glow bg-cyan-600 hover:bg-cyan-500 text-white px-8 py-3 rounded-lg font-semibold"
                >
                  Continue Tutorial
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}