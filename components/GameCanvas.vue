<template>
  <div class="relative h-full w-full">
    <canvas class="h-full w-full" ref="threeCanvas" tabindex="0"></canvas>
    <!-- Game Over overlay with restart button -->
    <div
      v-if="gameStore.gameOver"
      class="absolute inset-0 flex flex-col justify-center items-center z-50 bg-black bg-opacity-75 text-slate-400 font-space-mono"
    >
      <h1 class="text-[6rem] mb-4 tracking-[1rem] uppercase">Game Over</h1>
      <p class="text-[2rem] mb-4 tracking-[.5rem] uppercase">Your score: {{ formattedScore }}</p>
      <button @click="restartGame" class="px-6 py-3 rounded text-[2rem] underline tracking-[.5rem] uppercase">
        Restart
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import { useGameStore } from '~/stores/gameState';
import { useThreeEngine } from '~/composables/useThreeEngine';
import { useInput } from '~/composables/useInput';
import { useGameEngine } from '~/composables/useGameEngine';

const props = defineProps({
  gameStarted: { type: Boolean, default: false }
});

const threeCanvas = ref(null);
const gameStore = useGameStore();

// Initialize composables.
const threeEngine = useThreeEngine();
const input = useInput();
const gameEngine = useGameEngine(threeEngine, input);

// Computed formatted score.
const formattedScore = computed(() => {
  return gameStore.score.toString().padStart(6, '0');
});

onMounted(() => {
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;
  
  // Initialize Three.js.
  threeEngine.initThree(threeCanvas.value, screenWidth, screenHeight);
  threeEngine.createStarfieldBackground(screenWidth, screenHeight);

  // Set up player.
  gameEngine.setupPlayer();

  // Register input listeners.
  input.registerListeners();

  // Start enemy spawn scheduling.
  gameEngine.startEnemySpawnInterval();

  if (props.gameStarted) {
    gameEngine.startGameLoop();
  }
});

// Watch for game start prop changes.
watch(
  () => props.gameStarted,
  (newVal) => {
    if (newVal) gameEngine.startGameLoop();
  }
);

const restartGame = gameEngine.restartGame;
</script>

<style scoped>
/*  */
</style>
