// Basic Three.js setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xffffff, 1);
pointLight.position.set(10, 10, 10);
pointLight.castShadow = true;
scene.add(pointLight);

// Ground plane
const groundGeometry = new THREE.PlaneGeometry(100, 100);
const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

// Grid helper
const gridHelper = new THREE.GridHelper(100, 100);
scene.add(gridHelper);

// Background
const starGeometry = new THREE.Geometry();
for (let i = 0; i < 10000; i++) {
    const star = new THREE.Vector3(
        THREE.MathUtils.randFloatSpread(2000),
        THREE.MathUtils.randFloatSpread(2000),
        THREE.MathUtils.randFloatSpread(2000)
    );
    starGeometry.vertices.push(star);
}
const starMaterial = new THREE.PointsMaterial({ color: 0x888888 });
const starField = new THREE.Points(starGeometry, starMaterial);
scene.add(starField);

// Project nodes
const projectNodes = [];
const projectData = {};
const colors = [0xff00ff, 0x00ffff, 0xee82ee]; // neon hot pink, neon powder blue, neon lavender

const createProjectNode = (name, description, x, y, z) => {
    const geometry = new THREE.SphereGeometry(1, 32, 32);
    const material = new THREE.MeshStandardMaterial({ color: colors[Math.floor(Math.random() * colors.length)] });
    const node = new THREE.Mesh(geometry, material);
    node.position.set(x, y, z);
    node.name = name;
    node.description = description;
    node.castShadow = true;
    node.receiveShadow = true;
    projectData[name] = { description, tasks: [] };
    scene.add(node);
    projectNodes.push(node);
};

// Add some project nodes for demonstration
createProjectNode('Project 1', 'Description of Project 1', 0, 0, 0);
createProjectNode('Project 2', 'Description of Project 2', 5, 5, 5);

// Drag-and-drop functionality
let selectedNode = null;
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

const onMouseMove = (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
};

const onMouseDown = (event) => {
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(projectNodes);
    if (intersects.length > 0) {
        selectedNode = intersects[0].object;
        showProjectDetails(selectedNode);
    }
};

const onMouseUp = () => {
    selectedNode = null;
};

const onDocumentMouseMove = (event) => {
    if (selectedNode) {
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObject(ground, true);
        if (intersects.length > 0) {
            selectedNode.position.copy(intersects[0].point);
        }
    }
};

window.addEventListener('mousemove', onMouseMove);
window.addEventListener('mousedown', onMouseDown);
window.addEventListener('mouseup', onMouseUp);
window.addEventListener('mousemove', onDocumentMouseMove);

// Voice commands using native Web Speech API
const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.continuous = true;
recognition.onresult = (event) => {
    const command = event.results[event.results.length - 1][0].transcript.trim().toLowerCase();
    if (command.startsWith('add project')) {
        const name = command.replace('add project', '').trim();
        createProjectNode(name, 'No description yet', Math.random() * 10, Math.random() * 10, Math.random() * 10);
    }
};
recognition.start();

// GUI controls
const gui = new dat.GUI({ autoPlace: false });
document.getElementById('gui').appendChild(gui.domElement);

const controls = {
    color: '#ffffff',
    opacity: 1
};

gui.addColor(controls, 'color').onChange((value) => {
    if (selectedNode) {
        selectedNode.material.color.set(value);
    }
});

gui.add(controls, 'opacity', 0, 1).onChange((value) => {
    if (selectedNode) {
        selectedNode.material.opacity = value;
        selectedNode.material.transparent = value < 1;
    }
});

// Project details panel
const showProjectDetails = (node) => {
    document.getElementById('projectName').innerText = node.name;
    document.getElementById('projectDescription').innerText = node.description;
    const taskList = document.getElementById('taskList');
    taskList.innerHTML = '';
    projectData[node.name].tasks.forEach(task => {
        const taskItem = document.createElement('li');
        taskItem.innerText = task;
        taskList.appendChild(taskItem);
    });
    document.getElementById('projectDetails').style.display = 'block';
};

const addTask = () => {
    const taskName = document.getElementById('newTaskName').value;
    if (taskName && selectedNode) {
        projectData[selectedNode.name].tasks.push(taskName);
        const taskItem = document.createElement('li');
        taskItem.innerText = taskName;
        document.getElementById('taskList').appendChild(taskItem);
        document.getElementById('newTaskName').value = '';
    }
};

// Animation loop
const animate = () => {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
};
animate();

// Adjust camera position
camera.position.z = 10;
