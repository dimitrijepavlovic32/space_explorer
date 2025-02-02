<template>
  <div class="absolute inset-0 flex flex-col justify-center items-center bg-black bg-opacity-75 z-20">
    <h2 class="text-white text-3xl mb-8 font-space-mono">Welcome to Space Explorer</h2>
    <button
      @click="startGame"
      class="px-6 py-3 bg-blue-600 text-white rounded-lg text-xl hover:bg-blue-700"
    >
      Start Game
    </button>
  </div>
</template>

<script setup>
const emit = defineEmits(['start']);

const startGame = () => {
  emit('start');
};
</script>
