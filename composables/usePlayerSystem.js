export function updatePlayer(localState, input, constants) {
  if (!localState.playerId || !localState.entities[localState.playerId]) return;
  const player = localState.entities[localState.playerId];

  // --- INPUT: Rotation & Thrust ---
  if (input.keys['ArrowLeft']) {
    player.rotation += constants.rotationSpeedVal;
  }
  if (input.keys['ArrowRight']) {
    player.rotation -= constants.rotationSpeedVal;
  }
  if (input.keys['ArrowUp']) {
    const currentRotation = (player.rotation || 0) + Math.PI / 2;
    player.velocity.x += Math.cos(currentRotation) * constants.thrust;
    player.velocity.y += Math.sin(currentRotation) * constants.thrust;
  }

  // --- APPLY DAMPING & SPEED LIMIT ---
  const vx = player.velocity.x;
  const vy = player.velocity.y;
  player.velocity.x *= constants.damping;
  player.velocity.y *= constants.damping;
  const speed = Math.sqrt(vx * vx + vy * vy);
  if (speed > constants.playerMaxSpeed) {
    const scale = constants.playerMaxSpeed / speed;
    player.velocity.x *= scale;
    player.velocity.y *= scale;
  }

  // --- UPDATE POSITION ---
  player.position.x += player.velocity.x;
  player.position.y += player.velocity.y;

  // --- KEEP PLAYER INSIDE WINDOW BOUNDS ---
  if (player.position.x > constants.xBoundRight) {
    player.position.x = constants.xBoundRight;
    player.velocity.x *= -1;
  }
  if (player.position.x < constants.xBoundLeft) {
    player.position.x = constants.xBoundLeft;
    player.velocity.x *= -1;
  }
  if (player.position.y > constants.yBoundBottom) {
    player.position.y = constants.yBoundBottom;
    player.velocity.y *= -1;
  }
  if (player.position.y < constants.yBoundTop) {
    player.position.y = constants.yBoundTop;
    player.velocity.y *= -1;
  }
}
