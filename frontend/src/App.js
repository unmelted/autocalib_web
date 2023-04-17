import React, { useEffect, useState } from 'react';
import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';
import { Routes, Route, RouteObject } from "react-router-dom";
import { useRoutes } from "react-router-dom";
import styled from 'styled-components';
import '../node_modules/bootstrap/dist/css/bootstrap.min.css';
import './css/App.css';

import { ProSidebarProvider } from 'react-pro-sidebar';
import Sidenavbar from './components/sidebar.js';
import Topnavbar from './components/topbar.js';
import Footer from './components/footer.js';
import Home from './home.js';
import Exodus from './components/exodus.js';
import Kairos from './components/kairos.js';


function App() {

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
        <Sidenavbar />
        <main>
        </main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="exodus" element={<Exodus />} />
          <Route path="Kairos" element={<Kairos />} />
        </Routes>
      </div>
    </>
  );
}

export default App;


const Topbar = () => (
  <>
    <nav>
      <Navbar bg="dark" variant="dark">
        <Container>
          <Navbar.Brand href="#home">
            <img
              alt=""
              src="https://4dreplay.com/4d/wp-content/uploads/2021/10/logo_white-2.png"
              style={{ height: '70%', width: '240px', cursor: 'pointer', marginLeft: '25px', padding: '10px' }}
              className="d-inline-block align-top"
            />{' '}
          </Navbar.Brand>
        </Container>
      </Navbar>
    </nav>
  </>
)
