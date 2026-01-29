
import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Folder, FolderOpen, File, FileCode, FileJson, FileText, ChevronRight, ChevronDown, Plus, Trash, Edit2 } from 'lucide-react';

const FileIcon = ({ name }) => {
    if (name.endsWith('.js') || name.endsWith('.jsx') || name.endsWith('.ts')) return <FileCode size={14} className="text-yellow-400" />;
    if (name.endsWith('.css')) return <FileCode size={14} className="text-blue-400" />;
    if (name.endsWith('.html')) return <FileCode size={14} className="text-orange-400" />;
    if (name.endsWith('.json')) return <FileJson size={14} className="text-green-400" />;
    if (name.endsWith('.md')) return <FileText size={14} className="text-gray-400" />;
    return <File size={14} className="text-gray-500" />;
};

const FileNode = ({ node, depth = 0, onOpen, activeFile }) => {
    const [isOpen, setIsOpen] = useState(false);
    const indent = depth * 12;

    const handleClick = () => {
        if (node.type === 'directory') {
            setIsOpen(!isOpen);
        } else {
            onOpen(node.path);
        }
    };

    const isActive = activeFile === node.path;

    return (
        <div>
            <div 
                className={`
                    flex items-center space-x-1 py-1 px-2 cursor-pointer
                    text-xs select-none hover:bg-[#222] transition-colors
                    ${isActive ? 'bg-[#222] text-neon-green border-r-2 border-neon-green' : 'text-gray-400'}
                `}
                style={{ paddingLeft: `${indent + 4}px` }}
                onClick={handleClick}
            >
                <div className="w-4 flex-shrink-0">
                    {node.type === 'directory' && (
                        isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />
                    )}
                </div>
                
                <div className="w-4 flex-shrink-0">
                    {node.type === 'directory' ? (
                        isOpen ? <FolderOpen size={14} className="text-neon-secondary" /> : <Folder size={14} className="text-neon-secondary" />
                    ) : (
                        <FileIcon name={node.name} />
                    )}
                </div>

                <span className="truncate">{node.name}</span>
            </div>

            {/* Recursion for Children */}
            {isOpen && node.children && node.children.map((child) => (
                <FileNode 
                    key={child.path} 
                    node={child} 
                    depth={depth + 1} 
                    onOpen={onOpen}
                    activeFile={activeFile}
                />
            ))}
        </div>
    );
};

const FileTree = () => {
    const { fileSystem, actions, state } = useAppContext();
    const { files, loading, refreshFiles } = fileSystem;
    const { activeFile } = state;

    return (
        <div className="flex flex-col h-full bg-[#0a0a0a]">
            {/* Toolbar */}
            <div className="flex justify-between items-center p-2 border-b border-[#333]">
                <span className="text-xs font-bold text-gray-500">EXPLORER</span>
                <div className="flex space-x-2">
                    <button onClick={refreshFiles} className="hover:text-neon-green">
                        <Plus size={14} /> {/* Placeholder for refresh/add */}
                    </button>
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto py-2">
                {loading ? (
                    <div className="text-xs text-gray-500 p-4">Scanning Sector...</div>
                ) : (
                    files.map(node => (
                        <FileNode 
                            key={node.path} 
                            node={node} 
                            onOpen={actions.openFile}
                            activeFile={activeFile} 
                        />
                    ))
                )}
                
                {files.length === 0 && !loading && (
                    <div className="text-xs text-gray-500 p-4 text-center mt-10">
                        WORKSPACE EMPTY
                    </div>
                )}
            </div>
        </div>
    );
};

export default FileTree;
