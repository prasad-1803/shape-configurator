import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import './CylinderPart.css';

const CylinderPart = ({ initialDimensions }) => {
    const [dimensions, setDimensions] = useState(initialDimensions);
    const [volume, setVolume] = useState(null);

    useEffect(() => {
        setDimensions(initialDimensions);
    }, [initialDimensions]);

    useEffect(() => {
        renderCylinder();
        calculateVolume();
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

    const renderCylinder = () => {
        const container = document.getElementById('shape-container');
        if (!container) return;

        container.innerHTML = '';

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer();
        renderer.setSize(container.clientWidth, container.clientHeight);
        container.appendChild(renderer.domElement);

        scene.background = new THREE.Color(0xc0c0c0);

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.25;
        controls.enableZoom = true;

        const ambientLight = new THREE.AmbientLight(0x404040);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(10, 10, 10);
        scene.add(directionalLight);

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
            color: 0xcccccc,
            metalness: 1.0,
            roughness: 0.2,
            envMap: texture,
            envMapIntensity: 1
        });

        const outerRadius = dimensions.outerDiameter / 2000;
        const height = dimensions.height / 1000;

        const outerGeometry = new THREE.CylinderGeometry(outerRadius, outerRadius, height, 32, 1, true);
        const outerCylinder = new THREE.Mesh(outerGeometry, silverMaterial);

        const edgeGeometry = new THREE.EdgesGeometry(outerGeometry);
        const edgeMaterial = new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 2 });
        const edges = new THREE.LineSegments(edgeGeometry, edgeMaterial);

        const group = new THREE.Group();
        group.add(outerCylinder);
        group.add(edges);
        scene.add(group);

        const boundingBox = new THREE.Box3().setFromObject(group);
        const boxSize = boundingBox.getSize(new THREE.Vector3()).length();
        const boxCenter = boundingBox.getCenter(new THREE.Vector3());

        camera.position.z = boxSize * 1.5;
        camera.position.y = boxCenter.y;
        camera.lookAt(boxCenter);
        controls.target.copy(boxCenter);

        const animate = () => {
            requestAnimationFrame(animate);
            group.rotation.x += 0.002;
            group.rotation.y += 0.002;
            controls.update();
            renderer.render(scene, camera);
        };
        animate();

        const handleResize = () => {
            renderer.setSize(container.clientWidth, container.clientHeight);
            camera.aspect = container.clientWidth / container.clientHeight;
            camera.updateProjectionMatrix();
        };

        window.addEventListener('resize', handleResize);
        handleResize();

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
                <label>
                    Type:
                    <select
                        name="type"
                        value={dimensions.type}
                        onChange={handleSelectChange}
                    >
                        <option value="Single Shell">Single Shell</option>
                        <option value="Double Shell">Double Shell</option>
                    </select>
                </label>
            </div>
            <div id="shape-container" className="shape-container"></div>
            {volume !== null && <p>Volume: {volume.toFixed(2)} cubic meters</p>}
        </div>
    );
};

export default CylinderPart;
