
import React from 'react';
import { useAppContext } from '../context/AppContext';
import { ChevronDown, RefreshCw } from 'lucide-react';

const ModelSelector = () => {
    const { ollama } = useAppContext();
    const { models, selectedModel, setSelectedModel, fetchModels } = ollama;

    return (
        <div className="flex items-center space-x-2 relative group">
            <div className="flex items-center space-x-2 cursor-pointer hover:text-neon-green transition-colors">
                <span className="font-bold">MODEL:</span>
                <select 
                    value={selectedModel} 
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="bg-transparent border-none outline-none appearance-none cursor-pointer text-neon-green font-bold uppercase min-w-[100px]"
                    disabled={models.length === 0}
                >
                    {models.length === 0 ? (
                        <option>NO MODELS FOUND</option>
                    ) : (
                        models.map((model) => (
                            <option key={model.digest} value={model.name} className="bg-black text-white">
                                {model.name.toUpperCase()}
                            </option>
                        ))
                    )}
                </select>
                <ChevronDown size={12} />
            </div>

            <button 
                onClick={fetchModels}
                className="p-1 hover:bg-[#222] rounded-full transition-colors"
                title="Refresh Models"
            >
                <RefreshCw size={12} />
            </button>
        </div>
    );
};

export default ModelSelector;
