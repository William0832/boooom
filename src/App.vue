<script>
import { defineComponent } from 'vue';
import Phaser from 'phaser';
import GameScene from './game/scenes/GameScene';

export default defineComponent({
  name: 'App',
  data() {
    return {
      game: null,
      inputName: '',
      playerName: '',
      nameError: '',
      isValidName: false
    };
  },
  methods: {
    validateName() {
      // 只要有输入就允许提交
      this.isValidName = this.inputName.trim().length > 0;
      
      // 如果包含非字母数字字符，显示警告但不阻止提交
      if (!/^[a-zA-Z0-9]*$/.test(this.inputName)) {
        this.nameError = 'Warning: Only letters and numbers will be kept';
      } else {
        this.nameError = '';
      }
    },
    startGame() {
      // 移除任何非字母数字字符并取第一个字符
      const cleanName = this.inputName.replace(/[^a-zA-Z0-9]/g, '');
      const firstChar = cleanName.charAt(0).toUpperCase() || 'A'; // 只取第一个字符并转为大写
      this.playerName = firstChar;
      console.log('%c Line:34 debug 🍡 this.playerName', 'color:#ffdd4d', this.playerName)
      
      // 在创建游戏实例之前设置玩家名称
      GameScene.prototype.playerName = this.playerName;
      
      // Initialize game after name is set
      this.$nextTick(() => {
        const config = {
          type: Phaser.AUTO,
          width: 416,
          height: 352,
          parent: 'game',
          physics: {
            default: 'arcade',
            arcade: {
              gravity: { y: 0 },
              debug: false
            }
          },
          scene: GameScene,
        };

        this.game = new Phaser.Game(config);
      });
    },
    destroyGame() {
      if (this.game) {
        this.game.destroy(true);
        this.game = null;
      }
    }
  },
  beforeUnmount() {
    this.destroyGame();
  }
});
</script>

<template>
  <div class="w-full h-screen bg-gray-900 flex items-center justify-center">
    <!-- 名称输入界面 -->
    <div v-if="!playerName" class="bg-gray-800 p-8 rounded-lg shadow-lg w-96 max-w-full mx-4">
      <h2 class="text-3xl text-white mb-6 text-center font-bold">
        <span class="text-red-500">B</span>
        <span class="text-orange-500">o</span>
        <span class="text-yellow-500">o</span>
        <span class="text-green-500">o</span>
        <span class="text-blue-500">o</span>
        <span class="text-indigo-500">o</span>
        <span class="text-purple-500">o</span>
        <span class="text-pink-500">m</span>
        <span class="text-red-500">!</span>
      </h2>
      <div class="space-y-6">
        <div>
          <label class="block text-gray-300 text-sm font-medium mb-2">
            Enter Your Name
          </label>
          <input
            type="text"
            v-model="inputName"
            @input="validateName"
            placeholder="Letters and numbers only"
            class="w-full px-4 py-2 rounded bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:outline-none transition-colors duration-200"
            maxlength="10"
          />
          <p v-if="nameError" class="mt-2 text-red-500 text-sm">{{ nameError }}</p>
        </div>
        <button
          @click="startGame"
          :disabled="!isValidName"
          class="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
        >
          Start Game
        </button>
        <div class="mt-4 text-gray-400 text-sm">
          <p class="text-center mb-2 text-gray-300">Controls:</p>
          <ul class="list-disc list-inside space-y-1">
            <li>Arrow Keys: Move</li>
            <li>Space: Place Bomb</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- 游戏界面 -->
    <template v-else>
      <div class="game-container">
        <div id="game"></div>
        <div class="game-info"></div>
      </div>
    </template>
  </div>
</template>

<style>
@import './style.css';

@keyframes glow {
  0%, 100% { text-shadow: 0 0 10px rgba(255, 255, 0, 0.8); }
  50% { text-shadow: 0 0 20px rgba(255, 255, 0, 0.4); }
}

h1 {
  animation: glow 2s ease-in-out infinite;
}

.game-container {
  position: relative;
  display: flex;
  gap: 20px;
}

.game-info {
  padding: 1rem;
  background-color: #2d3748;
  border-radius: 8px;
  min-width: 150px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

#game {
  border: 2px solid #4a5568;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

canvas {
  display: block;
  margin: 0 auto;
  image-rendering: pixelated;
  image-rendering: crisp-edges;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.text-3xl span {
  display: inline-block;
  animation: pulse 2s infinite;
  animation-delay: calc(var(--i) * 0.1s);
}
</style>
