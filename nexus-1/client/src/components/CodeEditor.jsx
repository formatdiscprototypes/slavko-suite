
import React, { useEffect, useState, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { useAppContext } from '../context/AppContext';
import { Save } from 'lucide-react';
import { DEFAULT_EDITOR_CODE } from '../utils/constants';

const CodeEditor = () => {
    const { fileSystem, state, actions } = useAppContext();
    const { activeFile, openFiles } = state;
    const { readFile, saveFile, currentFile } = fileSystem;
    
    // Local state for editor content to handle changes before save
    const [content, setContent] = useState(DEFAULT_EDITOR_CODE);
    const [isDirty, setIsDirty] = useState(false);
    
    // Ref for Debouncing auto-save
    const autoSaveTimerRef = useRef(null);

    // Sync content when active file changes
    useEffect(() => {
        if (activeFile && currentFile && currentFile.path === activeFile) {
            setContent(currentFile.content || '');
            setIsDirty(false);
        } else if (!activeFile) {
            setContent(DEFAULT_EDITOR_CODE);
        }
    }, [activeFile, currentFile]);

    const handleEditorChange = (value) => {
        setContent(value);
        setIsDirty(true);
        
        // Auto Save Logic
        if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
        
        if (activeFile) {
            autoSaveTimerRef.current = setTimeout(async () => {
                await saveFile(activeFile, value);
                setIsDirty(false);
            }, 1000); // 1 second debounce
        }
    };

    const handleManualSave = async () => {
        if (activeFile) {
             await saveFile(activeFile, content);
             setIsDirty(false);
        }
    };

    // Determine language from extension
    const getLanguage = (path) => {
        if (!path) return 'javascript';
        if (path.endsWith('.html')) return 'html';
        if (path.endsWith('.css')) return 'css';
        if (path.endsWith('.json')) return 'json';
        if (path.endsWith('.py')) return 'python';
        if (path.endsWith('.md')) return 'markdown';
        return 'javascript';
    };

    return (
        <div className="flex flex-col h-full bg-[#1e1e1e]">
             {/* Tabs Bar */}
             <div className="flex bg-[#0a0a0a] border-b border-[#333] overflow-x-auto no-scrollbar">
                {openFiles.length === 0 && <div className="p-2 text-xs text-gray-500 italic">No files open</div>}
                
                {openFiles.map(file => (
                    <div 
                        key={file}
                        onClick={() => actions.setActiveFile(file)}
                        className={`
                            px-4 py-2 text-xs border-r border-[#333] cursor-pointer flex items-center space-x-2 min-w-fit
                            ${activeFile === file ? 'bg-[#1e1e1e] text-neon-green border-t-2 border-t-neon-green' : 'text-gray-500 hover:text-gray-300'}
                        `}
                    >
                        <span>{file.split('/').pop()}</span>
                        <button 
                            onClick={(e) => { e.stopPropagation(); actions.closeFile(file); }}
                            className="hover:text-red-500 ml-2 font-bold"
                        >
                            &times;
                        </button>
                    </div>
                ))}
             </div>

             {/* Toolbar */}
             <div className="bg-[#1e1e1e] border-b border-[#333] px-4 py-1 flex justify-between items-center h-8">
                 <div className="text-xs text-gray-500 flex space-x-4">
                     <span>LAN: {getLanguage(activeFile)}</span>
                     <span>PATH: {activeFile || 'untitled'}</span>
                 </div>
                 <button 
                    onClick={handleManualSave}
                    className={`text-xs flex items-center space-x-1 ${isDirty ? 'text-yellow-500' : 'text-gray-600'}`}
                 >
                     <Save size={12} />
                     <span>{isDirty ? 'UNSAVED' : 'SAVED'}</span>
                 </button>
             </div>

             {/* Editor */}
             <div className="flex-1 relative">
                 <Editor
                    height="100%"
                    theme="vs-dark"
                    language={getLanguage(activeFile)}
                    value={content}
                    onChange={handleEditorChange}
                    options={{
                        minimap: { enabled: true },
                        fontSize: 14,
                        fontFamily: "'Courier New', monospace",
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                        cursorStyle: 'line',
                        padding: { top: 16 }
                    }}
                 />
                 
                 {!activeFile && (
                     <div className="absolute inset-0 bg-black/50 flex items-center justify-center pointer-events-none z-10">
                         <div className="text-center text-[#444]">
                             <div className="text-4xl mb-2">NEXUS-1</div>
                             <div className="text-sm">OPEN A FILE TO START CODING</div>
                         </div>
                     </div>
                 )}
             </div>
        </div>
    );
};

export default CodeEditor;
