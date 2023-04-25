import React, { useState, createContext, useEffect } from 'react';
import { Routes, Route } from "react-router-dom";
import Sidenavbar from './components/sidebar.js';

// import './css/App.css';
import '../node_modules/bootstrap/dist/css/bootstrap.min.css';
import Home from './components/home.js';
import Exodus from './components/exodus.js';
import Kairos from './components/kairos.js';
import Config from './components/config.js';

export const configData = createContext();
export const commonData = createContext();

const initConfigure = {
  scale: 'half', //full , half
  pair: 'isometric', //initial pair, isometric
  labatory: 'false', //true, false
  preprocess: 'Off', //on, off
  rotation_center: 'zero-cam', //zero-cam, each-center, 3d-center, tracking-center
};
const initCommon = {
  selectedTaskId: '',
  selectedHistoryId: '',
  selectedRequestId: '',
  selectedTaskImages: [],
  leftCanvasImage: '',
  rightCanvasImage: '',
  task_records: [],
  task_history: [],
}

function App() {
  let configure = initConfigure;
  let common = initCommon;
  const [subscribers, setSubscribers] = useState([]);

  const changeConfigure = (params) => {
    const keys = Object.keys(configure)
    const pkeys = Object.keys(params)

    for (const key of keys) {
      for (const pkey of pkeys) {
        if (key === pkey) {
          console.log("change Config : ", key, pkey)
          configure[key] = params[pkey]
          console.log("change Config result : ", configure[key])
        }
      }
    }
  };

  const changeCommon = (params) => {
    const keys = Object.keys(common)
    const pkeys = Object.keys(params)

    for (const key of keys) {
      for (const pkey of pkeys) {
        if (key === pkey) {
          console.log("change common data : ", key, pkey)
          common[key] = params[pkey]
          console.log("change common data result : ", common[key])
        }
      }
    }
  };

  console.log("App.. ", process.env.REACT_APP_VERSION)


  useEffect(() => {
  }, [])

  return (
    <>
      <div style={{ display: 'flex', height: '100%' }}>
        <commonData.Provider value={{ common, changeCommon }} >
          <configData.Provider value={{ configure, changeConfigure }} >
            <Sidenavbar />
            <main >
            </main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="exodus" element={<Exodus />} />
              <Route path="kairos" element={<Kairos />} />
              <Route path="config" element={<Config />} />
            </Routes>
          </configData.Provider>
        </commonData.Provider>
      </div>
    </>
  );
}

export default App;
