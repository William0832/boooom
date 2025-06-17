import Phaser from 'phaser';
import gameScene from '../scenes/GameScene';

const config = {
  type: Phaser.AUTO,
  parent: 'game',
  width: 416, // 13 * 32
  height: 352, // 11 * 32
  backgroundColor: '#2d2d2d',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: gameScene,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  pixelArt: true
};

export default config; 