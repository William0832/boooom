<script setup>
import { onMounted } from 'vue'
import Phaser from 'phaser'
import gameConfig from './game/config/config'

onMounted(() => {
  new Phaser.Game(gameConfig)
})
</script>

<template>
  <div class="min-h-screen bg-gray-900 flex flex-col items-center justify-center">
    <!-- <h1 class="text-6xl font-bold text-yellow-500 mb-8 tracking-wider animate-pulse">
      <span class="text-red-500">B</span>
      <span class="text-orange-500">o</span>
      <span class="text-yellow-500">o</span>
      <span class="text-green-500">o</span>
      <span class="text-blue-500">o</span>
      <span class="text-indigo-500">o</span>
      <span class="text-purple-500">o</span>
      <span class="text-pink-500">m</span>
      <span class="text-red-500">!</span>
    </h1> -->
    <div class="game-container bg-gray-800 p-4 rounded-lg">
      <div class="game-info mb-4 flex flex-col gap-2">
        <!-- Game info will be rendered here by Phaser -->
      </div>
      <div id="game" class="border-4 border-gray-700 rounded-lg overflow-hidden shadow-lg"></div>
    </div>
    <div class="mt-6 text-gray-400 bg-gray-800 p-4 rounded-lg shadow-inner">
      <p class="font-medium text-center text-yellow-400 mb-2">Controls</p>
      <ul class="list-disc list-inside mt-2 space-y-1">
        <li>Arrow Keys: Move</li>
        <li>Space: Place Bomb</li>
      </ul>
    </div>
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
  width: 416px;
}

.game-info {
  min-height: 40px;
}
</style>
