import * as THREE from 'three';

export function useThreeEngine() {
  // Three.js essentials
  const scene = new THREE.Scene();
  let camera;
  let renderer;
  let starMaterial;
  const models = {};

  // --- PLAYER SHADER MATERIAL ---
  const rocketMaterial = new THREE.ShaderMaterial({
    uniforms: {},
    vertexShader: `
      varying vec2 vUv;
      void main(){
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      varying vec2 vUv;
      float rocketShape(vec2 uv){
        vec2 p = uv - 0.5;
        float body = step(abs(p.x), 0.15) * step(-0.3, p.y) * step(p.y, 0.2);
        float tipLimit = mix(0.15, 0.0, (p.y - 0.2)/0.3);
        float tip = step(abs(p.x), tipLimit) * step(0.2, p.y) * step(p.y, 0.5);
        return max(body, tip);
      }
      void main(){
        float s = rocketShape(vUv);
        vec3 color = vec3(0.8, 0.2, 0.2) * s;
        gl_FragColor = vec4(color, s);
      }
    `,
    transparent: true
  });

  function initThree(canvas, screenWidth, screenHeight) {
    camera = new THREE.OrthographicCamera(0, screenWidth, screenHeight, 0, -1000, 1000);
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setSize(screenWidth, screenHeight);
  }

  // Create the starfield background.
  function createStarfieldBackground(screenWidth, screenHeight) {
    const planeGeometry = new THREE.PlaneGeometry(screenWidth, screenHeight);
    const seed = Math.random() * 1000.0;
    starMaterial = new THREE.ShaderMaterial({
      uniforms: { time: { value: 0.0 }, seed: { value: seed } },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec2 vUv;
        uniform float time;
        uniform float seed;
        float random(vec2 p) {
          return fract(sin(dot(p, vec2(12.9898,78.233)) + seed) * 43758.5453);
        }
        void main() {
          vec2 st = vUv * 100.0;
          st += vec2(time * 0.002, time * 0.002);
          float r = random(floor(st));
          float baseStar = step(0.98, r);
          vec2 cellUV = fract(st) - 0.5;
          float brightness = smoothstep(0.98, 1.0, r);
          float d = abs(cellUV.x) + abs(cellUV.y);
          float maxSize = 0.35, minSize = 0.15;
          float starSize = mix(maxSize, minSize, 1.0 - brightness);
          float shape = 1.0 - smoothstep(starSize, starSize + 0.01, d);
          float star = baseStar * shape * brightness;
          vec3 color = vec3(0.0) + star;
          gl_FragColor = vec4(color, 1.0);
        }
      `,
      transparent: false
    });
    const backgroundPlane = new THREE.Mesh(planeGeometry, starMaterial);
    backgroundPlane.position.set(screenWidth / 2, screenHeight / 2, -500);
    scene.add(backgroundPlane);
  }

  // Allow updating the starfield time uniform.
  function updateStarfieldTime(time) {
    if (starMaterial) {
      starMaterial.uniforms.time.value = time;
    }
  }

  function render() {
    if (renderer && camera) {
      renderer.render(scene, camera);
    }
  }

  return {
    scene,
    get camera() {
      return camera;
    },
    get renderer() {
      return renderer;
    },
    models,
    rocketMaterial,
    initThree,
    createStarfieldBackground,
    updateStarfieldTime,
    render
  };
}
