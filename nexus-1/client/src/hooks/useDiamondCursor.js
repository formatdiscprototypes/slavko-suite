
import { useEffect } from 'react';

const useDiamondCursor = () => {
  useEffect(() => {
    const cursor = document.createElement('div');
    cursor.id = 'diamond-cursor';
    
    // Inline styles for the cursor
    Object.assign(cursor.style, {
      width: '12px',
      height: '12px',
      border: '2px solid #00FF88', // Nexus Green
      backgroundColor: 'rgba(0, 255, 136, 0.2)',
      position: 'fixed',
      pointerEvents: 'none',
      transform: 'rotate(45deg) translate(-50%, -50%)',
      zIndex: '9999',
      transition: 'transform 0.1s ease-out',
      boxShadow: '0 0 8px #00FF88',
      display: 'none' // Initially hidden until move
    });

    document.body.appendChild(cursor);
    document.body.style.cursor = 'none'; // Hide default cursor eventually
    // Note: hiding default cursor globally can be annoying if logic fails. 
    // Usually we hide it on specific elements or body, but keep it visible if mouse leaves window.

    const moveCursor = (e) => {
      cursor.style.display = 'block';
      cursor.style.left = `${e.clientX}px`;
      cursor.style.top = `${e.clientY}px`;
    };

    const mouseDown = () => {
      cursor.style.transform = 'rotate(45deg) scale(0.8)';
      cursor.style.backgroundColor = '#00FF88';
    };

    const mouseUp = () => {
      cursor.style.transform = 'rotate(45deg) scale(1)';
      cursor.style.backgroundColor = 'rgba(0, 255, 136, 0.2)';
    };

    window.addEventListener('mousemove', moveCursor);
    window.addEventListener('mousedown', mouseDown);
    window.addEventListener('mouseup', mouseUp);

    return () => {
      window.removeEventListener('mousemove', moveCursor);
      window.removeEventListener('mousedown', mouseDown);
      window.removeEventListener('mouseup', mouseUp);
      document.body.style.cursor = 'auto';
      if (cursor && cursor.parentNode) {
        cursor.parentNode.removeChild(cursor);
      }
    };
  }, []);
};

export default useDiamondCursor;
