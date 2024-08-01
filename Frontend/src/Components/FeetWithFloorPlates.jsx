import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import './FeetWithFloorPlates.css';

const FeetWithFloorPlates = () => {
    const [outletHeight, setOutletHeight] = useState(200); // Default value in millimeters
    const [volume, setVolume] = useState(null);

    useEffect(() => {
        renderFeetWithFloorPlates();
    }, [outletHeight]);

    useEffect(() => {
        calculateVolume();
    }, [outletHeight]);

    const handleInputChange = (e) => {
        setOutletHeight(parseFloat(e.target.value));
    };

    const calculateVolume = async () => {
        try {
            const dimensionsInMeters = {
                outletHeight: outletHeight / 1000, // Convert mm to meters
            };

            const response = await axios.post('http://localhost:5000/api/calculate-volume', {
                shape: 'feetWithFloorPlates',
                dimensions: dimensionsInMeters
            });
            setVolume(response.data.volume);
        } catch (error) {
            console.error('Error calculating volume:', error);
        }
    };

    const renderFeetWithFloorPlates = () => {
        const container = document.getElementById('feet-container');
        if (!container) return;

        container.innerHTML = '';

        // Set up the scene, camera, and renderer
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(container.clientWidth, container.clientHeight);
        container.appendChild(renderer.domElement);

        // Set background color of the scene
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

        // Create material for feet and floor plates
        const metalMaterial = new THREE.MeshStandardMaterial({
            color: 0x333333, // Dark gray color for metal
            metalness: 1.0, // High metalness for metallic appearance
            roughness: 0.2 // Slight roughness for a realistic metal look
        });

        // Create a group to hold the feet and floor plates
        const feetGroup = new THREE.Group();

        // Parameters for feet, plate, and small plates
        const footRadius = 10; // In millimeters
        const footHeight = outletHeight; // Outlet height in millimeters
        const plateWidth = 200; // Plate width in millimeters
        const plateDepth = 200; // Plate depth in millimeters
        const plateThickness = 10; // Plate thickness in millimeters
        const smallPlateRadius = 5; // Radius of small plates in millimeters
        const smallPlateThickness = 5; // Thickness of small plates in millimeters

        // Create the floor plate (rectangular)
        const plateGeometry = new THREE.BoxGeometry(plateWidth, plateThickness, plateDepth);
        const plateMesh = new THREE.Mesh(plateGeometry, metalMaterial);
        plateMesh.position.set(0, -plateThickness / 2, 0); // Centered on the y-axis
        feetGroup.add(plateMesh);

        // Create feet (cylinders)
        const footGeometry = new THREE.CylinderGeometry(footRadius, footRadius, footHeight, 32);
        const offsets = [
            { x: -plateWidth / 2 + footRadius, z: -plateDepth / 2 + footRadius }, // Bottom left corner
            { x: plateWidth / 2 - footRadius, z: -plateDepth / 2 + footRadius },  // Bottom right corner
            { x: -plateWidth / 2 + footRadius, z: plateDepth / 2 - footRadius },  // Top left corner
            { x: plateWidth / 2 - footRadius, z: plateDepth / 2 - footRadius }    // Top right corner
        ];

        offsets.forEach(offset => {
            const footMesh = new THREE.Mesh(footGeometry, metalMaterial);
            footMesh.position.set(offset.x, -footHeight / 2 - plateThickness / 2, offset.z);
            feetGroup.add(footMesh);

            // Create small plates (circular discs) at the base of each foot
            const smallPlateGeometry = new THREE.CylinderGeometry(smallPlateRadius, smallPlateRadius, smallPlateThickness, 32);
            const smallPlateMesh = new THREE.Mesh(smallPlateGeometry, metalMaterial);
            smallPlateMesh.position.set(offset.x, -footHeight / 2 - smallPlateThickness / 2 - plateThickness / 2, offset.z);
            smallPlateMesh.rotation.x = Math.PI / 2; // Rotate to make it a disc
            feetGroup.add(smallPlateMesh);
        });

        // Add feet group to the scene
        scene.add(feetGroup);

        // Center the model
        const boundingBox = new THREE.Box3().setFromObject(feetGroup);
        const boxSize = boundingBox.getSize(new THREE.Vector3()).length();
        const boxCenter = boundingBox.getCenter(new THREE.Vector3());

        // Adjust camera position
        camera.position.z = boxSize * 2; // Adjust camera distance based on size
        camera.position.y = boxCenter.y; // Center vertically
        camera.lookAt(boxCenter);

        // Ensure the camera is looking at the center of the group
        controls.target.copy(boxCenter);

        // Animation loop
        const animate = () => {
            requestAnimationFrame(animate);
            feetGroup.rotation.y += 0.01; // Slow rotation for visualization
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
        <div className="feet-configurator">
            <h1>Feet with Floor Plates Configurator</h1>
            <div>
                <label>
                    Outlet Height (millimeters):
                    <input
                        type="number"
                        step="0.1"
                        value={outletHeight}
                        onChange={handleInputChange}
                    />
                </label>
            </div>
            <div id="feet-container"></div>
            <div>{volume !== null && <p>Volume: {volume.toFixed(2)} cubic meters</p>}</div>
        </div>
    );
};

export default FeetWithFloorPlates;
