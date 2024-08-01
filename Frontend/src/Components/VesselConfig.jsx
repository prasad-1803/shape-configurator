import React, { useState } from 'react';


import "./VesselConfig.css";

const VesselConfigurator = () => {
  const [topHead, setTopHead] = useState({
    sheetThickness: 3.0,
    brimHeight: 20.0,
    type: 'Torispherical Head',
  });
  const [cylindricalPart, setCylindricalPart] = useState({
    sheetThickness: 3.0,
    outerDiameter: 500.0,
    height: 1000.0,
    type: 'Single Shell',
  });
  const [lowerBottom, setLowerBottom] = useState({
    sheetThickness: 3.0,
    brimHeight: 20.0,
    type: 'Torispherical Head',
  });
  const [base, setBase] = useState({
    type: 'Feet with Floor Plate',
    outletHeight: 500.0
  });
  const [show3DModel, setShow3DModel] = useState(false);

  const handleInputChange = (e, setter) => {
    const { name, value } = e.target;
    setter(prev => ({ ...prev, [name]: parseFloat(value) }));
  };

  const handleSelectChange = (e, setter) => {
    const { name, value } = e.target;
    setter(prev => ({ ...prev, [name]: value }));
  };

  const generate3DModel = () => {
    setShow3DModel(true);
  };

  return (
    <div className='body'>
      <h1 id="header">3D-Vessel Configurator</h1>
      <form>
        {/* Top Head Section */}
        <div id="top-head-section" className="config-section">
          <div id="top-head-section-1">
            <div className="label-input-container">
              <label htmlFor="topHeadType">Top Head</label>
              <select
                id="topHeadType"
                name="type"
                value={topHead.type}
                onChange={(e) => handleSelectChange(e, setTopHead)}
              >
                <option value="Torispherical Head">Torispherical Head</option>
                <option value="Conical">Conical</option>
              </select>
            </div>
            <div className="label-input-container">
              <label htmlFor="topHeadSheetThickness">Sheet Thickness:</label>
              <input
                id="topHeadSheetThickness"
                type="number"
                name="sheetThickness"
                value={topHead.sheetThickness}
                onChange={(e) => handleInputChange(e, setTopHead)}
              />
              <span> mm</span>
            </div>
            <div className="label-input-container">
              <label htmlFor="topHeadBrimHeight">Height of Brim (h1):</label>
              <input
                id="topHeadBrimHeight"
                type="number"
                name="brimHeight"
                value={topHead.brimHeight}
                onChange={(e) => handleInputChange(e, setTopHead)}
              />
              <span> mm</span>
            </div>
          </div>
          <div className="render-container">
            {show3DModel && <TopHead {...topHead} />}
          </div>
        </div>

        {/* Cylindrical Part Section */}
        <div id="cylindrical-part-section" className="config-section">
          <div id="cylindrical-part-section-1">
            <div className="label-input-container">
              <label htmlFor="cylindricalPartType">Cylindrical Part</label>
              <select
                id="cylindricalPartType"
                name="type"
                value={cylindricalPart.type}
                onChange={(e) => handleSelectChange(e, setCylindricalPart)}
              >
                <option value="Single Shell">Single Shell</option>
              </select>
            </div>
            <div className="label-input-container">
              <label htmlFor="cylindricalPartSheetThickness">Sheet Thickness:</label>
              <input
                id="cylindricalPartSheetThickness"
                type="number"
                name="sheetThickness"
                value={cylindricalPart.sheetThickness}
                onChange={(e) => handleInputChange(e, setCylindricalPart)}
              />
              <span> mm</span>
            </div>
            <div className="label-input-container">
              <label htmlFor="cylindricalPartOuterDiameter">Outer Diameter:</label>
              <input
                id="cylindricalPartOuterDiameter"
                type="number"
                name="outerDiameter"
                value={cylindricalPart.outerDiameter}
                onChange={(e) => handleInputChange(e, setCylindricalPart)}
              />
              <span> mm</span>
            </div>
            <div className="label-input-container">
              <label htmlFor="cylindricalPartHeight">Cylindrical Height:</label>
              <input
                id="cylindricalPartHeight"
                type="number"
                name="height"
                value={cylindricalPart.height}
                onChange={(e) => handleInputChange(e, setCylindricalPart)}
              />
              <span> mm</span>
            </div>
          </div>
          <div className="render-container">
            {show3DModel && <CylinderPart dimensions={cylindricalPart} />}
          </div>
        </div>

        {/* Lower Bottom Section */}
        <div id="lower-bottom-section" className="config-section">
          <div id="lower-bottom-section-1">
            <div className="label-input-container">
              <label htmlFor="lowerBottomType">Lower Bottom</label>
              <select
                id="lowerBottomType"
                name="type"
                value={lowerBottom.type}
                onChange={(e) => handleSelectChange(e, setLowerBottom)}
              >
                <option value="Torispherical Head">Torispherical Head</option>
              </select>
            </div>
            <div className="label-input-container">
              <label htmlFor="lowerBottomSheetThickness">Sheet Thickness:</label>
              <input
                id="lowerBottomSheetThickness"
                type="number"
                name="sheetThickness"
                value={lowerBottom.sheetThickness}
                onChange={(e) => handleInputChange(e, setLowerBottom)}
              />
              <span> mm</span>
            </div>
            <div className="label-input-container">
              <label htmlFor="lowerBottomBrimHeight">Height of Brim (h1):</label>
              <input
                id="lowerBottomBrimHeight"
                type="number"
                name="brimHeight"
                value={lowerBottom.brimHeight}
                onChange={(e) => handleInputChange(e, setLowerBottom)}
              />
              <span> mm</span>
            </div>
          </div>
          <div className="render-container">
            {show3DModel && <LowerBottom {...lowerBottom} />}
          </div>
        </div>

        {/* Base Section */}
        <div id="base-section" className="config-section">
          <div id="base-section-1">
            <div className="label-input-container">
              <label htmlFor="baseType">Feet/Brackets</label>
              <select
                id="baseType"
                name="type"
                value={base.type}
                onChange={(e) => handleSelectChange(e, setBase)}
              >
                <option value="Feet with Floor Plate">Feet with Floor Plate</option>
                <option value="No Feet/Brackets">No Feet/Brackets</option>
              </select>
            </div>
            <div className="label-input-container">
              <label htmlFor="baseOutletHeight">Outlet Height:</label>
              <input
                id="baseOutletHeight"
                type="number"
                name="outletHeight"
                value={base.outletHeight}
                onChange={(e) => handleInputChange(e, setBase)}
              />
              <span> mm</span>
            </div>
          </div>
          <div className="render-container">
            {show3DModel && <Base {...base} />}
          </div>
        </div>

        <div className="button-container">
          <button type="button" onClick={generate3DModel}>Generate 3D Model</button>
        </div>
      </form>
    </div>
  );
};

export default VesselConfigurator;
