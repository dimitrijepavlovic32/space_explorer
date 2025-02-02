import { useGameStore } from '~/stores/gameState';
import { createEntity, addComponent } from '~/utils/ecs';
import { updatePlayer } from '~/composables/usePlayerSystem';
import { spawnEnemy, updateEnemies } from '~/composables/useEnemySystem';
import { shootProjectile, updateProjectiles } from '~/composables/useProjectileSystem';
import { handleProjectileEnemyCollisions, handlePlayerCollisions } from '~/composables/useCollisionSystem';
import { createExplosion, updateExplosions } from '~/composables/useExplosionSystem';
import { updateRender } from '~/composables/useRenderSystem';

export function useGameEngine(threeEngine, input) {
  const gameStore = useGameStore();

  // --- ECS STATE & GAME VARIABLES ---
  let localState = { entities: {}, drawables: [] };
  const maxEnemies = 6;
  let enemySpawnIntervalId = null;
  let animationFrameId = null;

  // --- CONSTANTS ---
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;
  const constants = {
    screenWidth,
    screenHeight,
    xBoundLeft: 0,
    xBoundRight: screenWidth,
    yBoundTop: 0,
    yBoundBottom: screenHeight,
    explosionLifetimeInitial: 0.5,
    thrust: 0.25,
    damping: 0.98,
    playerMaxSpeed: 5,
    rotationSpeedVal: 0.07,
    enemyChaseSpeed: 0.8,
    shieldRadius: 40, // IDEA, not yet implemented
  };

  // --- SETUP PLAYER ---
  function setupPlayer() {
    const playerId = createEntity();
    localState = addComponent(localState, playerId, 'position', { x: screenWidth / 2, y: screenHeight / 2, z: 0 });
    localState = addComponent(localState, playerId, 'rotation', 0);
    localState = addComponent(localState, playerId, 'velocity', { x: 0, y: 0, z: 0 });
    localState = addComponent(localState, playerId, 'model', 'player');
    localState.drawables.push({
      id: playerId,
      position: { x: screenWidth / 2, y: screenHeight / 2, z: 0 },
      rotation: 0,
      model: 'player'
    });
    localState.playerId = playerId;
  }

  // --- ENEMY SPAWN SYSTEM ---
  function startEnemySpawnInterval() {
    if (enemySpawnIntervalId !== null) {
      clearInterval(enemySpawnIntervalId);
    }
    enemySpawnIntervalId = setInterval(() => {
      const currentEnemyCount = Object.keys(localState.entities)
        .filter(id => localState.entities[id].model === 'enemy').length;
      // Spawn enemies until we reach maxEnemies.
      for (let i = currentEnemyCount; i < maxEnemies; i++) {
        localState = spawnEnemy(localState, constants);
      }
    }, 500);
  }

  // --- PROJECTILE SYSTEM ---
  input.setShootCallback(() => {
    localState = shootProjectile(localState, constants);
  });

  // --- GAME LOOP ---
  const gameLoop = () => {
    // Update background shader time.
    threeEngine.updateStarfieldTime(performance.now() / 1000.0);

    // --- UPDATE SYSTEMS ---
    updatePlayer(localState, input, constants);
    updateProjectiles(localState, constants, threeEngine);
    updateEnemies(localState, constants);
    localState = handleProjectileEnemyCollisions(
      localState,
      constants,
      threeEngine,
      gameStore,
      createExplosion
    );
    localState = handlePlayerCollisions(
      localState,
      constants,
      threeEngine,
      gameStore,
      createExplosion
    );
    updateExplosions(localState, constants, threeEngine);

    // --- SYNC DRAWABLES WITH ECS STATE ---
    localState.drawables = localState.drawables
      .filter(drawable => localState.entities[drawable.id] !== undefined)
      .map(drawable => ({
        ...drawable,
        position: { ...localState.entities[drawable.id].position },
        rotation: localState.entities[drawable.id].rotation
      }));
    gameStore.updateState(localState);

    // --- RENDER ---
    updateRender(localState, threeEngine);
    threeEngine.render();
    animationFrameId = requestAnimationFrame(gameLoop);
  };

  function startGameLoop() {
    animationFrameId = requestAnimationFrame(gameLoop);
  }

  // --- RESTART FUNCTION ---
  function restartGame() {
    gameStore.resetScore();

    if (enemySpawnIntervalId !== null) {
      clearInterval(enemySpawnIntervalId);
      enemySpawnIntervalId = null;
    }
    if (animationFrameId !== null) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
    // Reset the game over state.
    gameStore.setGameOver(false);
    
    // Remove all meshes from the scene.
    for (const id in threeEngine.models) {
      threeEngine.models[id].geometry.dispose();
      threeEngine.models[id].material.dispose();
      threeEngine.scene.remove(threeEngine.models[id]);
    }
    for (const id in threeEngine.models) {
      delete threeEngine.models[id];
    }
    // Reset ECS state.
    localState = { entities: {}, drawables: [] };
    // Reinitialize player and background.
    setupPlayer();
    threeEngine.createStarfieldBackground(screenWidth, screenHeight);
    startEnemySpawnInterval();
    startGameLoop();
  }

  return {
    startGameLoop,
    restartGame,
    setupPlayer,
    startEnemySpawnInterval,
  };
}
