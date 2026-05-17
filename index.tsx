
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

console.log("Nexus POS: Starting bootstrap...");

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error("Nexus POS: Root element missing!");
  throw new Error("Could not find root element to mount to");
}

console.log("Nexus POS: Rendering root...");
const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
