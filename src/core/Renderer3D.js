// Renderer3D.js

export class Renderer3D {
  constructor(container) {
    this.container = container;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.letterMeshes = new Map();
    this.gridSize = 1;
    this.gridSpacing = 1.2;
  }

  async init() {
    // Import Three.js dynamically
    const THREE = await import('three');

    // Create scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x1a1a2e);

    // Create camera
    this.camera = new THREE.PerspectiveCamera(
      75,
      this.container.clientWidth / this.container.clientHeight,
      0.1,
      1000,
    );
    this.camera.position.set(0, 5, 10);
    this.camera.lookAt(0, 0, 0);

    // Create renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.container.appendChild(this.renderer.domElement);

    // Add lighting
    this.setupLighting(THREE);

    // Add grid helper
    this.setupGrid(THREE);

    // Setup event listeners
    this.setupEventListeners();

    // Start render loop
    this.animate();
  }

  setupLighting(THREE) {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    this.scene.add(ambientLight);

    // Directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    this.scene.add(directionalLight);

    // Point light
    const pointLight = new THREE.PointLight(0x4ecdc4, 1, 100);
    pointLight.position.set(0, 10, 0);
    this.scene.add(pointLight);
  }

  setupGrid(THREE) {
    const gridHelper = new THREE.GridHelper(20, 20, 0x444444, 0x222222);
    gridHelper.position.y = -2;
    this.scene.add(gridHelper);
  }

  setupEventListeners() {
    window.addEventListener('resize', () => this.onWindowResize());
  }

  onWindowResize() {
    this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    this.renderer.render(this.scene, this.camera);
  }

  render(gameState) {
    this.clearLetters();
    this.drawGrid(gameState.grid);
    this.drawFallingLetter(gameState.fallingLetter);
  }

  clearLetters() {
    // Remove all letter meshes
    this.letterMeshes.forEach(mesh => {
      this.scene.remove(mesh);
    });
    this.letterMeshes.clear();
  }

  async drawGrid(grid) {
    const THREE = await import('three');

    for (let row = 0; row < grid.length; row++) {
      for (let col = 0; col < grid[row].length; col++) {
        if (grid[row][col]) {
          const letter = grid[row][col];
          const mesh = this.createLetterMesh(THREE, letter);

          const x = (col - grid[row].length / 2) * this.gridSpacing;
          const z = (row - grid.length / 2) * this.gridSpacing;
          mesh.position.set(x, 0, z);

          this.scene.add(mesh);
          this.letterMeshes.set(`${row}-${col}`, mesh);
        }
      }
    }
  }

  async drawFallingLetter(letter) {
    if (!letter) return;

    const THREE = await import('three');
    const mesh = this.createLetterMesh(THREE, letter.char);

    const x = (letter.x - 4) * this.gridSpacing;
    const y = letter.y * this.gridSpacing;
    const z = (letter.y - 4) * this.gridSpacing;
    mesh.position.set(x, y, z);

    // Add floating animation
    mesh.userData.originalY = y;
    mesh.userData.floatTime = 0;

    this.scene.add(mesh);
    this.letterMeshes.set('falling', mesh);
  }

  createLetterMesh(THREE, char) {
    // Create text geometry
    // const loader = new THREE.FontLoader();

    // For now, create a simple cube with text texture
    const geometry = new THREE.BoxGeometry(0.8, 0.8, 0.1);
    const material = new THREE.MeshPhongMaterial({
      color: 0x4ecdc4,
      transparent: true,
      opacity: 0.9,
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    // Add text label
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const context = canvas.getContext('2d');
    context.fillStyle = '#ffffff';
    context.font = 'bold 48px Arial';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(char, 32, 32);

    const texture = new THREE.CanvasTexture(canvas);
    const textMaterial = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
    });

    const textGeometry = new THREE.PlaneGeometry(0.6, 0.6);
    const textMesh = new THREE.Mesh(textGeometry, textMaterial);
    textMesh.position.z = 0.06;
    mesh.add(textMesh);

    return mesh;
  }

  updateFloatingAnimation(deltaTime) {
    this.letterMeshes.forEach(mesh => {
      if (mesh.userData.originalY !== undefined) {
        mesh.userData.floatTime += deltaTime;
        const floatOffset = Math.sin(mesh.userData.floatTime * 2) * 0.1;
        mesh.position.y = mesh.userData.originalY + floatOffset;
      }
    });
  }
}
