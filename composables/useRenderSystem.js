import * as THREE from 'three';

export function updateRender(localState, threeEngine) {
  localState.drawables.forEach((drawable) => {
    if (!threeEngine.models[drawable.id]) {
      let geometry, material;
      if (drawable.model === 'player') {
        geometry = new THREE.PlaneGeometry(30, 45);
        material = threeEngine.rocketMaterial;
      }
      if (drawable.model === 'projectile') {
        geometry = new THREE.CircleGeometry(3, 16);
        material = new THREE.MeshBasicMaterial({ color: 0xffaa00 });
      }
      if (drawable.model === 'enemy') {
        geometry = new THREE.PlaneGeometry(30, 45);
        material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
      }
      if (drawable.model === 'explosion') {
        geometry = new THREE.CircleGeometry(15, 32);
        material = new THREE.MeshBasicMaterial({ color: 0xffaa00, transparent: true, opacity: 1 });
      }
      const mesh = new THREE.Mesh(geometry, material);
      threeEngine.scene.add(mesh);
      threeEngine.models[drawable.id] = mesh;
    }
    threeEngine.models[drawable.id].position.set(
      drawable.position.x,
      drawable.position.y,
      drawable.position.z || 0
    );
    if (drawable.rotation !== undefined) {
      threeEngine.models[drawable.id].rotation.z = drawable.rotation;
    }
  });
}
