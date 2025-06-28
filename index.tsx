import React from 'react';
import ReactDOM from 'react-dom-client';
import App from './App';
import { BomProvider } from './context/BomContext';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <BomProvider>
      <App />
    </BomProvider>
  </React.StrictMode>
);