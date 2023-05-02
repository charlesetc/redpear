import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

if (false)
  document.addEventListener('DOMContentLoaded', () => {
    const rootNode = document.getElementById('react-root');
    const root = createRoot(rootNode);
    root.render(<App />);
  })
