
import { useState, useCallback } from 'react';
import api from '../utils/api';
import { API_ENDPOINTS } from '../utils/constants';

const useFileSystem = () => {
  const [files, setFiles] = useState([]);
  const [currentFile, setCurrentFile] = useState(null); // { path: string, content: string }
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // List files recursively
  const refreshFiles = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get(API_ENDPOINTS.FILES);
      setFiles(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch file tree');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Read file content
  const readFile = useCallback(async (path) => {
    setLoading(true);
    try {
      const response = await api.get(`${API_ENDPOINTS.FILES}/${path}`);
      setCurrentFile(response.data);
      return response.data;
    } catch (err) {
      setError(`Failed to read file: ${path}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Write file content
  const saveFile = useCallback(async (path, content) => {
    try {
      await api.post(API_ENDPOINTS.FILES, { path, content });
      // Update current file local state if it matches
      if (currentFile && currentFile.path === path) {
        setCurrentFile(prev => ({ ...prev, content }));
      }
      await refreshFiles(); // Refresh tree in case it's a new file
      return true;
    } catch (err) {
      setError(`Failed to save file: ${path}`);
      console.error(err);
      return false;
    }
  }, [currentFile, refreshFiles]);

  const deleteFile = useCallback(async (path) => {
    try {
      await api.delete(`${API_ENDPOINTS.FILES}/${path}`);
      await refreshFiles();
      if (currentFile && currentFile.path === path) {
        setCurrentFile(null);
      }
    } catch (err) {
      setError(`Failed to delete: ${path}`);
    }
  }, [currentFile, refreshFiles]);

  return {
    files,
    currentFile,
    setCurrentFile, // Allow manual setting (e.g. for new files)
    loading,
    error,
    refreshFiles,
    readFile,
    saveFile,
    deleteFile
  };
};

export default useFileSystem;
