import React from 'react';
import { Canvas } from '@react-three/fiber';
import { Torus } from '@react-three/drei';

const LowerBottom = ({ sheetThickness, brimHeight, type }) => {
  return (
    <Canvas>
      <Torus
        args={[100, sheetThickness, 16, 100]} // Example args, adjust as needed
        position={[0, -brimHeight / 2, 0]}
        rotation={[0, 0, 0]}
      >
      </Torus>
      <ambientLight />
      <pointLight position={[10, 10, 10]} />
    </Canvas>
  );
};

export default LowerBottom;
