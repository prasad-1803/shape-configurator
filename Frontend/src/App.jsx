import React from 'react';
import CylinderPart from './Components/CylinderPart';

import VesselConfigurator from './Components/VesselConfig';
import { Cylinder } from '@react-three/drei';

function App() {
    return (
        <div className="App">
           <VesselConfigurator/>
            <CylinderPart />
        </div>
    );
}

export default App;
