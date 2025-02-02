export function useInput() {
  const keys = {};
  let canShoot = true;
  let shootCallback = null;

  function handleKeyDown(e) {
    keys[e.key] = true;
    // When space is pressed and shooting is allowed, call the shoot callback.
    if ((e.key === ' ' || e.key === 'Space') && canShoot) {
      if (typeof shootCallback === 'function') {
        shootCallback();
      }
      canShoot = false;
    }
  }
  function handleKeyUp(e) {
    keys[e.key] = false;
    if (e.key === ' ' || e.key === 'Space') {
      canShoot = true;
    }
  }
  function setShootCallback(callback) {
    shootCallback = callback;
  }
  function registerListeners() {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
  }
  function unregisterListeners() {
    window.removeEventListener('keydown', handleKeyDown);
    window.removeEventListener('keyup', handleKeyUp);
  }

  return {
    keys,
    registerListeners,
    unregisterListeners,
    setShootCallback,
  };
}
