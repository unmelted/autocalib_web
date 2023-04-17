import React from 'react';
import ReactDOM from 'react-dom/client';
import { ProSidebarProvider } from 'react-pro-sidebar';
import './css/index.css';
import App from './App.js';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter } from "react-router-dom";

console.log("Env file: " + process.env.REACT_APP_SERVER_URL);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <ProSidebarProvider>
        <App />
      </ProSidebarProvider>
    </BrowserRouter>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
