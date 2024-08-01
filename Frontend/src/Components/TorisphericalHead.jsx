import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import './TorisphericalHead.css';

const TorisphericalHead = () => {
    const [dimensions, setDimensions] = useState({
        sheetThickness: 3, // mm
        outerDiameter: 500, // mm
        brimHeight: 200 // mm
    });
    const [volume, setVolume] = useState(null);

    useEffect(() => {
        renderTorisphericalHead();
    }, [dimensions]);

    const handleDimensionChange = (event) => {
        const { name, value } = event.target;
        setDimensions(prevDimensions => ({ ...prevDimensions, [name]: parseFloat(value) }));
    };

    const calculateVolume = async () => {
        try {
            const dimensionsInMeters = {
                outerDiameter: dimensions.outerDiameter / 1000,
                sheetThickness: dimensions.sheetThickness / 1000,
                brimHeight: dimensions.brimHeight / 1000
            };

            const response = await axios.post('http://localhost:5000/api/calculate-volume', {
                shape: 'torispherical-head',
                dimensions: dimensionsInMeters
            });
            setVolume(response.data.volume);
        } catch (error) {
            console.error('Error calculating volume:', error);
        }
    };

    useEffect(() => {
        calculateVolume();
    }, [dimensions]);

    const renderTorisphericalHead = () => {
        const container = document.getElementById('head-container');
        if (!container) return;

        container.innerHTML = '';

        // Set up the scene, camera, and renderer
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(container.clientWidth, container.clientHeight);
        container.appendChild(renderer.domElement);

        // Set background color of the scene
        scene.background = new THREE.Color(0x000000); // Black background for better contrast

        // Add OrbitControls for better interaction
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.25;
        controls.enableZoom = true;

        // Add Lighting
        const ambientLight = new THREE.AmbientLight(0x404040, 1); // Ambient light
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(5, 10, 7); // Positioned higher and at an angle
        scene.add(directionalLight);

        const pointLight = new THREE.PointLight(0xffffff, 1, 100);
        pointLight.position.set(10, 10, 10);
        scene.add(pointLight);

        // Load environment map
        const loader = new THREE.CubeTextureLoader();
        const texture = loader.load([
            'path/to/px.jpg',
            'path/to/nx.jpg',
            'path/to/py.jpg',
            'path/to/ny.jpg',
            'path/to/pz.jpg',
            'path/to/nz.jpg',
        ]);
        scene.background = texture;

        // Create material
        const silverMaterial = new THREE.MeshStandardMaterial({
            color: 0xaaaaaa, // Slightly darker silver color
            metalness: 1.0, // High metalness for metallic appearance
            roughness: 0.1, // Low roughness for a polished look
            envMap: texture, // Environment map for reflections
            envMapIntensity: 1.5 // Intensity of environment map reflections
        });

        // Convert dimensions to meters
        const outerRadius = dimensions.outerDiameter / 2000; // Outer radius in meters
        const brimHeight = dimensions.brimHeight / 1000; // Brim height in meters
        const innerRadius = outerRadius - (dimensions.sheetThickness / 1000); // Inner radius in meters

        // Create geometries
        const outerGeometry = new THREE.SphereGeometry(outerRadius, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2);
        const innerGeometry = new THREE.SphereGeometry(innerRadius, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2);

        // Create meshes
        const outerHead = new THREE.Mesh(outerGeometry, silverMaterial);
        const innerHead = new THREE.Mesh(innerGeometry, new THREE.MeshBasicMaterial({ color: 0xeeeeee, wireframe: true }));

        // Create the torispherical head group
        const torisphericalHead = new THREE.Group();
        torisphericalHead.add(outerHead);
        torisphericalHead.add(innerHead);

        // Add internal lines
        const edgesMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });

        // Define line geometry inside the torispherical head
        const lineGeometry = new THREE.BufferGeometry();
        const vertices = [];
        for (let i = 0; i <= 100; i++) {
            const angle = (i / 100) * Math.PI;
            const x = (innerRadius * Math.cos(angle));
            const y = (innerRadius * Math.sin(angle)) - (brimHeight / 2);
            vertices.push(x, y, 0);
            vertices.push(x, y, -0.1);
        }
        lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        const lines = new THREE.LineSegments(lineGeometry, edgesMaterial);
        torisphericalHead.add(lines);

        scene.add(torisphericalHead);

        // Center the model
        const boundingBox = new THREE.Box3().setFromObject(torisphericalHead);
        const boxSize = boundingBox.getSize(new THREE.Vector3()).length();
        const boxCenter = boundingBox.getCenter(new THREE.Vector3());

        // Adjust camera position
        camera.position.set(boxCenter.x, boxCenter.y, boxSize * 2); // Adjust camera distance
        camera.lookAt(boxCenter);

        controls.target.copy(boxCenter);

        // Animation loop
        const animate = () => {
            requestAnimationFrame(animate);
            torisphericalHead.rotation.x += 0.005;
            torisphericalHead.rotation.y += 0.005;
            controls.update();
            renderer.render(scene, camera);
        };
        animate();

        // Handle window resize
        const handleResize = () => {
            renderer.setSize(container.clientWidth, container.clientHeight);
            camera.aspect = container.clientWidth / container.clientHeight;
            camera.updateProjectionMatrix();
        };

        window.addEventListener('resize', handleResize);
        handleResize();

        // Clean up on component unmount
        return () => {
            window.removeEventListener('resize', handleResize);
            renderer.dispose();
            scene.dispose();
        };
    };

    return (
        <div className="torispherical-head">
            <h2>Torispherical Head Configurator</h2>
            <div>
                <label>
                    Sheet Thickness (mm):
                    <input
                        type="number"
                        name="sheetThickness"
                        value={dimensions.sheetThickness}
                        onChange={handleDimensionChange}
                    />
                </label>
                <label>
                    Outer Diameter (mm):
                    <input
                        type="number"
                        name="outerDiameter"
                        value={dimensions.outerDiameter}
                        onChange={handleDimensionChange}
                    />
                </label>
                <label>
                    Brim Height (mm):
                    <input
                        type="number"
                        name="brimHeight"
                        value={dimensions.brimHeight}
                        onChange={handleDimensionChange}
                    />
                </label>
            </div>
            <div id="head-container"></div>
            <div>{volume !== null && <p>Volume: {volume.toFixed(2)} cubic meters</p>}</div>
        </div>
    );
};

export default TorisphericalHead;
