
import React, { createContext, useContext, useState, useEffect } from 'react';
import useOllama from '../hooks/useOllama';
import useFileSystem from '../hooks/useFileSystem';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // Integrate Hooks
  const ollama = useOllama();
  const fileSystem = useFileSystem();

  // Chat State
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'NEXUS-1 Online. System Ready. How can I assist you with your code today?' }
  ]);

  // Editor State
  const [openFiles, setOpenFiles] = useState([]); // Array of paths
  const [activeFile, setActiveFile] = useState(null); // Path string
  
  // Terminal State (UI only, logic in component)
  const [terminalVisible, setTerminalVisible] = useState(true);

  // Helper: Open a file
  const openFile = async (path) => {
    if (!openFiles.includes(path)) {
      setOpenFiles([...openFiles, path]);
    }
    setActiveFile(path);
    await fileSystem.readFile(path);
  };

  // Helper: Close a file
  const closeFile = (path) => {
    const newFiles = openFiles.filter(f => f !== path);
    setOpenFiles(newFiles);
    if (activeFile === path) {
      setActiveFile(newFiles.length > 0 ? newFiles[newFiles.length - 1] : null);
    }
  };

  // Helper: Add Chat Message
  const addMessage = (role, content) => {
    setMessages(prev => [...prev, { role, content }]);
  };

  const clearChat = () => {
    setMessages([]);
  };

  // Initial load
  useEffect(() => {
    fileSystem.refreshFiles();
  }, []);

  const value = {
    ollama,
    fileSystem,
    state: {
      messages,
      openFiles,
      activeFile,
      terminalVisible
    },
    actions: {
      setMessages,
      addMessage,
      clearChat,
      openFile,
      closeFile,
      setActiveFile,
      setTerminalVisible
    }
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export const useResize = () => useContext(AppContext); // Warning: Misnamed export in prompt? No. 
// Just standard hook
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
};
