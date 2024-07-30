import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'; // Import OrbitControls
import './ShapeConfigurator.css'; // Import the CSS file

const ShapeConfigurator = () => {
    const [shape, setShape] = useState('cube');
    const [dimensions, setDimensions] = useState({ width: 10, height: 10, radius: 10 }); // Default values in mm
    const [volume, setVolume] = useState(null);

    useEffect(() => {
        renderShape();
    }, [shape, dimensions]);

    const handleShapeChange = (event) => setShape(event.target.value);

    const handleDimensionChange = (event) => {
        const { name, value } = event.target;
        setDimensions(prevDimensions => ({ ...prevDimensions, [name]: parseFloat(value) }));
    };

    const calculateVolume = async () => {
        try {
            // Convert dimensions from mm to meters
            const dimensionsInMeters = {
                width: dimensions.width / 1000,
                height: dimensions.height / 1000,
                radius: dimensions.radius / 1000
            };

            const response = await axios.post('http://localhost:5000/api/calculate-volume', {
                shape,
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

    const renderShape = () => {
        const container = document.getElementById('shape-container');
        if (!container) return;

        // Clear previous content
        container.innerHTML = '';

        // Set up the scene, camera, and renderer
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer();
        renderer.setSize(container.clientWidth, container.clientHeight);
        container.appendChild(renderer.domElement);

        // Add OrbitControls for better interaction
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.25;
        controls.enableZoom = true;

        // Create shape geometry based on selected shape
        let geometry;
        const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        switch (shape) {
            case 'cube':
                geometry = new THREE.BoxGeometry(dimensions.width / 1000, dimensions.height / 1000, dimensions.width / 1000);
                break;
            case 'cylinder':
                geometry = new THREE.CylinderGeometry(dimensions.radius / 1000, dimensions.radius / 1000, dimensions.height / 1000);
                break;
            case 'cone':
                geometry = new THREE.ConeGeometry(dimensions.radius / 1000, dimensions.height / 1000);
                break;
            case 'sphere':
                geometry = new THREE.SphereGeometry(dimensions.radius / 1000, 32, 32);
                break;
            default:
                geometry = new THREE.BoxGeometry();
        }

        const shapeMesh = new THREE.Mesh(geometry, material);
        scene.add(shapeMesh);

        // Center the model and set initial camera position
        shapeMesh.position.set(0, 0, 0);
        camera.position.z = 5;

        // Animation loop
        const animate = () => {
            requestAnimationFrame(animate);
            shapeMesh.rotation.x += 0.01;
            shapeMesh.rotation.y += 0.01;
            controls.update(); // Update controls
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
        handleResize(); // Initial resize
    };

    return (
        <div className="shape-configurator">
            <h1>Shape Configurator</h1>
            <div>
                <label>
                    Shape:
                    <select value={shape} onChange={handleShapeChange}>
                        <option value="cube">Cube</option>
                        <option value="cylinder">Cylinder</option>
                        <option value="cone">Cone</option>
                        <option value="sphere">Sphere</option>
                    </select>
                </label>
            </div>
            <div>
                <label>
                    Width (mm):
                    <input type="number" name="width" value={dimensions.width} onChange={handleDimensionChange} />
                </label>
                <label>
                    Height (mm):
                    <input type="number" name="height" value={dimensions.height} onChange={handleDimensionChange} />
                </label>
                <label>
                    Radius (mm):
                    <input type="number" name="radius" value={dimensions.radius} onChange={handleDimensionChange} />
                </label>
            </div>
            <div id="shape-container"></div>
            <div>{volume !== null && <p>Volume: {volume.toFixed(2)} cubic meters</p>}</div>
        </div>
    );
};

export default ShapeConfigurator;
