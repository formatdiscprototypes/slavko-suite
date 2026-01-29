
import React from 'react';
import { useAppContext } from '../context/AppContext';
import { Wifi, WifiOff, Activity, FileCode, Terminal } from 'lucide-react';
import ModelSelector from './ModelSelector';

const StatusBar = () => {
    const { ollama, state } = useAppContext();
    const { activeFile } = state;

    return (
        <div className="w-full h-full flex items-center justify-between text-[#888]">
            
            {/* Left: Connection & System */}
            <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                    {ollama.health.connected ? (
                        <Wifi size={14} className="text-neon-green" />
                    ) : (
                        <WifiOff size={14} className="text-red-500" />
                    )}
                    <span className={ollama.health.connected ? "text-neon-green" : "text-red-500"}>
                        OLLAMA: {ollama.health.connected ? 'ONLINE' : 'OFFLINE'}
                    </span>
                </div>
                
                <div className="h-4 w-[1px] bg-[#333]" />
                
                <ModelSelector />
            </div>

            {/* Center: Activity */}
            <div className="flex items-center space-x-2">
                 {ollama.isGenerating && (
                     <>
                        <Activity size={14} className="animate-pulse text-neon-blue" />
                        <span className="text-neon-blue animate-pulse">GENERATING...</span>
                     </>
                 )}
            </div>

            {/* Right: File Info */}
            <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                    <FileCode size={14} />
                    <span>{activeFile ? activeFile : 'NO FILE'}</span>
                </div>
                
                <div className="h-4 w-[1px] bg-[#333]" />
                
                <div className="flex items-center space-x-2">
                    <Terminal size={14} />
                    <span>WS: CONNECTED</span>
                </div>
            </div>
        </div>
    );
};

export default StatusBar;
