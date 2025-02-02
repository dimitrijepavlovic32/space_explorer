import { createEntity, addComponent } from '~/utils/ecs';

export function shootProjectile(localState, constants) {
  const player = localState.entities[localState.playerId];
  if (!player) return localState;
  const projectileId = createEntity();
  const tipOffset = 7.5;
  const tipX = player.position.x + Math.cos((player.rotation || 0) + Math.PI / 2) * tipOffset;
  const tipY = player.position.y + Math.sin((player.rotation || 0) + Math.PI / 2) * tipOffset;
  localState = addComponent(localState, projectileId, 'position', { x: tipX, y: tipY, z: 0 });
  localState = addComponent(localState, projectileId, 'rotation', player.rotation || 0);
  const projectileSpeed = 5;
  localState = addComponent(localState, projectileId, 'velocity', {
    x: Math.cos((player.rotation || 0) + Math.PI / 2) * projectileSpeed,
    y: Math.sin((player.rotation || 0) + Math.PI / 2) * projectileSpeed,
    z: 0
  });
  localState = addComponent(localState, projectileId, 'damage', 10);
  localState = addComponent(localState, projectileId, 'model', 'projectile');
  localState.drawables.push({
    id: projectileId,
    position: { x: tipX, y: tipY, z: 0 },
    rotation: player.rotation || 0,
    model: 'projectile'
  });
  return localState;
}

export function updateProjectiles(localState, constants, threeEngine) {
  const margin = 20;
  for (const id in localState.entities) {
    if (localState.entities[id].model === 'projectile') {
      const proj = localState.entities[id];
      proj.position.x += proj.velocity.x;
      proj.position.y += proj.velocity.y;
      const pos = proj.position;
      if (
        pos.x < -margin || pos.x > constants.screenWidth + margin ||
        pos.y < -margin || pos.y > constants.screenHeight + margin
      ) {
        if (threeEngine.models[id]) {
          threeEngine.models[id].geometry.dispose();
          threeEngine.models[id].material.dispose();
          threeEngine.scene.remove(threeEngine.models[id]);
          delete threeEngine.models[id];
        }
        delete localState.entities[id];
        localState.drawables = localState.drawables.filter(d => d.id !== id);
      }
    }
  }
}
