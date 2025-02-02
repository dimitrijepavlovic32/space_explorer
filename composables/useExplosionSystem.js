import { createEntity, addComponent } from '~/utils/ecs';

export function createExplosion(localState, x, y, constants) {
  const explosionId = createEntity();
  localState = addComponent(localState, explosionId, 'position', { x, y, z: 0 });
  localState = addComponent(localState, explosionId, 'lifetime', constants.explosionLifetimeInitial);
  localState = addComponent(localState, explosionId, 'model', 'explosion');
  localState.drawables.push({
    id: explosionId,
    position: { x, y, z: 0 },
    rotation: 0,
    model: 'explosion'
  });
  return localState;
}

export function updateExplosions(localState, constants, threeEngine) {
  for (const id in localState.entities) {
    if (localState.entities[id].model === 'explosion') {
      localState.entities[id].lifetime -= 0.02;
      if (localState.entities[id].lifetime <= 0) {
        if (threeEngine.models[id]) {
          threeEngine.models[id].geometry.dispose();
          threeEngine.models[id].material.dispose();
          threeEngine.scene.remove(threeEngine.models[id]);
          delete threeEngine.models[id];
        }
        delete localState.entities[id];
        localState.drawables = localState.drawables.filter(d => d.id !== id);
      } else {
        if (threeEngine.models[id]) {
          const alpha = localState.entities[id].lifetime / constants.explosionLifetimeInitial;
          threeEngine.models[id].material.opacity = alpha;
        }
      }
    }
  }
}
