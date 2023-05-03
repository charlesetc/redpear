import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './ProjectList'

if (false) {
  document.addEventListener('DOMContentLoaded', () => {
    const rootNode = document.getElementById('react-root');
    const root = createRoot(rootNode);
    root.render(<App />);
  })
}
