
export const THEME = {
  colors: {
    bg: '#0a0a0a',
    primary: '#00FF88',
    secondary: '#00DDFF',
    text: '#e0e0e0',
    border: '#333333'
  },
  fonts: {
    mono: "'Courier New', Courier, monospace"
  }
};

export const DEFAULT_EDITOR_CODE = `// Welcome to NEXUS-1
// Start typing your code here...

function helloWorld() {
  console.log("Hello from S.L.A.V.K.O.");
}

helloWorld();
`;

export const API_ENDPOINTS = {
  GENERATE: '/api/generate',
  MODELS: '/api/models',
  HEALTH: '/api/health',
  FILES: '/api/files',
  GIT: '/api/git'
};

export const WS_ENDPOINTS = {
  TERMINAL: 'ws://localhost:3001/terminal'
};
