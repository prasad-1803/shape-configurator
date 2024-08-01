import React from 'react';
import CylinderPart from './Components/CylinderPart';

import VesselConfigurator from './Components/VesselConfig';

import TorisphericalHead from './Components/TorisphericalHead';
import Feet from './Components/FeetWithFloorPlates';

function App() {
    return (
        <div className="App">
           <VesselConfigurator/>
            <CylinderPart />
            <TorisphericalHead />
            <Feet/>
        </div>
    );
}

export default App;
