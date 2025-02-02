// utils/ecs.js

// Utility: generate unique entity IDs
let entityCounter = 0;
export const createEntity = () => ++entityCounter;

// Add a component immutably
export const addComponent = (state, entityId, componentName, componentData) => ({
  ...state,
  entities: {
    ...state.entities,
    [entityId]: {
      ...(state.entities[entityId] || {}),
      [componentName]: componentData
    }
  }
});

// Input system: update entities based on input events
export const inputSystem = (state, inputEvents) => {
  const updatedEntities = Object.keys(state.entities).reduce((acc, entityId) => {
    const entity = state.entities[entityId];
    const eventsForEntity = inputEvents.filter(ev => ev.entityId === Number(entityId));
    const newEntity = eventsForEntity.reduce((ent, event) => {
      switch (event.type) {
        case 'MOVE':
          return {
            ...ent,
            position: {
              x: (ent.position?.x || 0) + event.payload.dx,
              y: (ent.position?.y || 0) + event.payload.dy,
              z: (ent.position?.z || 0) + (event.payload.dz || 0)
            }
          };
        default:
          return ent;
      }
    }, entity);
    return { ...acc, [entityId]: newEntity };
  }, {});
  return { ...state, entities: updatedEntities };
};

// Physics system: update positions based on velocity (and simple gravity if desired)
export const physicsSystem = (state) => {
  const updatedEntities = Object.keys(state.entities).reduce((acc, entityId) => {
    const entity = state.entities[entityId];
    if (entity.velocity && entity.position) {
      const newPosition = {
        x: entity.position.x + entity.velocity.x,
        y: entity.position.y + entity.velocity.y,
        z: entity.position.z + entity.velocity.z
      };
      // Optional: add a gravity-like effect (e.g., adjust y velocity)
      const newVelocity = {
        x: entity.velocity.x,
        y: entity.velocity.y + 0.98,
        z: entity.velocity.z
      };
      return {
        ...acc,
        [entityId]: {
          ...entity,
          position: newPosition,
          velocity: newVelocity
        }
      };
    }
    return { ...acc, [entityId]: entity };
  }, {});
  return { ...state, entities: updatedEntities };
};

// Enemy AI system: simple movement logic (e.g., enemies patrol or move slowly)
export const enemyAISystem = (state) => {
  const updatedEntities = Object.keys(state.entities).reduce((acc, entityId) => {
    const entity = state.entities[entityId];
    if (entity.isEnemy && entity.position) {
      // Example: move enemy slightly left
      return {
        ...acc,
        [entityId]: {
          ...entity,
          position: {
            ...entity.position,
            x: entity.position.x - 1
          }
        }
      };
    }
    return { ...acc, [entityId]: entity };
  }, {});
  return { ...state, entities: updatedEntities };
};

// Collision detection system: flag collisions between player and enemies
export const collisionSystem = (state) => {
  const updatedEntities = Object.keys(state.entities).reduce((acc, entityId) => {
    let entity = state.entities[entityId];
    if (entity.isPlayer && entity.position) {
      Object.values(state.entities).forEach(otherEntity => {
        if (otherEntity.isEnemy && otherEntity.position) {
          const dx = entity.position.x - otherEntity.position.x;
          const dy = entity.position.y - otherEntity.position.y;
          const dz = (entity.position.z || 0) - (otherEntity.position.z || 0);
          const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
          if (distance < 50) {  // Arbitrary collision threshold
            entity = { ...entity, collision: true };
          }
        }
      });
    }
    return { ...acc, [entityId]: entity };
  }, {});
  return { ...state, entities: updatedEntities };
};

// Rendering system: compute drawable objects for three.js
export const renderingSystem = (state) => {
  const drawables = Object.keys(state.entities)
    .map(entityId => {
      const entity = state.entities[entityId];
      return { ...entity, id: entityId };
    })
    .filter(entity => entity.position && entity.model);
  return { ...state, drawables };
};

// Compose systems into a single update function
export const updateGameState = (state, inputEvents) => {
  return [
    inputSystem,
    physicsSystem,
    enemyAISystem,
    collisionSystem,
    renderingSystem
  ].reduce(
    (currentState, system) => system(currentState, inputEvents),
    state
  );
};
