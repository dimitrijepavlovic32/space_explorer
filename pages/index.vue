<template>
  <div class="relative h-screen overflow-hidden bg-black text-slate-400">
    <!-- Game Canvas -->
    <ClientOnly>
      <GameCanvas class="h-full w-full" :gameStarted="gameStarted" />
    </ClientOnly>
    
    <!-- Game Score Overlay -->
    <div v-if="gameStarted" class="absolute top-0 right-0 p-12 z-30 text-xl flex uppercase text-[2rem] font-space-mono">
      <p class="tracking-[.5rem]">Points:</p>
      <p class="ml-4 tracking-[.5rem]">{{ formattedScore }}</p>
    </div>
    
    <!-- Title -->
    <div v-if="!gameStarted" class="absolute top-0 left-0 right-0 z-10 flex justify-center items-center py-2">
      <h1 class="text-[4rem] text-center font-space-mono tracking-[1rem] uppercase">
        Space Explorer
      </h1>
    </div>
    
    <div v-if="!gameStarted" class="absolute inset-0 flex flex-col justify-center items-center z-20">
      <!-- Start button -->
      <p @click="startGame" class="cursor-pointer text-[1.4rem] font-space-mono uppercase tracking-[.5rem] underline">
        Start Exploring
      </p>

      <!-- Controls -->
      <div class="mt-6 text-center p-4 border-slate-400 border rounded-lg">
        <p class="text-[1rem] font-space-mono uppercase tracking-[.3rem]">Left arrow - rotate left</p>
        <p class="text-[1rem] font-space-mono uppercase tracking-[.3rem]">Right arrow - rotate right</p>
        <p class="text-[1rem] font-space-mono uppercase tracking-[.3rem]">Up arrow - thrust</p>
        <p class="text-[1rem] font-space-mono uppercase tracking-[.3rem]">Spacebar - shoot</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ClientOnly } from '#components';
import { ref, computed } from 'vue';
import GameCanvas from '~/components/GameCanvas.vue';
import { useGameStore } from '~/stores/gameState';

const gameStarted = ref(false);
const gameStore = useGameStore();

const formattedScore = computed(() => {
  return gameStore.score.toString().padStart(6, '0');
});

function startGame() {
  gameStarted.value = true;
}
</script>

<style scoped>
</style>
