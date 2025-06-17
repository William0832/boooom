import Phaser from 'phaser';
import GameScene from '../scenes/GameScene';

const config = {
  type: Phaser.AUTO,
  parent: 'game',
  width: 416,
  height: 352,
  backgroundColor: '#2d2d2d',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: GameScene,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  pixelArt: true,
  antialias: false
};

export default config;