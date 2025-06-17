import Phaser from 'phaser';

const createGameScene = () => {
  let map = null;
  let players = new Map();
  let bombs = new Map();
  let cursors = null;
  let walls = null;
  let breakableWalls = null;
  let explosions = new Set();
  
  // Game state
  let gameState = {
    lives: 3,
    score: 0,
    isGameOver: false,
    maxBombs: 1,  // 最大炸弹数量
    currentBombs: 0  // 当前放置的炸弹数量
  };
  
  // UI elements
  let livesText = null;
  let scoreText = null;
  let gameOverText = null;
  let bombsText = null;  // 新增炸弹数量显示

  const preload = function() {
    // No image assets needed
  };

  const createUI = function() {
    // Create UI background in the game-info div
    const gameInfo = document.querySelector('.game-info');
    
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
    bombsDiv.textContent = 'Bombs: 1';
    gameInfo.appendChild(bombsDiv);
    
    // Store references for updating
    scoreText = scoreDiv;
    livesText = livesDiv;
    bombsText = bombsDiv;

    // Create game over text (hidden by default)
    gameOverText = this.add.text(416/2, 352/2, 'GAME OVER\nPress SPACE to restart', {
      fontSize: '32px',
      fontFamily: 'Arial',
      color: '#ff0000',
      align: 'center'
    });
    gameOverText.setOrigin(0.5);
    gameOverText.setDepth(2);
    gameOverText.setVisible(false);
  };

  const updateUI = function() {
    scoreText.textContent = 'Score: ' + gameState.score;
    livesText.textContent = 'Lives: ' + gameState.lives;
    bombsText.textContent = 'Bombs: ' + (gameState.maxBombs - gameState.currentBombs);
  };

  const showGameOver = function() {
    gameOverText.setVisible(true);
    this.input.keyboard.once('keydown-SPACE', () => {
      restartGame.call(this);
    });
  };

  const restartGame = function() {
    gameState.lives = 3;
    gameState.score = 0;
    gameState.isGameOver = false;
    gameState.currentBombs = 0;  // Reset current bombs count
    gameOverText.setVisible(false);
    
    // Clear existing bombs and explosions
    bombs.forEach(bomb => bomb.destroy());
    bombs.clear();
    explosions.forEach(explosion => explosion.destroy());
    explosions.clear();
    
    // Reset player position
    const player = players.get('player1');
    player.setPosition(48, 48);
    player.list.forEach(part => part.alpha = 1);
    
    // Recreate map
    walls.clear(true, true);
    breakableWalls.clear(true, true);
    createMap.call(this);
    
    updateUI.call(this);
  };

  const addScore = function(points) {
    gameState.score += points;
    updateUI();
  };

  const handlePlayerHit = function() {
    if (gameState.isGameOver) return;

    const player = players.get('player1');
    gameState.lives--;
    updateUI();

    // Visual feedback
    this.tweens.add({
      targets: player.list,
      alpha: 0.5,
      duration: 200,
      yoyo: true,
      repeat: 2,
      onComplete: () => {
        player.list.forEach(part => part.alpha = 1);
        
        // Check for game over
        if (gameState.lives <= 0) {
          gameState.isGameOver = true;
          showGameOver.call(this);
        }
      }
    });
  };

  const createMap = function() {
    const mapWidth = 13;
    const mapHeight = 11;
    const tileSize = 32;

    // Create physics groups
    walls = this.physics.add.staticGroup();
    breakableWalls = this.physics.add.staticGroup();

    // Create map array
    map = [];
    for (let y = 0; y < mapHeight; y++) {
      map[y] = [];
      for (let x = 0; x < mapWidth; x++) {
        if (x === 0 || y === 0 || x === mapWidth - 1 || y === mapHeight - 1 ||
            (x % 2 === 0 && y % 2 === 0)) {
          map[y][x] = 1; // Solid wall
          // Create gray rectangle for solid wall
          const wall = this.add.rectangle(
            x * tileSize + tileSize/2,
            y * tileSize + tileSize/2,
            tileSize,
            tileSize,
            0x666666
          );
          walls.add(wall);
        } else {
          if (Math.random() < 0.7 && 
              !(x === 1 && y === 1) && 
              !(x === 1 && y === 2) && 
              !(x === 2 && y === 1)) {
            map[y][x] = 2; // Breakable wall
            // Create brown rectangle for breakable wall
            const breakableWall = this.add.rectangle(
              x * tileSize + tileSize/2,
              y * tileSize + tileSize/2,
              tileSize,
              tileSize,
              0x8B4513
            );
            breakableWalls.add(breakableWall);
          } else {
            map[y][x] = 0; // Empty space
          }
        }
      }
    }

    // Ensure player initial position is empty space
    map[1][1] = 0; // Left top player
    map[1][2] = 0;
    map[2][1] = 0;

    // Remove walls from player initial position
    breakableWalls.getChildren().forEach(wall => {
      const gridX = Math.floor(wall.x / tileSize);
      const gridY = Math.floor(wall.y / tileSize);
      if ((gridX === 1 && gridY === 1) ||
          (gridX === 1 && gridY === 2) ||
          (gridX === 2 && gridY === 1)) {
        wall.destroy();
      }
    });
  };

  const createPlayer = function() {
    // Create player container
    const player = this.add.container(48, 48);
    
    // Create body (center rectangle)
    const body = this.add.rectangle(0, 0, 20, 20, 0x4A90E2);
    
    // Create head (upper rectangle)
    const head = this.add.rectangle(0, -12, 16, 12, 0x5B9AE8);
    
    // Create eyes (two small circles)
    const leftEye = this.add.circle(-4, -12, 2, 0xFFFFFF);
    const rightEye = this.add.circle(4, -12, 2, 0xFFFFFF);
    
    // Create legs
    const leftLeg = this.add.rectangle(-6, 12, 8, 8, 0x3A7BCE);
    const rightLeg = this.add.rectangle(6, 12, 8, 8, 0x3A7BCE);

    // Add all parts to container
    player.add([body, head, leftEye, rightEye, leftLeg, rightLeg]);
    
    // Store player reference
    players.set('player1', player);
    
    // Enable physics with improved collision bounds
    this.physics.add.existing(player);
    player.body.setSize(24, 32); // Adjust collision box size
    player.body.setOffset(-12, -16); // Center the collision box
    player.body.setCollideWorldBounds(true);
    player.body.setBounce(0); // Prevent bouncing off walls

    // Add collisions with improved response
    this.physics.add.collider(player, walls, null, null, this);
    this.physics.add.collider(player, breakableWalls, null, null, this);

    // Add walking animation
    this.tweens.add({
      targets: [leftLeg, rightLeg],
      y: '+=4',
      duration: 200,
      yoyo: true,
      repeat: -1,
      paused: true
    });
  };

  const setupControls = function() {
    // Set up keyboard controls
    cursors = this.input.keyboard.createCursorKeys();
    
    // Set up bomb placement key
    this.input.keyboard.on('keydown-SPACE', () => {
      placeBomb.call(this);
    });
  };

  const placeBomb = function() {
    if (gameState.isGameOver) return;
    if (gameState.currentBombs >= gameState.maxBombs) return; // 检查炸弹数量
    
    const player = players.get('player1');
    const gridX = Math.floor(player.x / 32);
    const gridY = Math.floor(player.y / 32);
    
    // Check if there's already a bomb at this position
    let bombExists = false;
    bombs.forEach(bomb => {
      const bombGridX = Math.floor(bomb.x / 32);
      const bombGridY = Math.floor(bomb.y / 32);
      if (bombGridX === gridX && bombGridY === gridY) {
        bombExists = true;
      }
    });
    
    if (bombExists) return;
    
    // Create bomb
    const bombId = Date.now();
    const bombContainer = this.add.container(gridX * 32 + 16, gridY * 32 + 16);
    
    // Create bomb circle
    const bombCircle = this.add.circle(0, 0, 12, 0x000000);
    
    // Create fuse effect (small rectangle on top)
    const fuse = this.add.rectangle(0, -12, 2, 6, 0xff0000);
    
    // Add parts to container
    bombContainer.add([bombCircle, fuse]);
    
    // Enable physics for the bomb container
    this.physics.add.existing(bombContainer, true);
    bombContainer.body.setImmovable(true);
    
    // Add collision between player and bomb
    this.physics.add.collider(players.get('player1'), bombContainer);
    
    // Increment current bombs count
    gameState.currentBombs++;
    updateUI();
    
    // Store bomb reference
    bombs.set(bombId, bombContainer);
    
    // Fuse animation
    this.tweens.add({
      targets: fuse,
      angle: { from: -20, to: 20 },
      duration: 200,
      yoyo: true,
      repeat: -1
    });
    
    // Bomb blinking effect
    this.tweens.add({
      targets: bombCircle,
      alpha: 0.2,
      duration: 500,
      yoyo: true,
      repeat: 7, // 4秒 = 8次 * 500ms
      onComplete: () => {
        explodeBomb.call(this, bombId, gridX, gridY);
      }
    });
  };

  const explodeBomb = function(bombId, x, y) {
    const bomb = bombs.get(bombId);
    if (bomb) {
      bomb.destroy();
      bombs.delete(bombId);
      // Decrement current bombs count
      gameState.currentBombs--;
      updateUI();
      
      // Create explosions in cross pattern
      createExplosion.call(this, x * 32, y * 32); // Center
      
      // Check each direction
      const directions = [
        {dx: 1, dy: 0},  // Right
        {dx: -1, dy: 0}, // Left
        {dx: 0, dy: 1},  // Down
        {dx: 0, dy: -1}  // Up
      ];
      
      directions.forEach(dir => {
        let newX = x + dir.dx;
        let newY = y + dir.dy;
        
        // Only create explosion if not blocked by solid wall
        if (map[newY] && map[newY][newX] !== 1) {
          if (createExplosion.call(this, newX * 32, newY * 32) === false) {
            return; // Stop in this direction if blocked
          }
        }
      });
    }
  };

  const createExplosion = function(x, y) {
    // Check if position is blocked by a wall
    const gridX = Math.floor(x / 32);
    const gridY = Math.floor(y / 32);
    
    // Don't create explosion if solid wall is present
    if (map[gridY][gridX] === 1) {
      return false;
    }
    
    // Create explosion effect
    const explosion = this.add.circle(
      x + 16,
      y + 16,
      14,
      0xff0000
    );
    
    // Enable physics for explosion
    this.physics.add.existing(explosion, true);
    explosion.body.setCircle(14);
    
    // Check for collision with breakable walls
    const hitWalls = [];
    breakableWalls.getChildren().forEach(wall => {
      const wallX = Math.floor(wall.x / 32);
      const wallY = Math.floor(wall.y / 32);
      if (wallX === gridX && wallY === gridY) {
        hitWalls.push(wall);
        addScore(10);
      }
    });
    
    // Destroy hit walls
    hitWalls.forEach(wall => {
      wall.destroy();
      map[Math.floor(wall.y / 32)][Math.floor(wall.x / 32)] = 0;
    });
    
    // Add to explosions set
    explosions.add(explosion);
    
    // Check for player hit with improved collision detection
    const player = players.get('player1');
    const distance = Phaser.Math.Distance.Between(
      player.x,
      player.y,
      explosion.x,
      explosion.y
    );
    
    if (distance < 32) { // If player is within explosion radius
      handlePlayerHit.call(this);
    }
    
    // Fade out and destroy explosion
    this.tweens.add({
      targets: explosion,
      alpha: 0,
      duration: 200,
      onComplete: () => {
        explosion.destroy();
        explosions.delete(explosion);
      }
    });
    
    return true;
  };

  const create = function() {
    this.physics.world.setBounds(0, 0, 416, 352);
    createMap.call(this);
    createPlayer.call(this);
    setupControls.call(this);
    createUI.call(this);
  };

  const update = function() {
    if (gameState.isGameOver) return;
    
    const player = players.get('player1');
    const speed = 160;
    let isMoving = false;
    
    // Reset velocity
    player.body.setVelocity(0);
    
    // Handle movement with improved physics
    if (cursors.left.isDown) {
      player.body.setVelocityX(-speed);
      player.list.forEach(part => part.x = part.originalX || 0);
      isMoving = true;
    } else if (cursors.right.isDown) {
      player.body.setVelocityX(speed);
      player.list.forEach(part => {
        if (!part.originalX) part.originalX = part.x;
        part.x = -part.originalX;
      });
      isMoving = true;
    }
    
    if (cursors.up.isDown) {
      player.body.setVelocityY(-speed);
      isMoving = true;
    } else if (cursors.down.isDown) {
      player.body.setVelocityY(speed);
      isMoving = true;
    }
    
    // Normalize diagonal movement
    if (player.body.velocity.x !== 0 && player.body.velocity.y !== 0) {
      player.body.setVelocity(
        player.body.velocity.x * 0.707,
        player.body.velocity.y * 0.707
      );
    }
    
    // Update walking animation
    const walkingAnimation = this.tweens.getTweensOf(player.list[4])[0];
    if (isMoving && walkingAnimation.isPaused) {
      walkingAnimation.resume();
    } else if (!isMoving && !walkingAnimation.isPaused) {
      walkingAnimation.pause();
    }
  };

  return {
    key: 'GameScene',
    preload,
    create,
    update
  };
};

export default createGameScene(); 