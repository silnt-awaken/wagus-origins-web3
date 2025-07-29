import { create } from 'zustand';

export type Faction = 'SUGAW' | 'WAGUS' | 'BONK' | null;

export interface GameItem {
  id: string;
  name: string;
  type: 'resource' | 'equipment' | 'consumable';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  description: string;
  metadata?: Record<string, any>;
}

export interface GameProgress {
  mining: number;
  scanning: number;
  hacking: number;
  combat: number;
  magic: number;
}

export interface TokenBalance {
  SUGAW: number;
  WAGUS: number;
  BONK: number;
}

export interface GameState {
  // Game flow
  currentPage: 'menu' | 'intro' | 'tutorial' | 'faction-selection' | 'inventory' | 'progress' | 'game';
  selectedFaction: Faction;
  tutorialCompleted: boolean;
  showOverlay: boolean;
  gameStarted: boolean;
  gameMode: '2d' | 'menu';
  
  // Player data
  playerName: string;
  tokenBalance: TokenBalance;
  inventory: GameItem[];
  progress: GameProgress;
  
  // Actions
  setCurrentPage: (page: GameState['currentPage']) => void;
  setSelectedFaction: (faction: Faction) => void;
  setPlayerName: (name: string) => void;
  addTokens: (faction: Faction, amount: number) => void;
  addItem: (item: GameItem) => void;
  updateProgress: (activity: keyof GameProgress, amount: number) => void;
  completeTutorial: () => void;
  resetGame: () => void;
  setShowOverlay: (show: boolean) => void;
  startGame: () => void;
}

const initialState = {
  currentPage: 'menu' as const,
  selectedFaction: null,
  tutorialCompleted: false,
  showOverlay: true,
  gameStarted: false,
  gameMode: 'menu' as const,
  playerName: '',
  tokenBalance: { SUGAW: 0, WAGUS: 0, BONK: 0 },
  inventory: [],
  progress: { mining: 0, scanning: 0, hacking: 0, combat: 0, magic: 0 },
};

export const useGameStore = create<GameState>((set, get) => ({
  ...initialState,
  
  setCurrentPage: (page) => set({ currentPage: page }),
  
  setSelectedFaction: (faction) => set({ selectedFaction: faction }),
  
  setPlayerName: (name) => set({ playerName: name }),
  
  addTokens: (faction, amount) => {
    if (!faction) return;
    set((state) => ({
      tokenBalance: {
        ...state.tokenBalance,
        [faction]: state.tokenBalance[faction] + amount,
      },
    }));
  },
  
  addItem: (item) => set((state) => ({
    inventory: [...state.inventory, item],
  })),
  
  updateProgress: (activity, amount) => set((state) => ({
    progress: {
      ...state.progress,
      [activity]: Math.min(100, state.progress[activity] + amount),
    },
  })),
  
  completeTutorial: () => set({ tutorialCompleted: true }),
  
  setShowOverlay: (show) => set({ showOverlay: show }),
  
  startGame: () => set({ gameStarted: true, showOverlay: false, currentPage: 'intro' }),
  
  resetGame: () => set(initialState),
}));