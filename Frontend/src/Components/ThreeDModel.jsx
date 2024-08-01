import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

const ThreeDModel = ({ topHead, cylindricalPart, lowerBottom, base }) => {
  const mountRef = useRef(null);

  useEffect(() => {
    // Set up scene, camera, and renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    // Create and add 3D objects based on parameters
    const createVessel = () => {
      // Clear previous objects
      scene.clear();

      // Example of creating a simple cylinder
      const geometry = new THREE.CylinderGeometry(cylindricalPart.outerDiameter / 2, cylindricalPart.outerDiameter / 2, cylindricalPart.height, 32);
      const material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
      const cylinder = new THREE.Mesh(geometry, material);
      scene.add(cylinder);

      // Position the camera
      camera.position.z = 500;
    };

    createVessel();

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };

    animate();

    // Clean up
    return () => {
      mountRef.current.removeChild(renderer.domElement);
    };
  }, [topHead, cylindricalPart, lowerBottom, base]);

  return <div ref={mountRef} style={{ width: '100%', height: '500px' }} />;
};

export default ThreeDModel;
