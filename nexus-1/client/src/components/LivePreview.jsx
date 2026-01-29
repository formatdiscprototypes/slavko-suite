
import React, { useEffect, useRef, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Globe, RefreshCw, ExternalLink } from 'lucide-react';

const LivePreview = () => {
    const { fileSystem, state } = useAppContext();
    const { currentFile } = fileSystem;
    const [iframeSrc, setIframeSrc] = useState('');
    const [lastUpdate, setLastUpdate] = useState(Date.now());
    
    // We want to update preview when the CURRENTLY EDITED file is HTML, 
    // OR if we are just previewing a specific file?
    // Requirement: Preview HTML/JS
    // Best approach: If active file is HTML, inject its content into iframe.
    // If active file is JS/CSS, we ideally need an index.html that references them?
    // For single file preview: just blob the content.
    
    useEffect(() => {
        if (!currentFile) return;

        if (currentFile.name.endsWith('.html')) {
            // Create a blob URL for the HTML content
            const blob = new Blob([currentFile.content], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            setIframeSrc(url);

            // Cleanup
            return () => URL.revokeObjectURL(url);
        }
    }, [currentFile, lastUpdate]);

    const handleRefresh = () => {
        setLastUpdate(Date.now());
    };

    return (
        <div className="h-full flex flex-col bg-white">
            {/* Address Bar-ish */}
            <div className="bg-[#f0f0f0] border-b border-[#ccc] p-1 flex justify-between items-center px-2">
                <div className="flex items-center space-x-2 text-xs text-black">
                     <Globe size={12} />
                     <span>localhost:preview</span>
                </div>
                <div className="flex space-x-2 text-gray-600">
                    <button onClick={handleRefresh} className="hover:text-black" title="Reload">
                        <RefreshCw size={12} />
                    </button>
                    <button className="hover:text-black" title="Open New Tab">
                        <ExternalLink size={12} />
                    </button>
                </div>
            </div>

            {/* Iframe */}
            <div className="flex-1 bg-white relative">
                {iframeSrc ? (
                    <iframe 
                        src={iframeSrc}
                        className="w-full h-full border-none"
                        title="Live Preview"
                        sandbox="allow-scripts allow-modals" // Security sandbox
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-xs">
                        NO HTML FILE ACTIVE
                    </div>
                )}
            </div>
        </div>
    );
};

export default LivePreview;
