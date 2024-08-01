import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import './CylinderPart.css';

const CylinderPart = () => {
    const [dimensions, setDimensions] = useState({ 
        sheetThickness: 3, // mm
        outerDiameter: 500, // mm
        height: 2500 // mm
    });
    const [volume, setVolume] = useState(null);

    useEffect(() => {
        renderCylinder();
    }, [dimensions]);

    const handleDimensionChange = (event) => {
        const { name, value } = event.target;
        setDimensions(prevDimensions => ({ ...prevDimensions, [name]: parseFloat(value) }));
    };

    const calculateVolume = async () => {
        try {
            const dimensionsInMeters = {
                height: dimensions.height / 1000,
                outerDiameter: dimensions.outerDiameter / 1000,
                sheetThickness: dimensions.sheetThickness / 1000
            };

            const response = await axios.post('http://localhost:5000/api/calculate-volume', {
                shape: 'cylinder',
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
    const renderCylinder = () => {
        const container = document.getElementById('shape-container');
        if (!container) return;
    
        container.innerHTML = '';
    
        // Set up the scene, camera, and renderer
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer();
        renderer.setSize(container.clientWidth, container.clientHeight);
        container.appendChild(renderer.domElement);
    
        // Set background color of the scene to silver
        scene.background = new THREE.Color(0xc0c0c0); // Silver color
    
        // Add OrbitControls for better interaction
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.25;
        controls.enableZoom = true;
    
        // Add Lighting
        const ambientLight = new THREE.AmbientLight(0x404040); // Soft white light
        scene.add(ambientLight);
    
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(10, 10, 10); // Positioned higher and at an angle
        scene.add(directionalLight);
    
        // Create silver material with environment map
        const loader = new THREE.CubeTextureLoader();
        const texture = loader.load([
            'path/to/px.jpg',
            'path/to/nx.jpg',
            'path/to/py.jpg',
            'path/to/ny.jpg',
            'path/to/pz.jpg',
            'path/to/nz.jpg',
        ]);
    
        const silverMaterial = new THREE.MeshStandardMaterial({
            color: 0xcccccc, // Silver color
            metalness: 1.0, // High metalness for metallic appearance
            roughness: 0.2, // Slight roughness for a realistic metal look
            envMap: texture, // Environment map for reflections
            envMapIntensity: 1 // Intensity of environment map reflections
        });
    
        // Convert dimensions to meters
        const outerRadius = dimensions.outerDiameter / 2000; // Outer radius in meters
        const height = dimensions.height / 1000; // Height in meters
    
        // Create outer cylinder
        const outerGeometry = new THREE.CylinderGeometry(outerRadius, outerRadius, height, 32, 1, true); // True for open ended
        const outerCylinder = new THREE.Mesh(outerGeometry, silverMaterial);
    
        // Add edges to highlight borders
        const edgeGeometry = new THREE.EdgesGeometry(outerGeometry);
        const edgeMaterial = new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 2 });
        const edges = new THREE.LineSegments(edgeGeometry, edgeMaterial);
    
        // Group the cylinder and edges
        const group = new THREE.Group();
        group.add(outerCylinder);
        group.add(edges); // Add edges to the same group
        scene.add(group);
    
        // Center the model
        const boundingBox = new THREE.Box3().setFromObject(group);
        const boxSize = boundingBox.getSize(new THREE.Vector3()).length();
        const boxCenter = boundingBox.getCenter(new THREE.Vector3());
    
        // Adjust camera position
        camera.position.z = boxSize * 1.5; // Adjust camera distance based on size
        camera.position.y = boxCenter.y; // Center vertically
        camera.lookAt(boxCenter);
    
        // Ensure the camera is looking at the center of the group
        controls.target.copy(boxCenter);
    
        // Animation loop
        const animate = () => {
            requestAnimationFrame(animate);
            group.rotation.x += 0.002; // Slower rotation speed
            group.rotation.y += 0.002; // Slower rotation speed
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
        <div className="shape-configurator">
            <h1>Cylinder Configurator</h1>
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
                    Height (mm):
                    <input
                        type="number"
                        name="height"
                        value={dimensions.height}
                        onChange={handleDimensionChange}
                    />
                </label>
            </div>
            <div id="shape-container"></div>
            <div>{volume !== null && <p>Volume: {volume.toFixed(2)} cubic meters</p>}</div>
        </div>
    );
};

export default CylinderPart;
