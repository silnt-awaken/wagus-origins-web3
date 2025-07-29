import React, { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import { useGameStore } from '@/store/gameStore';

// Tutorial Zone Game Scene - Phase 1-5 Implementation
class TutorialGameScene extends Phaser.Scene {
  // Core game objects
  private player!: Phaser.Physics.Arcade.Sprite;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: any;
  private interactKey!: Phaser.Input.Keyboard.Key;
  private scanKey!: Phaser.Input.Keyboard.Key;
  
  // Interactive objects
  private miningNodes!: Phaser.Physics.Arcade.Group;
  private scanTerminals!: Phaser.Physics.Arcade.Group;
  private hackConsoles!: Phaser.Physics.Arcade.Group;
  private collisionLayer!: Phaser.Physics.Arcade.StaticGroup;
  
  // Combat system
  private enemies!: Phaser.Physics.Arcade.Group;
  private projectiles!: Phaser.Physics.Arcade.Group;
  private weapons!: Phaser.Physics.Arcade.Group;
  private powerUps!: Phaser.Physics.Arcade.Group;
  
  // Weapon system
  private currentWeapon: string = 'plasma_rifle';
  private weaponCooldown = 0;
  private weaponDamage = 15; // Reduced from 25
  private ammo = 100;
  private maxWeaponCooldown = 500; // 500ms between shots
  
  // Tutorial system
  private tutorialStep = 0;
  private tutorialPrompts!: Phaser.GameObjects.Text;
  private isInTutorial = true;
  private currentInteractable: any = null;
  private tutorialPhase = 'movement'; // movement, mining, scanning, combat_intro, combat_weapons, hacking, complete
  private tutorialEnemiesSpawned = 0;
  private maxTutorialEnemies = 1;
  private tutorialCompleted = false;
  
  // UI Elements
  private healthBar!: Phaser.GameObjects.Graphics;
  private energyBar!: Phaser.GameObjects.Graphics;
  private tokenCounter!: Phaser.GameObjects.Text;
  private inventoryPanel!: Phaser.GameObjects.Container;
  private progressBar!: Phaser.GameObjects.Graphics;
  private tooltipText!: Phaser.GameObjects.Text;
  private weaponText!: Phaser.GameObjects.Text;
  private ammoText!: Phaser.GameObjects.Text;
  private levelText!: Phaser.GameObjects.Text;
  private killsText!: Phaser.GameObjects.Text;
  
  // Game state
  private playerHealth = 100;
  private playerEnergy = 100;
  private playerTokens = 0;
  private playerLevel = 1;
  private playerExp = 0;
  private inventory: { [key: string]: number } = {
    'cyber_ore': 0,
    'data_fragments': 0,
    'hack_tools': 0,
    'plasma_rifle': 1,
    'cyber_sword': 1,
    'health_packs': 3
  };
  
  // Combat state
  private isInCombat = false;
  private enemySpawnTimer = 0;
  private waveNumber = 1;
  private enemiesKilled = 0;
  
  // Mining system
  private isMining = false;
  private miningProgress = 0;
  private miningProgressBar!: Phaser.GameObjects.Graphics;
  
  // Scanning system
  private scanCooldown = 0;
  private scanRadius = 150;
  private scanEffect!: Phaser.GameObjects.Graphics;
  
  // Hacking system
  private hackingActive = false;
  private hackingUI!: Phaser.GameObjects.Container;
  
  // World properties
  private tileSize = 32;
  private worldWidth = 800;
  private worldHeight = 600;
  
  // Tutorial steps with phases
  private tutorialSteps = {
    movement: 'Welcome to WAGUS Tutorial! Use WASD to move around.',
    mining: 'Great! Now find a mining node (glowing blue) and press E to mine cyber ore.',
    scanning: 'Excellent! Press R to scan the area and reveal hidden objects.',
    combat_intro: 'ALERT! Enemy detected! Press SPACE to shoot with your plasma rifle!',
    combat_weapons: 'Well done! Press 2 to switch to cyber sword, then press SPACE to attack!',
    hacking: 'Perfect! Now locate a hack console (red terminal) and press E to hack.',
    complete: 'Tutorial complete! You\'re ready for the full WAGUS experience!'
  };

  constructor() {
    super({ key: 'TutorialGameScene' });
  }

  preload() {
    console.log('TutorialGameScene preload() - creating tutorial assets...');
    
    // Create tutorial-specific sprites
    this.createPlayerSprite();
    this.createMiningNodeSprite();
    this.createScanTerminalSprite();
    this.createHackConsoleSprite();
    this.createWallSprite();
    this.createFloorSprite();
    this.createParticleSprite();
    
    console.log('Tutorial assets created successfully!');
  }
  
  createPlayerSprite() {
    const canvas = this.textures.createCanvas('player', 24, 24);
    const ctx = canvas.getContext();
    
    // Clear background
    ctx.clearRect(0, 0, 24, 24);
    
    // Cyber suit body
    ctx.fillStyle = '#2a4d6e';
    ctx.fillRect(6, 8, 12, 12);
    
    // Helmet/head
    ctx.fillStyle = '#1e3a52';
    ctx.fillRect(8, 3, 8, 8);
    
    // Glowing visor
    ctx.fillStyle = '#00d4ff';
    ctx.fillRect(9, 5, 6, 3);
    
    // Arms
    ctx.fillStyle = '#2a4d6e';
    ctx.fillRect(3, 10, 3, 6);
    ctx.fillRect(18, 10, 3, 6);
    
    // Tech details
    ctx.fillStyle = '#00d4ff';
    ctx.fillRect(4, 11, 1, 1);
    ctx.fillRect(19, 11, 1, 1);
    
    // Legs
    ctx.fillStyle = '#2a4d6e';
    ctx.fillRect(8, 20, 3, 4);
    ctx.fillRect(13, 20, 3, 4);
    
    canvas.refresh();
  }

  createMiningNodeSprite() {
    const canvas = this.textures.createCanvas('mining_node', 24, 24);
    const ctx = canvas.getContext();
    
    // Node base
    ctx.fillStyle = '#1a2b3d';
    ctx.fillRect(2, 2, 20, 20);
    
    // Glowing core
    ctx.fillStyle = '#0099ff';
    ctx.fillRect(6, 6, 12, 12);
    
    // Bright center
    ctx.fillStyle = '#66ccff';
    ctx.fillRect(9, 9, 6, 6);
    
    // Connection points
    ctx.fillStyle = '#0099ff';
    ctx.fillRect(0, 11, 2, 2);
    ctx.fillRect(22, 11, 2, 2);
    ctx.fillRect(11, 0, 2, 2);
    ctx.fillRect(11, 22, 2, 2);
    
    canvas.refresh();
  }

  createScanTerminalSprite() {
    const canvas = this.textures.createCanvas('scan_terminal', 24, 32);
    const ctx = canvas.getContext();
    
    // Terminal base
    ctx.fillStyle = '#2d3748';
    ctx.fillRect(2, 8, 20, 24);
    
    // Screen
    ctx.fillStyle = '#1a202c';
    ctx.fillRect(4, 10, 16, 12);
    
    // Screen glow
    ctx.fillStyle = '#00ff88';
    ctx.fillRect(5, 11, 14, 10);
    
    // Scan lines
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(6, 12, 12, 1);
    ctx.fillRect(6, 15, 8, 1);
    ctx.fillRect(6, 18, 10, 1);
    
    // Base
    ctx.fillStyle = '#4a5568';
    ctx.fillRect(4, 24, 16, 6);
    
    canvas.refresh();
  }

  createHackConsoleSprite() {
    const canvas = this.textures.createCanvas('hack_console', 28, 32);
    const ctx = canvas.getContext();
    
    // Console base
    ctx.fillStyle = '#2d1b1b';
    ctx.fillRect(2, 8, 24, 24);
    
    // Screen
    ctx.fillStyle = '#000000';
    ctx.fillRect(4, 10, 20, 14);
    
    // Red warning screen
    ctx.fillStyle = '#ff3333';
    ctx.fillRect(5, 11, 18, 12);
    
    // Warning text
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(7, 13, 6, 1);
    ctx.fillRect(7, 16, 8, 1);
    ctx.fillRect(7, 19, 4, 1);
    
    // Keyboard
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(4, 26, 20, 6);
    
    canvas.refresh();
  }

  createWallSprite() {
    const canvas = this.textures.createCanvas('wall', 32, 32);
    const ctx = canvas.getContext();
    
    // Wall base
    ctx.fillStyle = '#2d3748';
    ctx.fillRect(0, 0, 32, 32);
    
    // Tech panels
    ctx.fillStyle = '#4a5568';
    ctx.fillRect(2, 2, 28, 6);
    ctx.fillRect(2, 12, 28, 6);
    ctx.fillRect(2, 22, 28, 6);
    
    // Glowing strips
    ctx.fillStyle = '#00d4ff';
    ctx.fillRect(0, 8, 32, 1);
    ctx.fillRect(0, 18, 32, 1);
    
    canvas.refresh();
  }

  createFloorSprite() {
    const canvas = this.textures.createCanvas('floor', 32, 32);
    const ctx = canvas.getContext();
    
    // Floor base
    ctx.fillStyle = '#1a202c';
    ctx.fillRect(0, 0, 32, 32);
    
    // Grid lines
    ctx.fillStyle = '#2d3748';
    ctx.fillRect(0, 16, 32, 1);
    ctx.fillRect(16, 0, 1, 32);
    
    // Corner details
    ctx.fillStyle = '#4a5568';
    ctx.fillRect(0, 0, 4, 4);
    ctx.fillRect(28, 0, 4, 4);
    ctx.fillRect(0, 28, 4, 4);
    ctx.fillRect(28, 28, 4, 4);
    
    canvas.refresh();
  }

  createParticleSprite() {
    const canvas = this.textures.createCanvas('particle', 4, 4);
    const ctx = canvas.getContext();
    
    // Glowing particle
    ctx.fillStyle = '#00d4ff';
    ctx.fillRect(1, 1, 2, 2);
    
    canvas.refresh();
  }

  createBuildingSprites() {
    // Cyber building
    const canvas = this.textures.createCanvas('building', 64, 80);
    const ctx = canvas.getContext();
    
    // Building base
    ctx.fillStyle = '#0f0f23';
    ctx.fillRect(0, 20, 64, 60);
    
    // Neon strips
    ctx.fillStyle = '#00ffff';
    ctx.fillRect(0, 25, 64, 2);
    ctx.fillRect(0, 35, 64, 2);
    ctx.fillRect(0, 45, 64, 2);
    
    // Windows with glow
    ctx.fillStyle = '#ff00ff';
    ctx.fillRect(8, 30, 6, 8);
    ctx.fillRect(20, 30, 6, 8);
    ctx.fillRect(36, 30, 6, 8);
    ctx.fillRect(48, 30, 6, 8);
    
    canvas.refresh();
  }

  createDataNodeSprite() {
    const canvas = this.textures.createCanvas('datanode', 20, 20);
    const ctx = canvas.getContext();
    
    // Node base
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(2, 2, 16, 16);
    
    // Glowing core
    ctx.fillStyle = '#00ff00';
    ctx.fillRect(6, 6, 8, 8);
    
    // Pulsing center
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(8, 8, 4, 4);
    
    // Connection points
    ctx.fillStyle = '#00ff00';
    ctx.fillRect(0, 9, 2, 2);
    ctx.fillRect(18, 9, 2, 2);
    ctx.fillRect(9, 0, 2, 2);
    ctx.fillRect(9, 18, 2, 2);
    
    canvas.refresh();
  }

  createHackingTerminalSprite() {
    const canvas = this.textures.createCanvas('terminal', 24, 32);
    const ctx = canvas.getContext();
    
    // Terminal base
    ctx.fillStyle = '#2a2a3e';
    ctx.fillRect(2, 8, 20, 24);
    
    // Screen
    ctx.fillStyle = '#000000';
    ctx.fillRect(4, 10, 16, 12);
    
    // Screen glow
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(5, 11, 14, 10);
    
    // Text lines
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(6, 12, 8, 1);
    ctx.fillRect(6, 14, 6, 1);
    ctx.fillRect(6, 16, 10, 1);
    ctx.fillRect(6, 18, 4, 1);
    
    // Keyboard
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(4, 24, 16, 6);
    
    canvas.refresh();
  }

  createMiningRigSprite() {
    const canvas = this.textures.createCanvas('miningrig', 28, 28);
    const ctx = canvas.getContext();
    
    // Rig base
    ctx.fillStyle = '#3a3a5e';
    ctx.fillRect(2, 10, 24, 18);
    
    // Mining drill
    ctx.fillStyle = '#666699';
    ctx.fillRect(10, 2, 8, 12);
    
    // Drill tip
    ctx.fillStyle = '#999999';
    ctx.fillRect(12, 0, 4, 4);
    
    // Power indicators
    ctx.fillStyle = '#ffff00';
    ctx.fillRect(4, 12, 2, 2);
    ctx.fillRect(22, 12, 2, 2);
    
    // Energy lines
    ctx.fillStyle = '#00ffff';
    ctx.fillRect(8, 16, 12, 1);
    ctx.fillRect(8, 20, 12, 1);
    
    canvas.refresh();
  }

  createScanningDeviceSprite() {
    const canvas = this.textures.createCanvas('scanner', 18, 18);
    const ctx = canvas.getContext();
    
    // Device base
    ctx.fillStyle = '#4a4a6e';
    ctx.fillRect(3, 3, 12, 12);
    
    // Scanner dish
    ctx.fillStyle = '#6a6a8e';
    ctx.fillRect(1, 1, 16, 16);
    
    // Center scanner
    ctx.fillStyle = '#0000ff';
    ctx.fillRect(7, 7, 4, 4);
    
    // Scanning beam
    ctx.fillStyle = '#00aaff';
    ctx.fillRect(8, 8, 2, 2);
    
    canvas.refresh();
  }

  createCyberFloorSprite() {
    const canvas = this.textures.createCanvas('cyberfloor', 32, 32);
    const ctx = canvas.getContext();
    
    // Base floor - darker for better contrast
    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(0, 0, 32, 32);
    
    // Grid lines - brighter for visibility
    ctx.fillStyle = '#2a2a5a';
    ctx.fillRect(0, 8, 32, 1);
    ctx.fillRect(0, 16, 32, 1);
    ctx.fillRect(0, 24, 32, 1);
    ctx.fillRect(8, 0, 1, 32);
    ctx.fillRect(16, 0, 1, 32);
    ctx.fillRect(24, 0, 1, 32);
    
    // Subtle glow points - brighter
    ctx.fillStyle = '#00ffff';
    ctx.fillRect(4, 4, 2, 2);
    ctx.fillRect(20, 12, 2, 2);
    ctx.fillRect(12, 28, 2, 2);
    
    canvas.refresh();
  }

  createSUGAWSprite() {
    const canvas = this.textures.createCanvas('sugaw', 24, 24);
    const ctx = canvas.getContext();
    
    // SUGAW faction colors (red/black)
    // Body
    ctx.fillStyle = '#1a0000';
    ctx.fillRect(6, 8, 12, 12);
    
    // Head/helmet
    ctx.fillStyle = '#330000';
    ctx.fillRect(8, 3, 8, 8);
    
    // Glowing red visor
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(9, 5, 6, 3);
    
    // Arms
    ctx.fillStyle = '#1a0000';
    ctx.fillRect(3, 10, 3, 6);
    ctx.fillRect(18, 10, 3, 6);
    
    // Red faction markings
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(4, 11, 1, 1);
    ctx.fillRect(19, 11, 1, 1);
    ctx.fillRect(10, 9, 4, 1);
    
    // Legs
    ctx.fillStyle = '#1a0000';
    ctx.fillRect(8, 20, 3, 4);
    ctx.fillRect(13, 20, 3, 4);
    
    canvas.refresh();
  }

  createNeonParticleSprite() {
    const canvas = this.textures.createCanvas('neonparticle', 4, 4);
    const ctx = canvas.getContext();
    
    // Glowing particle
    ctx.fillStyle = '#00ffff';
    ctx.fillRect(1, 1, 2, 2);
    
    canvas.refresh();
  }

  create() {
    console.log('TutorialGameScene create() - initializing tutorial zone...');
    
    // Set world bounds
    this.physics.world.setBounds(0, 0, this.worldWidth, this.worldHeight);
    
    // Create tile-based world
    this.createTileWorld();
    
    // Create player
    this.createPlayer();
    
    // Create interactive objects
    this.createInteractiveObjects();
    
    // Create combat system
    this.createEnemies();
    this.createWeapons();
    this.createProjectiles();
    this.createPowerUps();
    
    // Setup input
    this.setupInput();
    
    // Create UI
    this.createUI();
    
    // Setup physics
    this.setupPhysics();
    
    // Setup combat collisions
    this.setupCombatCollisions();
    
    // Don't start continuous enemy spawning in tutorial mode
    // Enemies will be spawned manually during tutorial phases
    
    // Start tutorial
    this.startTutorial();
    
    console.log('Tutorial started with phase:', this.tutorialPhase);
    
    console.log('Tutorial zone initialized successfully!');
  }

  update() {
    // Handle player movement
    const speed = 160;
    
    // Reset velocity
    this.player.setVelocity(0);
    
    // WASD movement
    if (this.wasd.A.isDown) {
      this.player.setVelocityX(-speed);
    } else if (this.wasd.D.isDown) {
      this.player.setVelocityX(speed);
    }
    
    if (this.wasd.W.isDown) {
      this.player.setVelocityY(-speed);
    } else if (this.wasd.S.isDown) {
      this.player.setVelocityY(speed);
    }
    
    // Arrow key movement (alternative)
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-speed);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(speed);
    }
    
    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-speed);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(speed);
    }
    
    // Shooting - only allow single shots, not continuous
    if (Phaser.Input.Keyboard.JustDown(this.cursors.space) && this.weaponCooldown <= 0 && this.ammo > 0) {
      this.shoot();
    }
    
    // Weapon cooldown - proper time-based cooldown
    if (this.weaponCooldown > 0) {
      this.weaponCooldown -= this.game.loop.delta; // Use actual delta time
    }
    
    // Check for movement tutorial completion
    if (this.tutorialPhase === 'movement' && (this.wasd.W.isDown || this.wasd.A.isDown || this.wasd.S.isDown || this.wasd.D.isDown || this.cursors.left.isDown || this.cursors.right.isDown || this.cursors.up.isDown || this.cursors.down.isDown)) {
      this.advanceTutorialPhase();
    }
    
    // Handle interaction key
    if (Phaser.Input.Keyboard.JustDown(this.interactKey) && this.currentInteractable) {
      this.handleInteraction();
    }
    
    // Handle scan key
    if (Phaser.Input.Keyboard.JustDown(this.scanKey) && this.scanCooldown <= 0) {
      this.performScan();
    }
    
    // Update scan cooldown
    if (this.scanCooldown > 0) {
      this.scanCooldown -= 1;
    }
    
    // Update combat and enemy AI
    this.updateCombat();
    
    // Regenerate energy slowly
    if (this.playerEnergy < 100) {
      this.playerEnergy = Math.min(100, this.playerEnergy + 0.1);
    }
    
    // Regenerate energy slowly
    if (this.playerEnergy < 100) {
      this.playerEnergy = Math.min(100, this.playerEnergy + 0.1);
    }
    
    // Hide tooltip if no longer near interactable
    if (!this.currentInteractable) {
      this.hideTooltip();
    }
  }
  
  handleInteraction() {
    if (!this.currentInteractable) return;
    
    const type = this.currentInteractable.getData('type');
    
    switch (type) {
      case 'mining':
        this.startMining(this.currentInteractable);
        break;
      case 'scan':
        this.accessScanTerminal();
        break;
      case 'hack':
        this.startHacking(this.currentInteractable);
        break;
    }
  }
  
  accessScanTerminal() {
    if (this.playerEnergy < 15) return;
    
    this.playerEnergy -= 15;
    this.performScan();
    
    // Advance tutorial if this was the first scan
    if (this.tutorialPhase === 'scanning') {
      this.advanceTutorialPhase();
    }
    
    this.updateUI();
  }
  
  performScan() {
    this.scanCooldown = 180; // 3 seconds at 60fps
    
    // Create scan effect
    this.scanEffect.clear();
    this.scanEffect.lineStyle(3, 0x00ff88, 0.8);
    this.scanEffect.strokeCircle(this.player.x, this.player.y, this.scanRadius);
    
    // Animate scan effect
    this.tweens.add({
      targets: this.scanEffect,
      alpha: 0,
      duration: 1000,
      ease: 'Power2'
    });
    
    // Reveal nearby objects with particles
    this.createScanParticles();
  }
  
  createScanParticles() {
    // Create particle effects around discovered objects
    const particleCount = 20;
    
    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2;
      const distance = 50 + Math.random() * 100;
      const x = this.player.x + Math.cos(angle) * distance;
      const y = this.player.y + Math.sin(angle) * distance;
      
      const particle = this.add.image(x, y, 'particle');
      particle.setScale(0.5 + Math.random() * 0.5);
      particle.setTint(0x00ff88);
      
      this.tweens.add({
        targets: particle,
        y: y - 30,
        alpha: 0,
        duration: 1500,
        ease: 'Power2',
        onComplete: () => particle.destroy()
      });
    }
  }

  createTileWorld() {
    // Create floor tiles
    for (let x = 0; x < this.worldWidth; x += this.tileSize) {
      for (let y = 0; y < this.worldHeight; y += this.tileSize) {
        this.add.image(x + 16, y + 16, 'floor');
      }
    }
    
    // Create collision boundaries (walls)
    this.collisionLayer = this.physics.add.staticGroup();
    
    // Top wall
    for (let x = 0; x < this.worldWidth; x += this.tileSize) {
      const wall = this.collisionLayer.create(x + 16, 16, 'wall');
      wall.setScale(1).refreshBody();
    }
    
    // Bottom wall
    for (let x = 0; x < this.worldWidth; x += this.tileSize) {
      const wall = this.collisionLayer.create(x + 16, this.worldHeight - 16, 'wall');
      wall.setScale(1).refreshBody();
    }
    
    // Left wall
    for (let y = this.tileSize; y < this.worldHeight - this.tileSize; y += this.tileSize) {
      const wall = this.collisionLayer.create(16, y + 16, 'wall');
      wall.setScale(1).refreshBody();
    }
    
    // Right wall
    for (let y = this.tileSize; y < this.worldHeight - this.tileSize; y += this.tileSize) {
      const wall = this.collisionLayer.create(this.worldWidth - 16, y + 16, 'wall');
      wall.setScale(1).refreshBody();
    }
    
    // Add some interior walls for structure
    const interiorWalls = [
      { x: 200, y: 200 }, { x: 232, y: 200 }, { x: 264, y: 200 },
      { x: 500, y: 300 }, { x: 532, y: 300 },
      { x: 350, y: 450 }, { x: 382, y: 450 }
    ];
    
    interiorWalls.forEach(pos => {
      const wall = this.collisionLayer.create(pos.x, pos.y, 'wall');
      wall.setScale(1).refreshBody();
    });
  }

  createPlayer() {
    // Create player sprite
    this.player = this.physics.add.sprite(100, 100, 'player');
    this.player.setScale(2);
    this.player.setCollideWorldBounds(true);
    this.player.setDepth(10);
    
    // Setup camera to follow player
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
    this.cameras.main.setZoom(1.5);
    this.cameras.main.setBounds(0, 0, this.worldWidth, this.worldHeight);
  }

  createInteractiveObjects() {
    // Create groups for interactive objects
    this.miningNodes = this.physics.add.group();
    this.scanTerminals = this.physics.add.group();
    this.hackConsoles = this.physics.add.group();
    
    // Mining nodes (blue glowing)
    const miningPositions = [
      { x: 150, y: 300 },
      { x: 400, y: 150 },
      { x: 600, y: 400 }
    ];
    
    miningPositions.forEach(pos => {
      const node = this.miningNodes.create(pos.x, pos.y, 'mining_node');
      node.setScale(1.5);
      node.setData('type', 'mining');
      node.setData('resource', 'cyber_ore');
      node.setData('amount', 5);
    });
    
    // Scan terminals (green)
    const scanPositions = [
      { x: 300, y: 250 },
      { x: 550, y: 200 }
    ];
    
    scanPositions.forEach(pos => {
      const terminal = this.scanTerminals.create(pos.x, pos.y, 'scan_terminal');
      terminal.setScale(1.2);
      terminal.setData('type', 'scan');
    });
    
    // Hack consoles (red)
    const hackPositions = [
      { x: 450, y: 350 },
      { x: 250, y: 500 }
    ];
    
    hackPositions.forEach(pos => {
      const console = this.hackConsoles.create(pos.x, pos.y, 'hack_console');
      console.setScale(1.2);
      console.setData('type', 'hack');
      console.setData('difficulty', 1);
    });
  }

  setupInput() {
    // Movement keys
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = this.input.keyboard!.addKeys('W,S,A,D');
    
    // Interaction keys
    this.interactKey = this.input.keyboard!.addKey('E');
    this.scanKey = this.input.keyboard!.addKey('R');
    
    // Weapon switching keys
    this.input.keyboard!.addKey('ONE').on('down', () => this.switchWeapon('plasma_rifle'));
    this.input.keyboard!.addKey('TWO').on('down', () => this.switchWeapon('cyber_sword'));
  }
  
  createUI() {
    // Get game dimensions for responsive positioning
    const gameWidth = this.sys.game.config.width as number;
    const gameHeight = this.sys.game.config.height as number;
    
    // Health bar (top-left)
    this.healthBar = this.add.graphics();
    this.healthBar.setScrollFactor(0);
    this.healthBar.setDepth(100);
    
    // Energy bar (top-left, below health)
    this.energyBar = this.add.graphics();
    this.energyBar.setScrollFactor(0);
    this.energyBar.setDepth(100);
    
    // Token counter (top-left)
    this.tokenCounter = this.add.text(10, 10, 'WAGUS Tokens: 0', {
      fontSize: '16px',
      color: '#00d4ff',
      backgroundColor: '#0a1628',
      padding: { x: 8, y: 4 }
    });
    this.tokenCounter.setScrollFactor(0);
    this.tokenCounter.setDepth(100);
    
    // Combat UI (top-right)
    this.weaponText = this.add.text(gameWidth - 10, 10, `Weapon: ${this.currentWeapon.toUpperCase()}`, {
      fontSize: '14px',
      color: '#ff6600',
      backgroundColor: '#0a1628',
      padding: { x: 6, y: 3 }
    });
    this.weaponText.setOrigin(1, 0); // Right-aligned
    this.weaponText.setScrollFactor(0);
    this.weaponText.setDepth(100);
    
    this.ammoText = this.add.text(gameWidth - 10, 35, `Ammo: ${this.ammo}`, {
      fontSize: '14px',
      color: '#ffffff',
      backgroundColor: '#0a1628',
      padding: { x: 6, y: 3 }
    });
    this.ammoText.setOrigin(1, 0); // Right-aligned
    this.ammoText.setScrollFactor(0);
    this.ammoText.setDepth(100);
    
    this.levelText = this.add.text(gameWidth - 10, 60, `Level: ${this.playerLevel}`, {
      fontSize: '14px',
      color: '#ffff00',
      backgroundColor: '#0a1628',
      padding: { x: 6, y: 3 }
    });
    this.levelText.setOrigin(1, 0); // Right-aligned
    this.levelText.setScrollFactor(0);
    this.levelText.setDepth(100);
    
    this.killsText = this.add.text(gameWidth - 10, 85, `Kills: ${this.enemiesKilled}`, {
      fontSize: '14px',
      color: '#ff0000',
      backgroundColor: '#0a1628',
      padding: { x: 6, y: 3 }
    });
    this.killsText.setOrigin(1, 0); // Right-aligned
    this.killsText.setScrollFactor(0);
    this.killsText.setDepth(100);
    
    // Tutorial prompts (center-top, prominent and always visible)
    this.tutorialPrompts = this.add.text(gameWidth / 2, 50, '', {
      fontSize: '18px',
      color: '#ffffff',
      backgroundColor: '#1a2b3d',
      padding: { x: 20, y: 16 },
      wordWrap: { width: 700 },
      align: 'center',
      stroke: '#000000',
      strokeThickness: 2
    });
    this.tutorialPrompts.setOrigin(0.5, 0); // Center-aligned
    this.tutorialPrompts.setScrollFactor(0);
    this.tutorialPrompts.setDepth(200); // Highest depth for visibility
    
    // Controls help text (bottom-left)
    const controlsText = this.add.text(10, gameHeight - 110, 'CONTROLS:\nWASD - Move\nSPACE - Shoot\n1/2 - Switch Weapons\nE - Interact\nR - Scan', {
      fontSize: '12px',
      color: '#888888',
      backgroundColor: '#0a1628',
      padding: { x: 6, y: 4 }
    });
    controlsText.setScrollFactor(0);
    controlsText.setDepth(100);
    
    // Tooltip text
    this.tooltipText = this.add.text(0, 0, '', {
      fontSize: '12px',
      color: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 6, y: 3 }
    });
    this.tooltipText.setScrollFactor(0);
    this.tooltipText.setDepth(100);
    this.tooltipText.setVisible(false);
    
    // Inventory panel (initially hidden)
    this.inventoryPanel = this.add.container(0, 0);
    this.inventoryPanel.setScrollFactor(0);
    this.inventoryPanel.setDepth(100);
    this.inventoryPanel.setVisible(false);
    
    // Progress bar for activities
    this.progressBar = this.add.graphics();
    this.progressBar.setScrollFactor(0);
    this.progressBar.setDepth(100);
    
    // Mining progress bar
    this.miningProgressBar = this.add.graphics();
    this.miningProgressBar.setScrollFactor(0);
    this.miningProgressBar.setDepth(100);
    
    // Scan effect
    this.scanEffect = this.add.graphics();
    this.scanEffect.setDepth(5);
    
    this.updateUI();
  }

  setupPhysics() {
    // Player collision with walls
    this.physics.add.collider(this.player, this.collisionLayer);
    
    // Player overlap with interactive objects
    this.physics.add.overlap(this.player, this.miningNodes, this.nearInteractable, undefined, this);
    this.physics.add.overlap(this.player, this.scanTerminals, this.nearInteractable, undefined, this);
    this.physics.add.overlap(this.player, this.hackConsoles, this.nearInteractable, undefined, this);
  }

  startTutorial() {
    this.tutorialStep = 0;
    this.updateTutorialPrompt();
  }

  updateTutorialPrompt() {
    if (this.tutorialPhase in this.tutorialSteps) {
      this.tutorialPrompts.setText(this.tutorialSteps[this.tutorialPhase as keyof typeof this.tutorialSteps]);
    }
  }

  advanceTutorialPhase() {
    switch (this.tutorialPhase) {
      case 'movement':
        // Player has moved, advance to mining
        this.tutorialPhase = 'mining';
        break;
      case 'mining':
        // Player has mined, advance to scanning
        this.tutorialPhase = 'scanning';
        break;
      case 'scanning':
        // Player has scanned, introduce first enemy
        this.tutorialPhase = 'combat_intro';
        this.spawnTutorialEnemy();
        break;
      case 'combat_intro':
        // Player killed first enemy, teach weapon switching
        this.tutorialPhase = 'combat_weapons';
        this.tutorialEnemiesSpawned = 0; // Reset counter for next phase
        this.spawnTutorialEnemy();
        break;
      case 'combat_weapons':
        // Player used different weapon, advance to hacking
        this.tutorialPhase = 'hacking';
        break;
      case 'hacking':
        // Tutorial complete
        this.tutorialPhase = 'complete';
        this.completeTutorial();
        break;
    }
    this.updateTutorialPrompt();
  }

  spawnTutorialEnemy() {
    if (this.tutorialEnemiesSpawned >= this.maxTutorialEnemies) return;
    
    // Spawn enemy near player but not too close
    const spawnDistance = 200;
    const angle = Math.random() * Math.PI * 2;
    const spawnX = this.player.x + Math.cos(angle) * spawnDistance;
    const spawnY = this.player.y + Math.sin(angle) * spawnDistance;
    
    // Ensure spawn position is within world bounds
    const clampedX = Phaser.Math.Clamp(spawnX, 50, this.worldWidth - 50);
    const clampedY = Phaser.Math.Clamp(spawnY, 50, this.worldHeight - 50);
    
    const enemy = this.enemies.create(clampedX, clampedY, 'player');
    
    // Tutorial enemy - weaker for learning
    enemy.setTint(0xff0000);
    enemy.setScale(1.5);
    enemy.health = 30; // Lower health for tutorial
    enemy.speed = 60;
    enemy.enemyType = 'Tutorial Drone';
    enemy.isTutorialEnemy = true;
    
    this.tutorialEnemiesSpawned++;
    
    console.log(`Spawned tutorial enemy ${this.tutorialEnemiesSpawned}/${this.maxTutorialEnemies} for phase: ${this.tutorialPhase}`);
    
    // Update tutorial prompt to show combat instructions
    this.updateTutorialPrompt();
  }

  nearInteractable(player: any, interactable: any) {
    if (this.currentInteractable !== interactable) {
      this.currentInteractable = interactable;
      const type = interactable.getData('type');
      
      let tooltipText = '';
      switch (type) {
        case 'mining':
          tooltipText = 'Press E to mine cyber ore';
          break;
        case 'scan':
          tooltipText = 'Press E to access scan terminal';
          break;
        case 'hack':
          tooltipText = 'Press E to hack console';
          break;
      }
      
      this.showTooltip(tooltipText, interactable.x, interactable.y - 40);
    }
  }

  showTooltip(text: string, x: number, y: number) {
    this.tooltipText.setText(text);
    this.tooltipText.setPosition(x - this.tooltipText.width / 2, y);
    this.tooltipText.setVisible(true);
  }

  hideTooltip() {
    this.tooltipText.setVisible(false);
    this.currentInteractable = null;
  }
  
  // Core Mechanics Implementation
  startMining(node: any) {
    if (this.isMining || this.playerEnergy < 10) return;
    
    this.isMining = true;
    this.miningProgress = 0;
    this.playerEnergy -= 10;
    
    // Show mining progress
    const miningTimer = this.time.addEvent({
      delay: 100,
      repeat: 30,
      callback: () => {
        this.miningProgress += 3.33;
        this.updateMiningProgress();
        
        if (this.miningProgress >= 100) {
          this.completeMining(node);
        }
      }
    });
  }

  updateMiningProgress() {
    this.miningProgressBar.clear();
    
    if (this.isMining) {
      const barWidth = 200;
      const barHeight = 20;
      const x = this.cameras.main.centerX - barWidth / 2;
      const y = this.cameras.main.centerY + 100;
      
      // Background
      this.miningProgressBar.fillStyle(0x333333);
      this.miningProgressBar.fillRect(x, y, barWidth, barHeight);
      
      // Progress
      this.miningProgressBar.fillStyle(0x0099ff);
      this.miningProgressBar.fillRect(x, y, (barWidth * this.miningProgress) / 100, barHeight);
      
      // Border
      this.miningProgressBar.lineStyle(2, 0x00d4ff);
      this.miningProgressBar.strokeRect(x, y, barWidth, barHeight);
    }
  }

  completeMining(node: any) {
    this.isMining = false;
    this.miningProgress = 0;
    this.miningProgressBar.clear();
    
    const resource = node.getData('resource');
    const amount = node.getData('amount');
    
    this.inventory[resource] += amount;
    this.playerTokens += 10;
    
    // Remove the mined node
    node.destroy();
    
    // Advance tutorial if this was the first mine
    if (this.tutorialPhase === 'mining') {
      this.advanceTutorialPhase();
    }
    
    this.updateUI();
    this.hideTooltip();
    
    // Show success message
    const successText = this.add.text(this.player.x, this.player.y - 50, '+5 Cyber Ore\n+10 Tokens', {
      fontSize: '14px',
      color: '#00ff00',
      align: 'center'
    });
    
    this.tweens.add({
      targets: successText,
      y: successText.y - 30,
      alpha: 0,
      duration: 2000,
      onComplete: () => successText.destroy()
    });
  }
  
  startHacking(console: any) {
    if (this.hackingActive || this.playerEnergy < 20) return;
    
    this.hackingActive = true;
    this.playerEnergy -= 20;
    
    // Create simple hacking minigame
    this.createHackingUI();
  }
  
  createHackingUI() {
    this.hackingUI = this.add.container(this.cameras.main.centerX, this.cameras.main.centerY);
    this.hackingUI.setScrollFactor(0);
    this.hackingUI.setDepth(200);
    
    // Background
    const bg = this.add.rectangle(0, 0, 400, 300, 0x000000, 0.8);
    this.hackingUI.add(bg);
    
    // Title
    const title = this.add.text(0, -120, 'HACKING CONSOLE', {
      fontSize: '20px',
      color: '#ff0000',
      align: 'center'
    }).setOrigin(0.5);
    this.hackingUI.add(title);
    
    // Instructions
    const instructions = this.add.text(0, -80, 'Click the correct sequence!', {
      fontSize: '14px',
      color: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);
    this.hackingUI.add(instructions);
    
    // Create sequence buttons
    const sequence = [1, 3, 2, 4]; // Correct sequence
    let currentStep = 0;
    
    const buttons = [];
    for (let i = 1; i <= 4; i++) {
      const button = this.add.rectangle(-60 + (i-1) * 40, 0, 30, 30, 0x333333)
        .setInteractive()
        .on('pointerdown', () => {
          if (sequence[currentStep] === i) {
            button.setFillStyle(0x00ff00);
            currentStep++;
            if (currentStep >= sequence.length) {
              this.completeHacking();
            }
          } else {
            this.failHacking();
          }
        });
      
      const buttonText = this.add.text(-60 + (i-1) * 40, 0, i.toString(), {
        fontSize: '16px',
        color: '#ffffff'
      }).setOrigin(0.5);
      
      this.hackingUI.add([button, buttonText]);
      buttons.push(button);
    }
    
    // Cancel button
    const cancelButton = this.add.rectangle(0, 80, 100, 30, 0x666666)
      .setInteractive()
      .on('pointerdown', () => {
        this.hackingActive = false;
        this.hackingUI.destroy();
      });
    
    const cancelText = this.add.text(0, 80, 'Cancel', {
      fontSize: '14px',
      color: '#ffffff'
    }).setOrigin(0.5);
    
    this.hackingUI.add([cancelButton, cancelText]);
  }
  
  completeHacking() {
    this.hackingActive = false;
    this.hackingUI.destroy();
    
    // Reward player
    this.inventory.hack_tools += 2;
    this.playerTokens += 15;
    
    // Remove the hacked console
    if (this.currentInteractable) {
      this.currentInteractable.destroy();
    }
    
    // Advance tutorial if this was the first hack
    if (this.tutorialPhase === 'hacking') {
      this.advanceTutorialPhase();
    }
    
    this.updateUI();
    this.hideTooltip();
    
    // Show success message
    const successText = this.add.text(this.player.x, this.player.y - 50, 'Hack Successful!\n+2 Hack Tools\n+15 Tokens', {
      fontSize: '14px',
      color: '#00ff00',
      align: 'center'
    });
    
    this.tweens.add({
      targets: successText,
      y: successText.y - 30,
      alpha: 0,
      duration: 2000,
      onComplete: () => successText.destroy()
    });
  }
  
  failHacking() {
    this.hackingActive = false;
    this.hackingUI.destroy();
    
    // Show failure message
    const failText = this.add.text(this.player.x, this.player.y - 50, 'Hack Failed!', {
      fontSize: '16px',
      color: '#ff0000'
    });
    
    this.tweens.add({
      targets: failText,
      y: failText.y - 30,
      alpha: 0,
      duration: 1500,
      onComplete: () => failText.destroy()
    });
  }

  completeTutorial() {
    this.isInTutorial = false;
    
    // Show faction selection
    this.time.delayedCall(2000, () => {
      this.showFactionSelection();
    });
  }

  showFactionSelection() {
    // Navigate to faction selection page
    const gameStore = (window as Record<string, unknown>).gameStore as { getState: () => { setCurrentPage: (page: string) => void } };
    if (gameStore) {
      gameStore.getState().setCurrentPage('faction-selection');
    }
  }

  updateUI() {
    // Update health bar
    const healthWidth = (this.playerHealth / 100) * 200;
    this.healthBar.clear();
    this.healthBar.fillStyle(0x00ff00);
    this.healthBar.fillRect(10, 100, healthWidth, 20);
    this.healthBar.lineStyle(2, 0xffffff);
    this.healthBar.strokeRect(10, 100, 200, 20);
    
    // Update energy bar
    const energyWidth = (this.playerEnergy / 100) * 200;
    this.energyBar.clear();
    this.energyBar.fillStyle(0x0088ff);
    this.energyBar.fillRect(10, 130, energyWidth, 20);
    this.energyBar.lineStyle(2, 0xffffff);
    this.energyBar.strokeRect(10, 130, 200, 20);
    
    // Update token counter
    this.tokenCounter.setText(`WAGUS Tokens: ${this.playerTokens}`);
    
    // Update combat UI
    this.weaponText.setText(`Weapon: ${this.currentWeapon.toUpperCase()}`);
    this.ammoText.setText(`Ammo: ${this.ammo}`);
    this.levelText.setText(`Level: ${this.playerLevel}`);
    this.killsText.setText(`Kills: ${this.enemiesKilled}`);
  }

  // Combat System Methods
  createEnemies() {
    this.enemies = this.physics.add.group();
  }

  createWeapons() {
    this.weapons = this.physics.add.group();
  }

  createProjectiles() {
    this.projectiles = this.physics.add.group();
  }

  createPowerUps() {
    this.powerUps = this.physics.add.group();
  }

  setupCombatCollisions() {
    // Player vs enemies
    this.physics.add.overlap(this.player, this.enemies, this.playerHitByEnemy, undefined, this);
    
    // Projectiles vs enemies
    this.physics.add.overlap(this.projectiles, this.enemies, this.projectileHitEnemy, undefined, this);
    
    // Player vs power-ups
    this.physics.add.overlap(this.player, this.powerUps, this.collectPowerUp, undefined, this);
  }

  startEnemySpawning() {
    this.time.addEvent({
      delay: 4000, // Increased spawn delay for better balance
      callback: this.spawnEnemy,
      callbackScope: this,
      loop: true
    });
  }

  spawnEnemy() {
    const spawnPoints = [
      { x: 50, y: 50 },
      { x: this.worldWidth - 50, y: 50 },
      { x: 50, y: this.worldHeight - 50 },
      { x: this.worldWidth - 50, y: this.worldHeight - 50 }
    ];
    
    const spawnPoint = Phaser.Utils.Array.GetRandom(spawnPoints);
    const enemy = this.enemies.create(spawnPoint.x, spawnPoint.y, 'player');
    
    // Random enemy types - increased health for better balance
    const enemyTypes = [
      { tint: 0xff0000, health: 80, speed: 80, scale: 1.5, name: 'Cyber Drone' },
      { tint: 0xff6600, health: 120, speed: 60, scale: 1.8, name: 'Heavy Bot' },
      { tint: 0xff0066, health: 60, speed: 120, scale: 1.2, name: 'Scout' }
    ];
    
    const enemyType = Phaser.Utils.Array.GetRandom(enemyTypes);
    enemy.setTint(enemyType.tint);
    enemy.setScale(enemyType.scale);
    enemy.health = enemyType.health;
    enemy.speed = enemyType.speed;
    enemy.enemyType = enemyType.name;
    
    // Chance to spawn power-up when enemy dies
    enemy.dropsPowerUp = Math.random() < 0.3;
  }

  playerHitByEnemy(player: any, enemy: any) {
    // Add invincibility frames to prevent instant death
    if (this.player.getData('invulnerable')) return;
    
    this.playerHealth -= 15; // Increased damage to make combat more dangerous
    
    // Add brief invulnerability
    this.player.setData('invulnerable', true);
    this.player.setAlpha(0.5);
    
    this.time.delayedCall(1000, () => {
      this.player.setData('invulnerable', false);
      this.player.setAlpha(1);
    });
    
    if (this.playerHealth <= 0) {
      this.gameOver();
    }
    this.updateUI();
  }

  projectileHitEnemy(projectile: any, enemy: any) {
    projectile.destroy();
    enemy.health -= this.weaponDamage;
    
    // Create hit effect
    const hitEffect = this.add.circle(enemy.x, enemy.y, 20, 0xff0000, 0.6);
    this.tweens.add({
      targets: hitEffect,
      alpha: 0,
      scale: 2,
      duration: 200,
      onComplete: () => hitEffect.destroy()
    });
    
    // Show damage number
    const damageText = this.add.text(enemy.x, enemy.y - 30, `-${this.weaponDamage}`, {
      fontSize: '14px',
      color: '#ff0000'
    });
    
    this.tweens.add({
      targets: damageText,
      y: damageText.y - 20,
      alpha: 0,
      duration: 800,
      onComplete: () => damageText.destroy()
    });
    
    if (enemy.health <= 0) {
      // Create explosion effect
      const explosion = this.add.circle(enemy.x, enemy.y, 30, 0xffff00, 0.8);
      this.tweens.add({
        targets: explosion,
        alpha: 0,
        scale: 3,
        duration: 300,
        onComplete: () => explosion.destroy()
      });
      
      // Spawn power-up if enemy drops one
      if (enemy.dropsPowerUp) {
        this.spawnPowerUp(enemy.x, enemy.y);
      }
      
      enemy.destroy();
      this.enemiesKilled++;
      this.playerTokens += 5;
      
      // Tutorial phase advancement for enemy defeats
      if (enemy.isTutorialEnemy) {
        if (this.tutorialPhase === 'combat_intro') {
          this.advanceTutorialPhase();
        } else if (this.tutorialPhase === 'combat_weapons' && this.currentWeapon === 'cyber_sword') {
          // Only advance if player used cyber sword to kill the enemy
          this.advanceTutorialPhase();
        }
      }
      
      // Level up system
      this.playerExp += 10;
      if (this.playerExp >= this.playerLevel * 100) {
        this.levelUp();
      }
      
      this.updateUI();
    }
  }

  collectPowerUp(player: any, powerUp: any) {
    const type = powerUp.getData('type');
    switch (type) {
      case 'health':
        this.playerHealth = Math.min(100, this.playerHealth + 25);
        break;
      case 'energy':
        this.playerEnergy = Math.min(100, this.playerEnergy + 30);
        break;
      case 'ammo':
        this.ammo = Math.min(200, this.ammo + 20);
        break;
    }
    
    // Show collection effect
    const collectText = this.add.text(powerUp.x, powerUp.y - 20, `+${type.toUpperCase()}`, {
      fontSize: '12px',
      color: '#ffffff'
    });
    
    this.tweens.add({
      targets: collectText,
      y: collectText.y - 30,
      alpha: 0,
      duration: 1000,
      onComplete: () => collectText.destroy()
    });
    
    powerUp.destroy();
    this.updateUI();
  }

  switchWeapon(weaponType: string) {
    if (this.inventory[weaponType] && this.inventory[weaponType] > 0) {
      const previousWeapon = this.currentWeapon;
      this.currentWeapon = weaponType;
      
      // Update weapon stats
      switch (weaponType) {
        case 'plasma_rifle':
          this.weaponDamage = 15;
          this.maxWeaponCooldown = 500;
          break;
        case 'cyber_sword':
          this.weaponDamage = 25;
          this.maxWeaponCooldown = 800; // Slower but more powerful
          break;
      }
      
      // Tutorial: detect weapon switching during combat_weapons phase
      if (this.tutorialPhase === 'combat_weapons' && weaponType === 'cyber_sword' && previousWeapon !== 'cyber_sword') {
        // Player successfully switched to cyber sword, but don't advance yet
        // Wait for them to kill the enemy with the new weapon
      }
      
      this.updateUI();
      
      // Show weapon switch notification
      const switchText = this.add.text(this.player.x, this.player.y - 60, `Switched to ${weaponType.toUpperCase().replace('_', ' ')}`, {
        fontSize: '14px',
        color: '#ffff00'
      }).setOrigin(0.5);
      
      this.tweens.add({
        targets: switchText,
        y: switchText.y - 30,
        alpha: 0,
        duration: 1500,
        onComplete: () => switchText.destroy()
      });
    }
  }

  gameOver() {
    this.scene.pause();
    const gameOverText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, 'GAME OVER', {
      fontSize: '48px',
      color: '#ff0000'
    }).setOrigin(0.5);
    gameOverText.setScrollFactor(0);
  }

  shoot() {
    // Check if we have ammo
    if (this.ammo <= 0) {
      // Show no ammo message
      const noAmmoText = this.add.text(this.player.x, this.player.y - 40, 'NO AMMO!', {
        fontSize: '16px',
        color: '#ff0000'
      }).setOrigin(0.5);
      
      this.tweens.add({
        targets: noAmmoText,
        y: noAmmoText.y - 20,
        alpha: 0,
        duration: 1000,
        onComplete: () => noAmmoText.destroy()
      });
      return;
    }
    
    this.weaponCooldown = this.maxWeaponCooldown;
    this.ammo -= 1;
    
    // Create projectile with weapon-specific properties
    const projectile = this.projectiles.create(this.player.x, this.player.y, 'particle');
    
    if (this.currentWeapon === 'plasma_rifle') {
      projectile.setScale(1.5); // Smaller projectiles
      projectile.setTint(0x00ffff);
    } else if (this.currentWeapon === 'cyber_sword') {
      projectile.setScale(2); // Reduced size
      projectile.setTint(0xff6600);
    }
    
    // Add muzzle flash effect
    const muzzleFlash = this.add.circle(this.player.x, this.player.y, 15, 0xffffff, 0.8);
    this.tweens.add({
      targets: muzzleFlash,
      alpha: 0,
      scale: 2,
      duration: 100,
      onComplete: () => muzzleFlash.destroy()
    });
    
    // Calculate direction to nearest enemy
    let targetEnemy = null;
    let minDistance = Infinity;
    
    this.enemies.children.entries.forEach((enemy: any) => {
      const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, enemy.x, enemy.y);
      if (distance < minDistance) {
        minDistance = distance;
        targetEnemy = enemy;
      }
    });
    
    if (targetEnemy) {
      const angle = Phaser.Math.Angle.Between(this.player.x, this.player.y, targetEnemy.x, targetEnemy.y);
      const velocity = 400;
      projectile.setVelocity(
        Math.cos(angle) * velocity,
        Math.sin(angle) * velocity
      );
    } else {
      // Shoot upward if no enemies
      projectile.setVelocity(0, -400);
    }
    
    // Destroy projectile after 3 seconds
    this.time.delayedCall(3000, () => {
      if (projectile.active) {
        projectile.destroy();
      }
    });
    
    this.updateUI();
  }

  spawnPowerUp(x: number, y: number) {
     const powerUpTypes = [
       { type: 'health', tint: 0x00ff00, sprite: 'particle' },
       { type: 'energy', tint: 0x0088ff, sprite: 'particle' },
       { type: 'ammo', tint: 0xffff00, sprite: 'particle' }
     ];
     
     const powerUpType = Phaser.Utils.Array.GetRandom(powerUpTypes);
     const powerUp = this.powerUps.create(x, y, powerUpType.sprite);
     powerUp.setTint(powerUpType.tint);
     powerUp.setScale(3);
     powerUp.setData('type', powerUpType.type);
     
     // Add floating animation
     this.tweens.add({
       targets: powerUp,
       y: y - 10,
       duration: 1000,
       yoyo: true,
       repeat: -1,
       ease: 'Sine.easeInOut'
     });
     
     // Auto-destroy after 10 seconds
     this.time.delayedCall(10000, () => {
       if (powerUp.active) {
         powerUp.destroy();
       }
     });
   }
   
   levelUp() {
     this.playerLevel++;
     this.playerExp = 0;
     this.playerHealth = 100; // Full heal on level up
     this.playerEnergy = 100;
     this.weaponDamage += 5; // Increase damage
     this.ammo += 50; // Bonus ammo
     
     // Show level up effect
     const levelUpText = this.add.text(this.player.x, this.player.y - 50, `LEVEL UP!\nLevel ${this.playerLevel}`, {
       fontSize: '20px',
       color: '#ffff00',
       align: 'center'
     }).setOrigin(0.5);
     
     // Create level up particle effect
     for (let i = 0; i < 10; i++) {
       const particle = this.add.circle(
         this.player.x + Phaser.Math.Between(-30, 30),
         this.player.y + Phaser.Math.Between(-30, 30),
         5,
         0xffff00,
         0.8
       );
       
       this.tweens.add({
         targets: particle,
         y: particle.y - 50,
         alpha: 0,
         duration: 1500,
         onComplete: () => particle.destroy()
       });
     }
     
     this.tweens.add({
       targets: levelUpText,
       y: levelUpText.y - 30,
       alpha: 0,
       duration: 2000,
       onComplete: () => levelUpText.destroy()
     });
     
     this.updateUI();
   }

  updateCombat() {
    // Update enemy AI
    this.enemies.children.entries.forEach((enemy: any) => {
      if (!enemy.active) return;
      
      // Move towards player
      const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, this.player.x, this.player.y);
      const velocity = enemy.speed || 80;
      
      enemy.setVelocity(
        Math.cos(angle) * velocity,
        Math.sin(angle) * velocity
      );
    });
    
    // Only spawn enemies automatically if tutorial is complete
    if (!this.isInTutorial) {
      this.enemySpawnTimer += 16; // Assuming 60 FPS
      if (this.enemySpawnTimer >= 5000) { // Every 5 seconds
        this.spawnEnemy();
        this.enemySpawnTimer = 0;
      }
    }
  }
}

