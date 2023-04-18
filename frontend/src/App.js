import React, { createContext, useContext } from 'react';
import { Routes, Route, RouteObject } from "react-router-dom";
import Sidenavbar from './components/sidebar.js';
import Home from './home.js';
import Exodus from './components/exodus.js';
import Kairos from './components/kairos.js';


export const configData = createContext();
const initConfigure = {
  scale: 'half', //full , half
  pair: 'isometric', //initial pair, isometric
  labatory: 'false', //true, false
  preprocess: 'Off', //on, off
  rotation_center: 'zero-cam', //zero-cam, each-center, 3d-center, tracking-center
};

function App() {

  let configure = initConfigure;
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

  console.log(process.env.REACT_APP_VERSION)

  // let routes: RouteObject[] = [
  //   {
  //     path: "/",
  //     element: <Layout />,
  //     children: [
  //       { path: "/exodus", element: <Exodus /> },
  //       { path: "/kairos", element: <Kairos /> },
  //     ],
  //   }
  // ];
  // let element = useRoutes(routes);

  return (
    <>
      <div style={{ display: 'flex', height: '100%' }}>
        <configData.Provider value={{ configure, changeConfigure }} >
          <Sidenavbar />
          <main>
          </main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="exodus" element={<Exodus />} />
            <Route path="Kairos" element={<Kairos />} />
          </Routes>
        </configData.Provider>
      </div>
    </>
  );
}

export default App;
