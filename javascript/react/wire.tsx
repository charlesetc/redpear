import React from 'react';
import { createRoot } from 'react-dom/client';

function camelToKebab(str: string) {
  return str[0].toLowerCase() + str.slice(1, str.length).replace(/[A-Z]/g, (letter: string) => `-${letter.toLowerCase()}`);
}

export default function wire(Component) {
  document.addEventListener('DOMContentLoaded', () => {
    let elements = document.getElementsByTagName(camelToKebab(Component.name));
    for (const element of elements) {
      const root = createRoot(element);
      root.render(<Component />)
    }
  })
}
