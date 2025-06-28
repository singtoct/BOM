import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { BomProvider } from './context/BomContext';

const container = document.getElementById('root');
const root = createRoot(container!);

root.render(
  <React.StrictMode>
    <BomProvider>
      <App />
    </BomProvider>
  </React.StrictMode>
);
