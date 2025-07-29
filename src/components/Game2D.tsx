import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useGameStore } from '@/store/gameStore';
import MiniGames from '@/components/MiniGames';

interface Player {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  health: number;
  maxHealth: number;
  direction: 'up' | 'down' | 'left' | 'right';
  isMoving: boolean;
  animationFrame: number;
}

interface Enemy {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  health: number;
  maxHealth: number;
  type: 'corrupted_node' | 'cyber_guard' | 'data_phantom';
  isAlive: boolean;
}

interface InteractableObject {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'mining_node' | 'scan_terminal' | 'hack_console' | 'magic_crystal' | 'npc_sugaw';
  isActive: boolean;
  data?: any;
}

interface GameState {
  player: Player;
  enemies: Enemy[];
  objects: InteractableObject[];
  camera: { x: number; y: number };
  gameMode: 'exploration' | 'combat' | 'mining' | 'scanning' | 'hacking' | 'magic';
  selectedObject: InteractableObject | null;
}

const CANVAS_WIDTH = 1200;
const CANVAS_HEIGHT = 800;
const TILE_SIZE = 32;
const WORLD_WIDTH = 2400;
const WORLD_HEIGHT = 1600;

export const Game2D: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const keysRef = useRef<Set<string>>(new Set());
  const { currentPage, setCurrentPage, gameMode, showOverlay, selectedFaction, addTokens, updateProgress, tokenBalance } = useGameStore();
  
  const [showMiniGame, setShowMiniGame] = useState<'mining' | 'scanning' | 'hacking' | 'magic' | null>(null);
  
  const [game, setGame] = useState<GameState>({
    player: {
      x: WORLD_WIDTH / 2,
      y: WORLD_HEIGHT / 2,
      width: 24,
      height: 24,
      speed: 3,
      health: 100,
      maxHealth: 100,
      direction: 'down',
      isMoving: false,
      animationFrame: 0
    },
    enemies: [
      {
        id: 'enemy1',
        x: 400,
        y: 300,
        width: 28,
        height: 28,
        health: 50,
        maxHealth: 50,
        type: 'corrupted_node',
        isAlive: true
      },
      {
        id: 'enemy2',
        x: 800,
        y: 600,
        width: 32,
        height: 32,
        health: 75,
        maxHealth: 75,
        type: 'cyber_guard',
        isAlive: true
      }
    ],
    objects: [
      {
        id: 'mining1',
        x: 200,
        y: 200,
        width: 40,
        height: 40,
        type: 'mining_node',
        isActive: true
      },
      {
        id: 'scan1',
        x: 600,
        y: 400,
        width: 36,
        height: 36,
        type: 'scan_terminal',
        isActive: true
      },
      {
        id: 'hack1',
        x: 1000,
        y: 300,
        width: 44,
        height: 44,
        type: 'hack_console',
        isActive: true
      },
      {
        id: 'magic1',
        x: 300,
        y: 700,
        width: 32,
        height: 32,
        type: 'magic_crystal',
        isActive: true
      },
      {
        id: 'sugaw',
        x: 500,
        y: 500,
        width: 28,
        height: 28,
        type: 'npc_sugaw',
        isActive: true
      }
    ],
    camera: { x: 0, y: 0 },
    gameMode: 'exploration',
    selectedObject: null
  });

  // Input handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current.add(e.key.toLowerCase());
      
      // Interaction key
      if (e.key.toLowerCase() === 'e') {
        handleInteraction();
      }
      
      // Combat key
      if (e.key.toLowerCase() === ' ') {
        handleCombat();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current.delete(e.key.toLowerCase());
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Game loop
  useEffect(() => {
    const gameLoop = () => {
      updatePlayer();
      updateCamera();
      render();
      animationRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoop();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [game]);

  const updatePlayer = useCallback(() => {
    setGame(prevGame => {
      const newPlayer = { ...prevGame.player };
      let isMoving = false;
      
      // Movement
      if (keysRef.current.has('w') || keysRef.current.has('arrowup')) {
        newPlayer.y = Math.max(0, newPlayer.y - newPlayer.speed);
        newPlayer.direction = 'up';
        isMoving = true;
      }
      if (keysRef.current.has('s') || keysRef.current.has('arrowdown')) {
        newPlayer.y = Math.min(WORLD_HEIGHT - newPlayer.height, newPlayer.y + newPlayer.speed);
        newPlayer.direction = 'down';
        isMoving = true;
      }
      if (keysRef.current.has('a') || keysRef.current.has('arrowleft')) {
        newPlayer.x = Math.max(0, newPlayer.x - newPlayer.speed);
        newPlayer.direction = 'left';
        isMoving = true;
      }
      if (keysRef.current.has('d') || keysRef.current.has('arrowright')) {
        newPlayer.x = Math.min(WORLD_WIDTH - newPlayer.width, newPlayer.x + newPlayer.speed);
        newPlayer.direction = 'right';
        isMoving = true;
      }
      
      newPlayer.isMoving = isMoving;
      if (isMoving) {
        newPlayer.animationFrame = (newPlayer.animationFrame + 1) % 60;
      }
      
      return { ...prevGame, player: newPlayer };
    });
  }, []);

  const updateCamera = useCallback(() => {
    setGame(prevGame => {
      const camera = {
        x: Math.max(0, Math.min(WORLD_WIDTH - CANVAS_WIDTH, prevGame.player.x - CANVAS_WIDTH / 2)),
        y: Math.max(0, Math.min(WORLD_HEIGHT - CANVAS_HEIGHT, prevGame.player.y - CANVAS_HEIGHT / 2))
      };
      return { ...prevGame, camera };
    });
  }, []);

  const handleInteraction = () => {
    const nearbyObject = game.objects.find(obj => {
      const distance = Math.sqrt(
        Math.pow(obj.x - game.player.x, 2) + Math.pow(obj.y - game.player.y, 2)
      );
      return distance < 50 && obj.isActive;
    });

    if (nearbyObject) {
      setGame(prev => ({ ...prev, selectedObject: nearbyObject, gameMode: getGameModeForObject(nearbyObject.type) }));
      handleObjectInteraction(nearbyObject);
    }
  };

  const handleCombat = () => {
    const nearbyEnemy = game.enemies.find(enemy => {
      const distance = Math.sqrt(
        Math.pow(enemy.x - game.player.x, 2) + Math.pow(enemy.y - game.player.y, 2)
      );
      return distance < 60 && enemy.isAlive;
    });

    if (nearbyEnemy) {
      // Deal damage to enemy
      setGame(prev => ({
        ...prev,
        enemies: prev.enemies.map(enemy => 
          enemy.id === nearbyEnemy.id 
            ? { ...enemy, health: Math.max(0, enemy.health - 25), isAlive: enemy.health > 25 }
            : enemy
        )
      }));
      
      // Award tokens for combat
      addTokens(selectedFaction, 10);
    }
  };

  const getGameModeForObject = (type: string): GameState['gameMode'] => {
    switch (type) {
      case 'mining_node': return 'mining';
      case 'scan_terminal': return 'scanning';
      case 'hack_console': return 'hacking';
      case 'magic_crystal': return 'magic';
      default: return 'exploration';
    }
  };

  const handleObjectInteraction = (object: InteractableObject) => {
    switch (object.type) {
      case 'mining_node':
        setShowMiniGame('mining');
        break;
      case 'scan_terminal':
        setShowMiniGame('scanning');
        break;
      case 'hack_console':
        setShowMiniGame('hacking');
        break;
      case 'magic_crystal':
        setShowMiniGame('magic');
        break;
      case 'npc_sugaw':
        // Trigger dialogue
        setCurrentPage('intro');
        break;
    }
  };

  const handleMiniGameComplete = (success: boolean, tokens: number) => {
    if (success) {
      addTokens(selectedFaction, tokens);
      // Mark tutorial progress
      if (showMiniGame) {
        const progressKey = showMiniGame === 'scanning' ? 'scanning' : showMiniGame;
        updateProgress(showMiniGame, 25);
      }
    }
    setShowMiniGame(null);
    setGame(prev => ({ ...prev, selectedObject: null, gameMode: 'exploration' }));
  };

  const handleMiniGameClose = () => {
    setShowMiniGame(null);
    setGame(prev => ({ ...prev, selectedObject: null, gameMode: 'exploration' }));
  };

  const render = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#0A1628';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw grid background
    ctx.strokeStyle = '#1A2B4C';
    ctx.lineWidth = 1;
    for (let x = 0; x < CANVAS_WIDTH; x += TILE_SIZE) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, CANVAS_HEIGHT);
      ctx.stroke();
    }
    for (let y = 0; y < CANVAS_HEIGHT; y += TILE_SIZE) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(CANVAS_WIDTH, y);
      ctx.stroke();
    }

    // Draw objects
    game.objects.forEach(obj => {
      if (!obj.isActive) return;
      
      const screenX = obj.x - game.camera.x;
      const screenY = obj.y - game.camera.y;
      
      if (screenX > -obj.width && screenX < CANVAS_WIDTH && screenY > -obj.height && screenY < CANVAS_HEIGHT) {
        drawObject(ctx, obj, screenX, screenY);
      }
    });

    // Draw enemies
    game.enemies.forEach(enemy => {
      if (!enemy.isAlive) return;
      
      const screenX = enemy.x - game.camera.x;
      const screenY = enemy.y - game.camera.y;
      
      if (screenX > -enemy.width && screenX < CANVAS_WIDTH && screenY > -enemy.height && screenY < CANVAS_HEIGHT) {
        drawEnemy(ctx, enemy, screenX, screenY);
      }
    });

    // Draw player
    const playerScreenX = game.player.x - game.camera.x;
    const playerScreenY = game.player.y - game.camera.y;
    drawPlayer(ctx, game.player, playerScreenX, playerScreenY);

    // Draw UI
    drawUI(ctx);
  };

  const drawPlayer = (ctx: CanvasRenderingContext2D, player: Player, x: number, y: number) => {
    // Player body
    ctx.fillStyle = '#00D4FF';
    ctx.fillRect(x, y, player.width, player.height);
    
    // Player direction indicator
    ctx.fillStyle = '#FFFFFF';
    const centerX = x + player.width / 2;
    const centerY = y + player.height / 2;
    
    switch (player.direction) {
      case 'up':
        ctx.fillRect(centerX - 2, y, 4, 6);
        break;
      case 'down':
        ctx.fillRect(centerX - 2, y + player.height - 6, 4, 6);
        break;
      case 'left':
        ctx.fillRect(x, centerY - 2, 6, 4);
        break;
      case 'right':
        ctx.fillRect(x + player.width - 6, centerY - 2, 6, 4);
        break;
    }
    
    // Health bar
    const healthBarWidth = player.width;
    const healthBarHeight = 4;
    const healthPercentage = player.health / player.maxHealth;
    
    ctx.fillStyle = '#FF0000';
    ctx.fillRect(x, y - 8, healthBarWidth, healthBarHeight);
    ctx.fillStyle = '#00FF00';
    ctx.fillRect(x, y - 8, healthBarWidth * healthPercentage, healthBarHeight);
  };

  const drawEnemy = (ctx: CanvasRenderingContext2D, enemy: Enemy, x: number, y: number) => {
    let color = '#FF4444';
    switch (enemy.type) {
      case 'corrupted_node': color = '#FF4444'; break;
      case 'cyber_guard': color = '#FF8800'; break;
      case 'data_phantom': color = '#AA44FF'; break;
    }
    
    ctx.fillStyle = color;
    ctx.fillRect(x, y, enemy.width, enemy.height);
    
    // Enemy health bar
    const healthBarWidth = enemy.width;
    const healthBarHeight = 3;
    const healthPercentage = enemy.health / enemy.maxHealth;
    
    ctx.fillStyle = '#660000';
    ctx.fillRect(x, y - 6, healthBarWidth, healthBarHeight);
    ctx.fillStyle = '#FF0000';
    ctx.fillRect(x, y - 6, healthBarWidth * healthPercentage, healthBarHeight);
  };

  const drawObject = (ctx: CanvasRenderingContext2D, obj: InteractableObject, x: number, y: number) => {
    let color = '#888888';
    switch (obj.type) {
      case 'mining_node': color = '#FFD700'; break;
      case 'scan_terminal': color = '#00FFFF'; break;
      case 'hack_console': color = '#FF00FF'; break;
      case 'magic_crystal': color = '#9966FF'; break;
      case 'npc_sugaw': color = '#FF6666'; break;
    }
    
    ctx.fillStyle = color;
    ctx.fillRect(x, y, obj.width, obj.height);
    
    // Interaction indicator
    const distance = Math.sqrt(
      Math.pow(obj.x - game.player.x, 2) + Math.pow(obj.y - game.player.y, 2)
    );
    
    if (distance < 50) {
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.strokeRect(x - 2, y - 2, obj.width + 4, obj.height + 4);
      
      // "E" to interact
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '12px Arial';
      ctx.fillText('E', x + obj.width / 2 - 4, y - 8);
    }
  };

  const drawUI = (ctx: CanvasRenderingContext2D) => {
    // Health bar
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(10, 10, 200, 30);
    
    ctx.fillStyle = '#FF0000';
    ctx.fillRect(15, 15, 190, 20);
    
    const healthPercentage = game.player.health / game.player.maxHealth;
    ctx.fillStyle = '#00FF00';
    ctx.fillRect(15, 15, 190 * healthPercentage, 20);
    
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '14px Arial';
    ctx.fillText(`Health: ${game.player.health}/${game.player.maxHealth}`, 20, 28);
    
    // Tokens
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(10, 50, 150, 25);
    
    ctx.fillStyle = '#FFD700';
    ctx.font = '14px Arial';
    ctx.fillText(`Tokens: ${tokenBalance.SUGAW + tokenBalance.WAGUS + tokenBalance.BONK}`, 15, 68);
    
    // Controls
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(CANVAS_WIDTH - 200, 10, 190, 80);
    
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '12px Arial';
    ctx.fillText('WASD: Move', CANVAS_WIDTH - 190, 25);
    ctx.fillText('E: Interact', CANVAS_WIDTH - 190, 40);
    ctx.fillText('Space: Attack', CANVAS_WIDTH - 190, 55);
    ctx.fillText('ESC: Menu', CANVAS_WIDTH - 190, 70);
    
    // Current mode
    if (game.gameMode !== 'exploration') {
      ctx.fillStyle = 'rgba(0, 212, 255, 0.9)';
      ctx.fillRect(CANVAS_WIDTH / 2 - 100, 10, 200, 30);
      
      ctx.fillStyle = '#000000';
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`Mode: ${game.gameMode.toUpperCase()}`, CANVAS_WIDTH / 2, 30);
      ctx.textAlign = 'left';
    }
  };

  return (
    <div className="relative w-full h-full bg-gray-900">
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="border border-cyan-500 shadow-lg shadow-cyan-500/50"
        style={{ imageRendering: 'pixelated' }}
      />
      
      {game.selectedObject && !showMiniGame && (
        <div className="absolute top-4 left-4 bg-black/80 text-white p-4 rounded border border-cyan-500">
          <h3 className="text-cyan-400 font-bold mb-2">
            {game.selectedObject.type.replace('_', ' ').toUpperCase()}
          </h3>
          <p className="text-sm">
            {getObjectDescription(game.selectedObject.type)}
          </p>
          <button 
            onClick={() => setGame(prev => ({ ...prev, selectedObject: null, gameMode: 'exploration' }))}
            className="mt-2 px-3 py-1 bg-cyan-600 hover:bg-cyan-700 rounded text-sm"
          >
            Close
          </button>
        </div>
      )}
      
      {showMiniGame && (
        <MiniGames
          type={showMiniGame}
          onComplete={handleMiniGameComplete}
          onClose={handleMiniGameClose}
        />
      )}
    </div>
  );
};

const getObjectDescription = (type: string): string => {
  switch (type) {
    case 'mining_node': return 'Extract valuable data crystals from this mining node. Earn tokens by successfully mining resources.';
    case 'scan_terminal': return 'Scan the environment for hidden secrets and valuable information. Discover what others have missed.';
    case 'hack_console': return 'Breach security systems and unlock restricted data. High risk, high reward hacking challenges.';
    case 'magic_crystal': return 'Channel mystical cyber energy through this crystal. Learn powerful digital magic spells.';
    case 'npc_sugaw': return 'SUGAW, the mysterious figure who reveals the truth about crypto corruption. Speak with them to learn more.';
    default: return 'An interactive object in the cyber world.';
  }
};

export default Game2D;