import { useState } from 'react';
import { useGameStore, type GameItem } from '@/store/gameStore';
import { 
  Package, 
  Coins, 
  Search, 
  Filter, 
  ArrowLeft, 
  Star,
  Info,
  X
} from 'lucide-react';

// Mock items for demonstration
const mockItems: GameItem[] = [
  {
    id: '1',
    name: 'Cyber Crystal',
    type: 'resource',
    rarity: 'rare',
    description: 'A glowing crystal containing compressed digital energy.',
    metadata: { power: 25, stability: 'high', origin: 'Mining Sector 7' }
  },
  {
    id: '2',
    name: 'Data Scanner',
    type: 'equipment',
    rarity: 'epic',
    description: 'Advanced scanning device for detecting hidden information.',
    metadata: { range: 100, accuracy: '95%', battery: 'unlimited' }
  },
  {
    id: '3',
    name: 'Hack Tool',
    type: 'equipment',
    rarity: 'common',
    description: 'Basic hacking utility for system infiltration.',
    metadata: { effectiveness: 'medium', compatibility: 'universal' }
  },
  {
    id: '4',
    name: 'Mana Potion',
    type: 'consumable',
    rarity: 'common',
    description: 'Restores magical energy when consumed.',
    metadata: { restoration: 50, duration: '5 minutes', side_effects: 'none' }
  },
  {
    id: '5',
    name: 'Legendary Sword',
    type: 'equipment',
    rarity: 'legendary',
    description: 'A weapon forged in the digital fires of the ancient servers.',
    metadata: { damage: 150, durability: 'infinite', special: 'Lightning Strike' }
  }
];

type FilterType = 'all' | 'resource' | 'equipment' | 'consumable';
type SortType = 'name' | 'rarity' | 'type';

