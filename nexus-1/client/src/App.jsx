
import React from 'react';
import { AppProvider } from './context/AppContext';
import useDiamondCursor from './hooks/useDiamondCursor';
import StatusBar from './components/StatusBar';
import FileTree from './components/FileTree';
import CodeEditor from './components/CodeEditor';
import ChatInterface from './components/ChatInterface';
import Terminal from './components/Terminal';
import LivePreview from './components/LivePreview';

// Main Layout Component
const NexusLayout = () => {
  // Initialize Custom Cursor
  useDiamondCursor();

  return (
    <div className="flex flex-col h-screen w-screen bg-black text-white scanlines overflow-hidden">
      {/* Main Workspace Area */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Sidebar: Files */}
        <div className="w-64 border-r border-[#333] flex flex-col">
          <div className="p-2 border-b border-[#333] text-neon-green font-bold text-sm">
            NEXUS-1 // FILE SYSTEM
          </div>
          <div className="flex-1 overflow-auto">
            <FileTree />
          </div>
        </div>

        {/* Center: Editor & Terminal */}
        <div className="flex-1 flex flex-col min-w-0 border-r border-[#333]">
          {/* Editor Area */}
          <div className="flex-1 border-b border-[#333] relative">
             <CodeEditor />
          </div>
          
          {/* Terminal Area */}
          <div className="h-64 bg-black">
             <Terminal />
          </div>
        </div>

        {/* Right Sidebar: AI & Preview */}
        <div className="w-[450px] flex flex-col min-w-0 bg-black/90">
          
          {/* Top: Live Preview (Hidden if not relevant, or tabs?) */}
          <div className="h-1/3 border-b border-[#333] relative">
            <div className="absolute top-0 right-0 p-1 z-10">
               <span className="text-xs bg-neon-green text-black px-1">PREVIEW</span>
            </div>
            <LivePreview />
          </div>

          {/* Bottom: Chat Interface */}
          <div className="flex-1 flex flex-col min-h-0">
             <ChatInterface />
          </div>
        </div>

      </div>

      {/* Bottom Status Bar */}
      <div className="h-6 border-t border-[#333] flex items-center px-4 text-xs font-mono bg-[#050505]">
        <StatusBar />
      </div>
    </div>
  );
};

const App = () => {
  return (
    <AppProvider>
      <NexusLayout />
    </AppProvider>
  );
};

export default App;
