import { createEntity, addComponent } from '~/utils/ecs';

export function spawnEnemy(localState, constants) {
  const enemyId = createEntity();
  const margin = 50;
  const edge = Math.floor(Math.random() * 4);
  let enemyX, enemyY;
  if (edge === 0) { // left edge
    enemyX = -margin;
    enemyY = Math.random() * constants.screenHeight;
  } else if (edge === 1) { // right edge
    enemyX = constants.screenWidth + margin;
    enemyY = Math.random() * constants.screenHeight;
  } else if (edge === 2) { // top edge
    enemyX = Math.random() * constants.screenWidth;
    enemyY = -margin;
  } else { // bottom edge
    enemyX = Math.random() * constants.screenWidth;
    enemyY = constants.screenHeight + margin;
  }
  localState = addComponent(localState, enemyId, 'position', { x: enemyX, y: enemyY, z: 0 });
  localState = addComponent(localState, enemyId, 'rotation', 0);
  localState = addComponent(localState, enemyId, 'velocity', { x: 0, y: 0, z: 0 });
  localState = addComponent(localState, enemyId, 'model', 'enemy');
  localState.drawables.push({
    id: enemyId,
    position: { x: enemyX, y: enemyY, z: 0 },
    rotation: 0,
    model: 'enemy'
  });
  return localState;
}

export function updateEnemies(localState, constants) {
  const playerExists = !!localState.playerId && !!localState.entities[localState.playerId];
  for (const id in localState.entities) {
    if (localState.entities[id].model === 'enemy') {
      const enemy = localState.entities[id];
      if (playerExists) {
        const player = localState.entities[localState.playerId];
        const dx = player.position.x - enemy.position.x;
        const dy = player.position.y - enemy.position.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        enemy.velocity.x = (dx / dist) * constants.enemyChaseSpeed;
        enemy.velocity.y = (dy / dist) * constants.enemyChaseSpeed;
        enemy.rotation = Math.atan2(dy, dx) - Math.PI / 2;
      }
      enemy.position.x += enemy.velocity.x;
      enemy.position.y += enemy.velocity.y;
    }
  }
}