export default function InventoryManagement() {
  const { 
    setCurrentPage, 
    selectedFaction, 
    tokenBalance, 
    inventory 
  } = useGameStore();
  
  const [selectedItem, setSelectedItem] = useState<GameItem | null>(null);
  const [filter, setFilter] = useState<FilterType>('all');
  const [sort, setSort] = useState<SortType>('name');
  const [searchTerm, setSearchTerm] = useState('');

  // Use mock items for demonstration (in real app, would use inventory from store)
  const allItems = [...inventory, ...mockItems];

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-400 border-gray-500';
      case 'rare': return 'text-blue-400 border-blue-500';
      case 'epic': return 'text-purple-400 border-purple-500';
      case 'legendary': return 'text-yellow-400 border-yellow-500';
      default: return 'text-gray-400 border-gray-500';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'resource': return '💎';
      case 'equipment': return '⚔️';
      case 'consumable': return '🧪';
      default: return '📦';
    }
  };

  const getFactionColor = () => {
    switch (selectedFaction) {
      case 'SUGAW': return 'text-red-400';
      case 'WAGUS': return 'text-white';
      case 'BONK': return 'text-orange-400';
      default: return 'text-cyan-400';
    }
  };

  const getFactionTokens = () => {
    if (!selectedFaction) return 0;
    return tokenBalance[selectedFaction];
  };

  const filteredItems = allItems
    .filter(item => filter === 'all' || item.type === filter)
    .filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      switch (sort) {
        case 'name': return a.name.localeCompare(b.name);
        case 'rarity': {
          const rarityOrder = { common: 1, rare: 2, epic: 3, legendary: 4 };
          return rarityOrder[b.rarity as keyof typeof rarityOrder] - rarityOrder[a.rarity as keyof typeof rarityOrder];
        }
        case 'type': return a.type.localeCompare(b.type);
        default: return 0;
      }
    });

  if (selectedItem) {
    return (
      <div className="min-h-screen cyber-grid flex items-center justify-center relative overflow-hidden">
        <div className="glass-panel p-8 max-w-2xl mx-auto relative z-10">
          <div className="flex justify-between items-start mb-6">
            <button 
              onClick={() => setSelectedItem(null)}
              className="cyber-glow bg-gray-600 hover:bg-gray-500 text-white p-2 rounded-lg transition-all duration-300"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setSelectedItem(null)}
              className="text-gray-400 hover:text-gray-200 transition-colors duration-200"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="text-center mb-8">
            <div className="text-6xl mb-4">{getTypeIcon(selectedItem.type)}</div>
            <h2 className={`text-3xl font-bold ${getRarityColor(selectedItem.rarity).split(' ')[0]} mb-2`}>
              {selectedItem.name}
            </h2>
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getRarityColor(selectedItem.rarity)}`}>
                {selectedItem.rarity.toUpperCase()}
              </span>
              <span className="px-3 py-1 rounded-full text-sm font-semibold bg-gray-700 text-gray-300">
                {selectedItem.type.toUpperCase()}
              </span>
            </div>
            <p className="text-gray-300 leading-relaxed">{selectedItem.description}</p>
          </div>

          {selectedItem.metadata && (
            <div className="glass-panel p-6 border-cyan-500/30">
              <h3 className="text-xl font-bold text-cyan-400 mb-4 flex items-center gap-2">
                <Info className="w-5 h-5" />
                Item Metadata
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(selectedItem.metadata).map(([key, value]) => (
                  <div key={key} className="flex justify-between items-center p-3 bg-black/20 rounded-lg">
                    <span className="text-gray-400 capitalize">{key.replace('_', ' ')}:</span>
                    <span className="text-cyan-300 font-semibold">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8 text-center">
            <p className="text-gray-400 text-sm">
              Item ID: {selectedItem.id} • Blockchain Verified ✓
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen cyber-grid p-8 relative overflow-hidden">
      {/* Header */}
      <div className="glass-panel p-6 mb-8 max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setCurrentPage('tutorial')}
              className="cyber-glow bg-gray-600 hover:bg-gray-500 text-white p-2 rounded-lg transition-all duration-300"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-cyan-400 flex items-center gap-3">
                <Package className="w-8 h-8" />
                Inventory
              </h1>
              <p className="text-cyan-300 opacity-80">Manage your digital assets and items</p>
            </div>
          </div>
          
          <div className="text-center">
            <p className="text-sm text-gray-400">Faction Tokens</p>
            <div className="flex items-center gap-2">
              <Coins className={`w-6 h-6 ${getFactionColor()}`} />
              <p className={`text-2xl font-bold ${getFactionColor()}`}>{getFactionTokens()}</p>
              <span className={`text-sm ${getFactionColor()}`}>{selectedFaction}</span>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <Search className="w-5 h-5 text-gray-400" />
            <input 
              type="text"
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-black/30 border border-cyan-500/30 rounded-lg px-4 py-2 text-cyan-300 placeholder-gray-500 focus:outline-none focus:border-cyan-500"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select 
              value={filter}
              onChange={(e) => setFilter(e.target.value as FilterType)}
              className="bg-black/30 border border-cyan-500/30 rounded-lg px-4 py-2 text-cyan-300 focus:outline-none focus:border-cyan-500"
            >
              <option value="all">All Types</option>
              <option value="resource">Resources</option>
              <option value="equipment">Equipment</option>
              <option value="consumable">Consumables</option>
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-gray-400 text-sm">Sort by:</span>
            <select 
              value={sort}
              onChange={(e) => setSort(e.target.value as SortType)}
              className="bg-black/30 border border-cyan-500/30 rounded-lg px-4 py-2 text-cyan-300 focus:outline-none focus:border-cyan-500"
            >
              <option value="name">Name</option>
              <option value="rarity">Rarity</option>
              <option value="type">Type</option>
            </select>
          </div>
        </div>
      </div>

      {/* Inventory Grid */}
      <div className="max-w-6xl mx-auto">
        {filteredItems.length === 0 ? (
          <div className="glass-panel p-12 text-center">
            <Package className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-400 mb-2">No Items Found</h3>
            <p className="text-gray-500">
              {searchTerm ? 'Try adjusting your search terms' : 'Complete tutorial activities to earn items'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {filteredItems.map((item) => (
              <div 
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className={`glass-panel p-4 cursor-pointer transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 border-2 ${getRarityColor(item.rarity).split(' ')[1]}`}
              >
                <div className="text-center">
                  <div className="text-4xl mb-3">{getTypeIcon(item.type)}</div>
                  <h3 className={`font-bold text-sm mb-1 ${getRarityColor(item.rarity).split(' ')[0]}`}>
                    {item.name}
                  </h3>
                  <p className="text-xs text-gray-400 mb-2">{item.type}</p>
                  <div className="flex justify-center">
                    {Array.from({ length: item.rarity === 'legendary' ? 5 : item.rarity === 'epic' ? 4 : item.rarity === 'rare' ? 3 : 2 }, (_, i) => (
                      <Star key={i} className={`w-3 h-3 ${getRarityColor(item.rarity).split(' ')[0]}`} fill="currentColor" />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Stats */}
        <div className="glass-panel p-6 mt-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <p className="text-2xl font-bold text-cyan-400">{filteredItems.length}</p>
              <p className="text-gray-400 text-sm">Total Items</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-400">
                {filteredItems.filter(item => item.rarity === 'legendary').length}
              </p>
              <p className="text-gray-400 text-sm">Legendary</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-400">
                {filteredItems.filter(item => item.rarity === 'epic').length}
              </p>
              <p className="text-gray-400 text-sm">Epic</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-400">
                {filteredItems.filter(item => item.rarity === 'rare').length}
              </p>
              <p className="text-gray-400 text-sm">Rare</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}