const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

//Creating orbit for every planet
function createOrbit(distance) {
  const segments = 100;
  const geometry = new THREE.BufferGeometry();
  const points = [];

  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    points.push(
      new THREE.Vector3(
        distance * Math.cos(angle),
        0,
        distance * Math.sin(angle)
      )
    );
  }

  geometry.setFromPoints(points);
  const material = new THREE.LineDashedMaterial({ color: 0x444444 }); // or 0xffffff
  const orbit = new THREE.LineLoop(geometry, material);
  return orbit;
}

//Creating SUN
const sun = new THREE.Mesh(
  new THREE.SphereGeometry(2, 32, 32),
  new THREE.MeshPhongMaterial({
    emissive: 0xffff00,
    emissiveIntensity: 1.5,
    shininess: 100,
    specular: 0xffee88,
    color: 0xffff00,
  })
);
scene.add(sun);

//Planet data structure
const planetNames = [
  "Mercury",
  "Venus",
  "Earth",
  "Mars",
  "Jupiter",
  "Saturn",
  "uranus",
  "Neptune",
];
const planets = [];
//creating Planet
const createPlanet = (name, radius, distance, color, speed) => {
  const planet = new THREE.Mesh(
    new THREE.SphereGeometry(radius, 32, 32),
    new THREE.MeshStandardMaterial({ color })
  );
  planet.userData = { name, distance, angle: 0, speed };
  const orbit = new THREE.Object3D();
  planet.position.x = distance;
  orbit.add(planet);
  scene.add(orbit);
  // Add orbit ring
  const orbitRing = createOrbit(distance);
  scene.add(orbitRing);
  planets.push(planet);
  return planet;
};

createPlanet("Mercury", 0.5, 4, 0x909090, 0.013); // Grey
createPlanet("Venus", 0.8, 6, 0xffcc99, 0.01); // Pale Orange
createPlanet("Earth", 0.85, 8, 0x2a60ff, 0.009); // Blue
createPlanet("Mars", 0.45, 10, 0xff4500, 0.007); // Red-Orange
createPlanet("Jupiter", 0.55, 11, 0xd2b48c, 0.006); // Tan
createPlanet("Saturn", 0.65, 13, 0xf5deb3, 0.003); // Wheat
createPlanet("Uranus", 0.75, 15, 0xadd8e6, 0.002); // Light Blue
createPlanet("Neptune", 0.85, 16, 0x4169e1, 0.001); // Royal Blue

const light = new THREE.PointLight(0xffffff, 2.5, 300);
const ambientLight = new THREE.AmbientLight(0xffffff, 0.3); // subtle global light
scene.add(ambientLight);
light.position.set(0, 0, 0);
scene.add(light);
camera.position.z = 20;

// Starfield background . Giving Stars in background to look like space
const starGeometry = new THREE.BufferGeometry();
const starCount = 5000;
const positions = [];
for (let i = 0; i < starCount; i++) {
  positions.push((Math.random() - 0.5) * 1000);
  positions.push((Math.random() - 0.5) * 1000);
  positions.push((Math.random() - 0.5) * 1000);
}
starGeometry.setAttribute(
  "position",
  new THREE.Float32BufferAttribute(positions, 3)
);
const starMaterial = new THREE.PointsMaterial({ color: 0xffffff });
const starField = new THREE.Points(starGeometry, starMaterial);
scene.add(starField);

// Planet speed sliders
const planetSliderContainer = document.getElementById("planet-sliders");
planets.forEach((planet, i) => {
  const label = document.createElement("label");
  label.innerHTML = `${planet.userData.name}: <input type="range" min="0" max="0.05" step="0.001" value="${planet.userData.speed}" id="planet-speed-${i}">`;
  planetSliderContainer.appendChild(label);

  document
    .getElementById(`planet-speed-${i}`)
    .addEventListener("input", (e) => {
      planet.userData.speed = parseFloat(e.target.value);
    });
});

// Tooltip
const tooltip = document.getElementById("tooltip");

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
window.addEventListener("mousemove", (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
});

// Dark/Light mode
let dark = true;
document.getElementById("toggle-mode").onclick = () => {
  dark = !dark;
  document.body.style.background = dark
    ? "radial-gradient(#000, #111)"
    : "#eee";
  document.body.style.color = dark ? "white" : "black";
};

// Pause/Resume
let paused = false;
document.getElementById("togglePause").onclick = () => (paused = !paused);

// Global speed control
let speedMultiplier = 1;
document.getElementById("speedRange").addEventListener("input", (e) => {
  speedMultiplier = parseFloat(e.target.value);
});

//Animation function
function animate() {
  requestAnimationFrame(animate);
  if (!paused) {
    sun.rotation.y += 0.001;
    
    planets.forEach((planet) => {
      planet.userData.angle += planet.userData.speed * speedMultiplier;
      const angle = planet.userData.angle;
      const dist = planet.userData.distance;
      planet.position.x = dist * Math.cos(angle);
      planet.position.z = dist * Math.sin(angle);
    });
  }

 // Tooltips If the mouse is over a planet, shows the planet’s name in a tooltip.
 // Uses raycasting to detect when the mouse is hovering over a planet.
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(planets);
  if (intersects.length > 0) {
    const name = intersects[0].object.userData.name;
    tooltip.innerHTML = name;
    tooltip.style.display = "block";
    tooltip.style.left = event.clientX + 10 + "px";
    tooltip.style.top = event.clientY + 10 + "px";
  } else {
    tooltip.style.display = "none";
  }
  renderer.render(scene, camera); //renders the scene from the camera’s perspective on each frame.
}

animate();