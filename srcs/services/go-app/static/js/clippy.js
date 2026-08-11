window.ClippyAgent = {
    queue: [],
    say(text, options) {
        this.queue.push({ text, options });
        console.log("[Clippy non ancora inizializzato, messaggio accodato]:", text);
    },
    hide() {}
};

document.addEventListener("DOMContentLoaded", () => {
    if (typeof THREE === 'undefined') {
        console.error("Three.js non caricato correttamente.");
        return;
    }

    const container = document.getElementById('clippy-container');
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 5);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 1.8);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.8);
    dirLight.position.set(3, 5, 3);
    scene.add(dirLight);

    const clippyGroup = new THREE.Group();
    scene.add(clippyGroup);

    let clippyMesh = null;
    let mixer = null; 
    let actions = [];
    const clock = new THREE.Clock();

    let loader = new THREE.GLTFLoader();
    loader.load('/static/assets/clippy.glb', (gltf) => {
        clippyMesh = gltf.scene;

        clippyMesh.rotation.x = -Math.PI / 2;
        clippyMesh.rotation.y = Math.PI;
        clippyMesh.rotation.z = Math.PI;

        clippyMesh.updateMatrixWorld(true);

        const box = new THREE.Box3().setFromObject(clippyMesh);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());

        const targetSize = 1.9; 
        const scaleFactor = targetSize / Math.max(size.x, size.y, size.z);
        clippyMesh.scale.set(scaleFactor, scaleFactor, scaleFactor);

        clippyMesh.position.set(
            -center.x * scaleFactor, 
            -center.y * scaleFactor, 
            -center.z * scaleFactor
        ); 

        clippyGroup.add(clippyMesh);

        if (gltf.animations && gltf.animations.length > 0) {
            mixer = new THREE.AnimationMixer(clippyMesh);
            gltf.animations.forEach((clip, idx) => {
                actions[idx] = mixer.clipAction(clip);
            });
            if (actions[0]) actions[0].play();
        }

        // Recuperiamo i messaggi accumulati in coda prima del caricamento
        const pendingQueue = window.ClippyAgent.queue || [];

        window.ClippyAgent = {
            bubbleTimeout: null,
            say(text, options = {}) {
                const defaults = { tts: false, delay: 6000, actionIndex: null };
                const settings = { ...defaults, ...options };

                const bubble = document.getElementById('clippy-bubble');
                const bubbleText = document.getElementById('clippy-text');
                
                if (bubble && bubbleText) {
                    bubbleText.style.fontSize = "14px";
                    bubbleText.textContent = text;
                    
                    bubble.style.display = 'block';

                    let currentSize = 14; 
                    const minSize = 9;    
                    
                    while (bubbleText.scrollHeight > bubbleText.clientHeight && currentSize > minSize) {
                        currentSize -= 0.5;
                        bubbleText.style.fontSize = `${currentSize}px`;
                    }

                    if (this.bubbleTimeout) clearTimeout(this.bubbleTimeout);
                    this.bubbleTimeout = setTimeout(() => {
                        bubble.style.display = 'none';
                    }, settings.delay);
                }

                if (settings.tts && 'speechSynthesis' in window) {
                    window.speechSynthesis.cancel();
                    const utterance = new SpeechSynthesisUtterance(text);
                    utterance.lang = 'it-IT';
                    window.speechSynthesis.speak(utterance);
                }

                if (settings.actionIndex !== null && actions[settings.actionIndex] && mixer) {
                    mixer.stopAllAction();
                    actions[settings.actionIndex].reset().play();
                }
            },
            hide() {
                const bubble = document.getElementById('clippy-bubble');
                if (bubble) bubble.style.display = 'none';
                if (this.bubbleTimeout) clearTimeout(this.bubbleTimeout);
            }
        };

        // Elabora la coda accumulata all'avvio
        pendingQueue.forEach(item => {
            window.ClippyAgent.say(item.text, item.options);
        });

    }, undefined, (error) => {
        console.error("Errore nel caricamento del modello 3D di Clippy:", error);
    });

    let mouseX = 0;
    let mouseY = 0;

    window.addEventListener('mousemove', (event) => {
        const rect = container.getBoundingClientRect();
        const clippyCenterX = rect.left + rect.width / 2;
        const clippyCenterY = rect.top + rect.height / 2;

        const deltaX = event.clientX - clippyCenterX;
        const deltaY = event.clientY - clippyCenterY;

        mouseX = deltaX / (window.innerWidth / 2);
        mouseY = -deltaY / (window.innerHeight / 2);
    });

    function animate() {
        requestAnimationFrame(animate);

        const delta = clock.getDelta();
        if (mixer) mixer.update(delta);

        clippyGroup.rotation.y += (mouseX * 0.7 - clippyGroup.rotation.y) * 0.1;
        clippyGroup.rotation.x += (-mouseY * 0.4 - clippyGroup.rotation.x) * 0.1;

        renderer.render(scene, camera);
    }

    animate();

    window.addEventListener('resize', () => {
        const w = container.clientWidth;
        const h = container.clientHeight;
        renderer.setSize(w, h);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
    });
});