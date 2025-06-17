import Phaser from 'phaser';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  init() {
    this.playerName = ''
    this.map = null;
    this.players = new Map();
    this.bombs = new Map();
    this.cursors = null;
    this.walls = null;
    this.breakableWalls = null;
    this.explosions = new Set();
    
    this.gameState = {
      lives: 3,
      score: 0,
      isGameOver: false,
      maxBombs: 1,
      currentBombs: 0,
      bombPowerups: 0
    };
    
    this.livesText = null;
    this.scoreText = null;
    this.gameOverText = null;
    this.bombsText = null;
  }

  preload() {
    // 预加载资源
  }

  create() {
    console.log('Creating game scene...');
    
    // 设置物理世界边界
    this.physics.world.setBounds(0, 0, 416, 352);
    
    // 创建炸弹纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x000000);
    graphics.fillCircle(12, 12, 12);
    graphics.generateTexture('bomb', 24, 24);
    graphics.destroy();
    
    // 初始化游戏元素
    this.createMap();
    this.createPlayer();
    this.createUI();
    
    // 设置控制器
    this.setupControls();
  }

  update() {
    if (this.gameState.isGameOver) return;
    
    const player = this.players.get('player1');
    if (!player) return;
    
    // Reset velocity
    player.body.setVelocity(0);
    
    // Handle movement
    if (this.cursors.left.isDown) {
      player.body.setVelocityX(-160);
    } else if (this.cursors.right.isDown) {
      player.body.setVelocityX(160);
    }
    
    if (this.cursors.up.isDown) {
      player.body.setVelocityY(-160);
    } else if (this.cursors.down.isDown) {
      player.body.setVelocityY(160);
    }
  }

  createMap() {
    console.log('Creating map...');
    
    const mapWidth = 13;
    const mapHeight = 11;
    const tileSize = 32;

    // Create physics groups
    this.walls = this.physics.add.staticGroup();
    this.breakableWalls = this.physics.add.staticGroup();

    // Create map array
    this.map = [];
    for (let y = 0; y < mapHeight; y++) {
      this.map[y] = [];
      for (let x = 0; x < mapWidth; x++) {
        // 先创建浅色地板
        const floor = this.add.rectangle(
          x * tileSize + tileSize/2,
          y * tileSize + tileSize/2,
          tileSize,
          tileSize,
          0x3D4451 // 浅灰色地板
        );
        
        if (x === 0 || y === 0 || x === mapWidth - 1 || y === mapHeight - 1 ||
            (x % 2 === 0 && y % 2 === 0)) {
          this.map[y][x] = 1; // Solid wall
          // Create dark gray rectangle for solid wall
          const wall = this.add.rectangle(
            x * tileSize + tileSize/2,
            y * tileSize + tileSize/2,
            tileSize,
            tileSize,
            0x1F2937 // 深灰色墙壁
          );
          this.walls.add(wall);
        } else {
          if (Math.random() < 0.7 && 
              !(x === 1 && y === 1) && 
              !(x === 1 && y === 2) && 
              !(x === 2 && y === 1)) {
            this.map[y][x] = 2; // Breakable wall
            // Create brown rectangle for breakable wall
            const breakableWall = this.add.rectangle(
              x * tileSize + tileSize/2,
              y * tileSize + tileSize/2,
              tileSize,
              tileSize,
              0x8B4513 // 保持原有的棕色可破坏墙
            );
            this.breakableWalls.add(breakableWall);
          } else {
            this.map[y][x] = 0; // Empty space
          }
        }
      }
    }
  }

  createPlayer() {
    console.log('Creating player with name:', this.playerName); // 调试日志
    
    // Create player container
    const player = this.add.container(48, 48);
    
    // Create body (center rectangle)
    const body = this.add.rectangle(0, 0, 20, 20 * 0.85, 0x4A90E2);
    
    // Create head (upper rectangle)
    const head = this.add.rectangle(0, -10 * 0.85, 16, 12 * 0.85, 0x5B9AE8);
    
    // Create eyes (two small circles)
    const leftEye = this.add.circle(-4, -10 * 0.85, 2, 0xFFFFFF);
    const rightEye = this.add.circle(4, -10 * 0.85, 2, 0xFFFFFF);
    
    // Create legs
    const leftLeg = this.add.rectangle(-6, 10 * 0.85, 8, 8 * 0.85, 0x3A7BCE);
    const rightLeg = this.add.rectangle(6, 10 * 0.85, 8, 8 * 0.85, 0x3A7BCE);

    // 使用玩家名称作为天线文字
    const antenna = this.add.text(0, -20 * 0.85, this.playerName, {
      fontSize: '14px',
      fontFamily: 'Arial',
      color: '#FFFFFF',
      stroke: '#000000',
      strokeThickness: 2,
      fontStyle: 'bold'
    });
    antenna.setOrigin(0.5);
    
    // 添加天线摆动动画
    this.tweens.add({
      targets: antenna,
      angle: { from: -15, to: 15 },
      duration: 700,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Add all parts to container
    player.add([body, head, leftEye, rightEye, leftLeg, rightLeg, antenna]);
    
    // Store player reference
    this.players.set('player1', player);
    
    // Enable physics with improved collision bounds
    this.physics.add.existing(player);
    player.body.setSize(24, 32 * 0.85); // Adjust collision box size with new height
    player.body.setOffset(-12, -16 * 0.85); // Center the collision box with new height
    player.body.setCollideWorldBounds(true);
    player.body.setBounce(0); // Prevent bouncing off walls

    // Add collisions
    this.physics.add.collider(player, this.walls);
    this.physics.add.collider(player, this.breakableWalls);
  }

  createUI() {
    console.log('Creating UI...');
    
    // Create UI background in the game-info div
    const gameInfo = document.querySelector('.game-info');
    if (!gameInfo) {
      console.error('Game info container not found!');
      return;
    }
    
    // Create score text
    const scoreDiv = document.createElement('div');
    scoreDiv.className = 'text-white text-xl';
    scoreDiv.textContent = 'Score: 0';
    gameInfo.appendChild(scoreDiv);
    
    // Create lives text
    const livesDiv = document.createElement('div');
    livesDiv.className = 'text-white text-xl';
    livesDiv.textContent = 'Lives: 3';
    gameInfo.appendChild(livesDiv);
    
    // Create bombs text
    const bombsDiv = document.createElement('div');
    bombsDiv.className = 'text-white text-xl';
    bombsDiv.textContent = 'Bombs: 1/1';
    gameInfo.appendChild(bombsDiv);
    
    // Store references for updating
    this.scoreText = scoreDiv;
    this.livesText = livesDiv;
    this.bombsText = bombsDiv;

    // Create game over text (hidden by default)
    this.gameOverText = this.add.text(416/2, 352/2, 'GAME OVER\nPress SPACE to restart', {
      fontSize: '32px',
      fontFamily: 'Arial',
      color: '#ff0000',
      align: 'center'
    });
    this.gameOverText.setOrigin(0.5);
    this.gameOverText.setDepth(2);
    this.gameOverText.setVisible(false);
  }

  setupControls() {
    console.log('Setting up controls...');
    
    // Set up keyboard controls
    this.cursors = this.input.keyboard.createCursorKeys();
    
    // Set up bomb placement key
    this.input.keyboard.on('keydown-SPACE', () => {
      if (!this.gameState.isGameOver) {
        this.placeBomb();
      } else {
        this.restartGame();
      }
    });
  }

  placeBomb() {
    if (this.gameState.currentBombs >= this.gameState.maxBombs) return;
    
    const player = this.players.get('player1');
    if (!player) {
      console.error('Player not found!');
      return;
    }
    
    console.log('Player position:', player.x, player.y);
    console.log('Player body:', player.body);
    
    const gridX = Math.floor(player.x / 32);
    const gridY = Math.floor(player.y / 32);
    
    console.log('Grid position:', gridX, gridY);
    
    // Create bomb as a circle with darker color
    const bombId = Date.now();
    const bomb = this.add.circle(
      gridX * 32 + 16,
      gridY * 32 + 16,
      12,
      0x111827 // 更深的炸弹颜色
    );
    
    console.log('Created bomb:', bomb);
    
    // Enable physics as static body
    this.physics.add.existing(bomb, true);
    
    console.log('Bomb physics:', bomb.body);
    
    // Add collision
    this.physics.add.collider(player, bomb);
    
    // Store bomb reference
    this.bombs.set(bombId, bomb);
    
    // Update UI
    this.gameState.currentBombs++;
    this.updateUI();
    
    // Animations
    this.tweens.add({
      targets: bomb,
      alpha: 0.2,
      duration: 500,
      yoyo: true,
      repeat: 7
    });

    // Set explosion timer
    this.time.delayedCall(4000, () => {
      if (this.bombs.has(bombId)) {
        this.explodeBomb(bombId, gridX, gridY);
      }
    });
  }

  explodeBomb(bombId, x, y) {
    const bomb = this.bombs.get(bombId);
    if (!bomb) return;
    
    // Create explosions
    this.createExplosion(x * 32, y * 32);
    
    const directions = [
      {dx: 1, dy: 0},
      {dx: -1, dy: 0},
      {dx: 0, dy: 1},
      {dx: 0, dy: -1}
    ];
    
    directions.forEach(dir => {
      const newX = x + dir.dx;
      const newY = y + dir.dy;
      if (this.map[newY] && this.map[newY][newX] !== 1) {
        this.createExplosion(newX * 32, newY * 32);
      }
    });
    
    // Cleanup
    bomb.destroy();
    this.bombs.delete(bombId);
    this.gameState.currentBombs--;
    this.updateUI();
  }

  createExplosion(x, y) {
    const gridX = Math.floor(x / 32);
    const gridY = Math.floor(y / 32);
    
    if (this.map[gridY][gridX] === 1) return false;
    
    const explosion = this.add.circle(x + 16, y + 16, 14, 0xff0000);
    this.physics.add.existing(explosion, true);
    
    // Check for wall hits
    this.breakableWalls.getChildren().forEach(wall => {
      const wallX = Math.floor(wall.x / 32);
      const wallY = Math.floor(wall.y / 32);
      if (wallX === gridX && wallY === gridY) {
        wall.destroy();
        this.map[wallY][wallX] = 0;
        this.gameState.score += 10;
        this.updateUI();
        
        if (Math.random() < 0.25) {
          this.createPowerup(wallX * 32, wallY * 32);
        }
      }
    });
    
    // Check for player hit
    const player = this.players.get('player1');
    if (player) {
      const distance = Phaser.Math.Distance.Between(
        player.x, player.y,
        explosion.x, explosion.y
      );
      if (distance < 32) {
        this.handlePlayerHit();
      }
    }
    
    // Fade out explosion
    this.tweens.add({
      targets: explosion,
      alpha: 0,
      duration: 200,
      onComplete: () => {
        explosion.destroy();
      }
    });
    
    return true;
  }

  createPowerup(x, y) {
    const powerup = this.add.container(x + 16, y + 16);
    
    const circle = this.add.circle(0, 0, 8, 0x00ff00);
    const plus = this.add.text(0, 0, '+', {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#ffffff'
    }).setOrigin(0.5);
    
    powerup.add([circle, plus]);
    
    this.physics.add.existing(powerup, true);
    
    this.physics.add.overlap(this.players.get('player1'), powerup, () => {
      this.gameState.maxBombs++;
      this.updateUI();
      powerup.destroy();
    });
    
    this.tweens.add({
      targets: powerup,
      alpha: 0.6,
      duration: 1000,
      yoyo: true,
      repeat: -1
    });
  }

  handlePlayerHit() {
    if (this.gameState.isGameOver) return;
    
    const player = this.players.get('player1');
    this.gameState.lives--;
    this.updateUI();
    
    if (this.gameState.lives <= 0) {
      this.gameState.isGameOver = true;
      this.gameOverText.setVisible(true);
      return;
    }
    
    this.tweens.add({
      targets: player.list,
      alpha: 0.5,
      duration: 200,
      yoyo: true,
      repeat: 2,
      onComplete: () => {
        player.list.forEach(part => part.alpha = 1);
      }
    });
  }

  restartGame() {
    console.log('Restarting game...');
    
    this.gameState.lives = 3;
    this.gameState.score = 0;
    this.gameState.isGameOver = false;
    this.gameState.currentBombs = 0;
    this.gameState.maxBombs = 1;
    this.gameState.bombPowerups = 0;
    this.gameOverText.setVisible(false);
    
    // Clear existing bombs and explosions
    this.bombs.clear();
    
    // Reset player position
    const player = this.players.get('player1');
    if (player) {
      player.setPosition(48, 48);
      player.list.forEach(part => part.alpha = 1);
    }
    
    // Recreate map
    this.walls.clear(true, true);
    this.breakableWalls.clear(true, true);
    this.createMap();
    
    this.updateUI();
  }

  updateUI() {
    if (this.scoreText) {
      this.scoreText.textContent = 'Score: ' + this.gameState.score;
    }
    if (this.livesText) {
      this.livesText.textContent = 'Lives: ' + this.gameState.lives;
    }
    if (this.bombsText) {
      this.bombsText.textContent = 'Bombs: ' + (this.gameState.maxBombs - this.gameState.currentBombs) + '/' + this.gameState.maxBombs;
    }
  }
}