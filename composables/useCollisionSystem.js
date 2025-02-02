export function handleProjectileEnemyCollisions(localState, constants, threeEngine, gameStore, createExplosionCallback) {
  const collisionThreshold = 15;
  const idsToRemove = [];
  for (const projId in localState.entities) {
    if (localState.entities[projId].model === 'projectile') {
      const proj = localState.entities[projId];
      for (const enemyId in localState.entities) {
        if (localState.entities[enemyId].model === 'enemy') {
          const enemy = localState.entities[enemyId];
          const dx = proj.position.x - enemy.position.x;
          const dy = proj.position.y - enemy.position.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < collisionThreshold) {
            // Create explosion at the enemy's position.
            localState = createExplosionCallback(localState, enemy.position.x, enemy.position.y, constants);
            idsToRemove.push(projId, enemyId);
            gameStore.addScore(100);
            break;
          }
        }
      }
    }
  }
  idsToRemove.forEach(id => {
    if (threeEngine.models[id]) {
      threeEngine.models[id].geometry.dispose();
      threeEngine.models[id].material.dispose();
      threeEngine.scene.remove(threeEngine.models[id]);
      delete threeEngine.models[id];
    }
    delete localState.entities[id];
    localState.drawables = localState.drawables.filter(d => d.id !== id);
  });
  return localState;
}

export function handlePlayerCollisions(localState, constants, threeEngine, gameStore, createExplosionCallback) {
  const playerCollisionThreshold = 20;
  if (localState.playerId && localState.entities[localState.playerId]) {
    const player = localState.entities[localState.playerId];
    for (const id in localState.entities) {
      if (localState.entities[id].model === 'enemy') {
        const enemy = localState.entities[id];
        const dx = enemy.position.x - player.position.x;
        const dy = enemy.position.y - player.position.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < playerCollisionThreshold) {
          localState = createExplosionCallback(localState, player.position.x, player.position.y, constants);
          if (threeEngine.models[localState.playerId]) {
            threeEngine.models[localState.playerId].geometry.dispose();
            threeEngine.models[localState.playerId].material.dispose();
            threeEngine.scene.remove(threeEngine.models[localState.playerId]);
            delete threeEngine.models[localState.playerId];
          }
          delete localState.entities[localState.playerId];
          localState.drawables = localState.drawables.filter(d => d.id !== localState.playerId);
          gameStore.setGameOver(true);
          break;
        }
      }
    }
  }
  return localState;
}
