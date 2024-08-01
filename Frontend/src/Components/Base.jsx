import React from 'react';
import { Canvas } from '@react-three/fiber';
import { Box } from '@react-three/drei';

const Base = ({ type, outletHeight }) => {
  return (
    <Canvas>
      <Box
        args={[100, outletHeight, 100]} // Example args, adjust as needed
        position={[0, outletHeight / 2, 0]}
      >
      </Box>
      <ambientLight />
      <pointLight position={[10, 10, 10]} />
    </Canvas>
  );
};

export default Base;
