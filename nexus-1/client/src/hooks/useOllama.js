
import { useState, useCallback, useEffect } from 'react';
import api from '../utils/api';
import { API_ENDPOINTS } from '../utils/constants';

const useOllama = () => {
  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [health, setHealth] = useState({ connected: false, models: 0 });

  // Check Health
  const checkHealth = useCallback(async () => {
    try {
      const res = await api.get(API_ENDPOINTS.HEALTH);
      setHealth({ connected: res.data.ollama, models: res.data.models });
    } catch (err) {
      setHealth({ connected: false, models: 0 });
    }
  }, []);

  // Fetch Available Models
  const fetchModels = useCallback(async () => {
    try {
      const res = await api.get(API_ENDPOINTS.MODELS);
      setModels(res.data);
      if (res.data.length > 0 && !selectedModel) {
        setSelectedModel(res.data[0].name);
      }
    } catch (err) {
      console.error('Failed to fetch models', err);
    }
  }, [selectedModel]);

  // Generate Stream
  const generateText = useCallback(async (prompt, onChunk, onFinish) => {
    if (!selectedModel) {
      alert('No model selected or Ollama not connected');
      return;
    }

    setIsGenerating(true);
    let fullText = '';

    try {
      // Use fetch API for streaming support (axios streaming is tricker in browser)
      // Note: We use the proxy path.
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: selectedModel,
          prompt: prompt,
          stream: true
        })
      });

      if (!response.ok) throw new Error(response.statusText);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        
        // Ollama sends JSON objects, sometimes multiple in one chunk
        // We need to parse them.
        // It's NDJSON.
        const lines = chunk.split('\n').filter(line => line.trim() !== '');
        
        for (const line of lines) {
             try {
                 const json = JSON.parse(line);
                 if (json.response) {
                     fullText += json.response;
                     onChunk(json.response);
                 }
                 if (json.done) {
                    // Optimization: handle done stats if needed
                 }
             } catch (e) {
                 // console.warn('JSON parse error in stream', e);
             }
        }
      }

    } catch (error) {
      console.error('Generation failed', error);
      onChunk(`\n\n[Error: ${error.message}]`);
    } finally {
      setIsGenerating(false);
      if (onFinish) onFinish(fullText);
    }
  }, [selectedModel]);

  // Initial Load
  useEffect(() => {
    checkHealth();
    fetchModels();
  }, [checkHealth, fetchModels]);

  return {
    models,
    selectedModel,
    setSelectedModel,
    isGenerating,
    health,
    checkHealth,
    fetchModels,
    generateText
  };
};

export default useOllama;