const PhaserGame: React.FC = () => {
  const gameRef = useRef<Phaser.Game | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { setCurrentPage, addTokens, addItem, updateProgress } = useGameStore();
  const [debugInfo, setDebugInfo] = useState<string>('Initializing Tutorial Zone...');

  useEffect(() => {
    console.log('PhaserGame (Tutorial Zone) component mounted');
    setDebugInfo('Tutorial zone loading...');
    
    // Ensure the container exists before creating the game
    if (!containerRef.current) {
      console.log('Container ref not ready, waiting...');
      setDebugInfo('Container ref not ready');
      return;
    }
    
    console.log('Container ready, creating tutorial zone...', containerRef.current);
    
    // Make game store available globally for the scene
    (window as Record<string, unknown>).gameStore = { getState: () => ({ setCurrentPage, addTokens, addItem, updateProgress }) };
    setDebugInfo('Container ready, creating Phaser game...');

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: 1000,
      height: 700,
      parent: containerRef.current,
      backgroundColor: '#0a1628',
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { x: 0, y: 0 },
          debug: false
        }
      },
      scene: TutorialGameScene,
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 1000,
        height: 700
      },
      render: {
        pixelArt: false,
        antialias: true
      },
      callbacks: {
        postBoot: function (game: Phaser.Game) {
          console.log('Tutorial zone post-boot callback called');
          console.log('Canvas element:', game.canvas);
          console.log('Renderer:', game.renderer);
          setDebugInfo(`Tutorial zone loaded! Canvas: ${game.canvas ? 'EXISTS' : 'MISSING'}`);
        }
      }
    };

    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      if (!gameRef.current && containerRef.current) {
        console.log('Creating Phaser.Game instance...');
        setDebugInfo('Creating Phaser.Game instance...');
        try {
          gameRef.current = new Phaser.Game(config);
          console.log('Phaser.Game created successfully!', gameRef.current);
          setDebugInfo('Tutorial zone ready!');
          
          // Additional debugging
          setTimeout(() => {
            if (gameRef.current) {
              console.log('Game canvas:', gameRef.current.canvas);
              console.log('Game renderer type:', gameRef.current.renderer.type);
              console.log('Game scene manager:', gameRef.current.scene);
              setDebugInfo(`Tutorial running - Canvas: ${gameRef.current.canvas ? 'OK' : 'MISSING'}`);
            }
          }, 1000);
        } catch (error) {
          console.error('Error creating Phaser game:', error);
          setDebugInfo(`Error: ${error}`);
        }
      }
    }, 100);

    return () => {
      clearTimeout(timer);
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, [setCurrentPage, addTokens, addItem, updateProgress]);

  return (
    <div className="w-full h-screen bg-gray-900 flex flex-col items-center justify-center">
      <div className="mb-4">
        <button
          onClick={() => setCurrentPage('menu')}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Back to Menu
        </button>
      </div>
      
      {/* Debug Info */}
      <div className="mb-2 px-4 py-2 bg-blue-900 text-white rounded text-sm">
        Status: {debugInfo}
      </div>
      
      <div 
        ref={containerRef}
        className="border-2 border-gray-600 rounded-lg shadow-2xl bg-black"
        style={{ 
          width: '1000px', 
          height: '700px',
          position: 'relative',
          overflow: 'visible'
        }}
      />
      <div className="mt-4 text-center text-white">
        <h2 className="text-xl font-bold mb-2 text-cyan-400">WAGUS: Origins - Tutorial Zone</h2>
        <p className="text-sm text-gray-300">Learn the core mechanics: mining, scanning, and hacking!</p>
        <p className="text-xs text-cyan-300 mt-1">WASD to move • E to interact • R to scan • Follow tutorial prompts</p>
      </div>
    </div>
  );
};

export default PhaserGame;