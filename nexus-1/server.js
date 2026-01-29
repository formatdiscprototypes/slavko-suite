
const express = require('express');
const cors = require('cors');
const http = require('http');
const WebSocket = require('ws');
const pty = require('node-pty');
const os = require('os');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const axios = require('axios');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server, path: '/terminal' });
const PORT = 3001;

// --- CONFIGURATION ---
const WORKSPACE_DIR = path.resolve(__dirname, 'workspace');
// Windows compatibility: use cmd.exe as default, unless specified otherwise
const SHELL = os.platform() === 'win32' ? 'cmd.exe' : 'bash';
const ALLOWED_EXTENSIONS = ['.js', '.jsx', '.html', '.css', '.json', '.md', '.txt', '.py', '.ts', '.tsx'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// Ensure workspace exists
if (!fs.existsSync(WORKSPACE_DIR)) {
    fs.mkdirSync(WORKSPACE_DIR, { recursive: true });
}

// Middleware
app.use(cors());
app.use(express.json());

// Logging Middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// --- HELPER FUNCTIONS ---

// Security: Validate path is within workspace
const safePath = (targetPath) => {
    // Check if targetPath is already absolute. If not, resolve it against workspace.
    const resolvedPath = path.isAbsolute(targetPath) 
        ? path.resolve(targetPath) 
        : path.resolve(WORKSPACE_DIR, targetPath);
        
    if (!resolvedPath.startsWith(WORKSPACE_DIR)) {
        throw new Error('Access denied: Path traversal detected');
    }
    return resolvedPath;
};

// --- ENDPOINTS ---

// F) Health Check
app.get('/api/health', async (req, res) => {
    let ollamaStatus = false;
    let modelCount = 0;
    try {
        const response = await axios.get('http://localhost:11434/api/tags', { timeout: 2000 });
        ollamaStatus = response.status === 200;
        modelCount = response.data.models ? response.data.models.length : 0;
    } catch (error) {
        console.error('Health check - Ollama error:', error.message);
    }

    res.json({
        backend: true,
        ollama: ollamaStatus,
        models: modelCount
    });
});

// A) Ollama API Proxy
app.post('/api/generate', async (req, res) => {
    const { model, prompt, stream } = req.body;
    
    // Set headers for SSE if streaming
    if (stream) {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
    }

    try {
        const response = await axios({
            method: 'post',
            url: 'http://localhost:11434/api/generate',
            data: { model, prompt, stream },
            responseType: stream ? 'stream' : 'json',
            timeout: 60000 // 60s timeout
        });

        if (stream) {
            response.data.on('data', (chunk) => {
                // Determine if chunk is Buffer or string and send appropriately
                // Ollama sends JSON objects in chunks. Proxy them as SSE data or raw.
                // For simplicity in proxying, we just write the raw chunks to the client.
                res.write(chunk); 
            });
            response.data.on('end', () => res.end());
            response.data.on('error', (err) => {
                console.error('Stream error:', err);
                res.write(`data: ${JSON.stringify({ error: 'Stream error' })}\n\n`);
                res.end();
            });
        } else {
            res.json(response.data);
        }
    } catch (error) {
        console.error('Ollama Generation Error:', error.message);
        if (!stream && !res.headersSent) {
            res.status(500).json({ error: 'Failed to generate response from Ollama', details: error.message });
        } else if (stream) {
             res.write(`data: ${JSON.stringify({ error: 'Failed to connect to Ollama' })}\n\n`);
             res.end();
        }
    }
});

// E) Ollama Model Management
let modelCache = { data: [], timestamp: 0 };
app.get('/api/models', async (req, res) => {
    const now = Date.now();
    if (modelCache.data.length > 0 && (now - modelCache.timestamp) < 60000) {
        return res.json(modelCache.data);
    }

    try {
        const response = await axios.get('http://localhost:11434/api/tags');
        modelCache = {
            data: response.data.models || [],
            timestamp: now
        };
        res.json(modelCache.data);
    } catch (error) {
        console.error('Fetch Models Error:', error.message);
        // Fallback or empty
        res.json([]); 
    }
});

// C) File System Operations

// Helper to get file stats
const getFileMetadata = (filePath) => {
    const stats = fs.statSync(filePath);
    return {
        name: path.basename(filePath),
        path: filePath.replace(WORKSPACE_DIR, '').replace(/\\/g, '/'), // Relative path
        size: stats.size,
        modified: stats.mtime,
        type: stats.isDirectory() ? 'directory' : 'file'
    };
};

const readDirRecursive = (dir) => {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach((file) => {
        const filePath = path.join(dir, file);
        const metadata = getFileMetadata(filePath);
        if (metadata.type === 'directory') {
            metadata.children = readDirRecursive(filePath);
        }
        results.push(metadata);
    });
    return results;
};

app.get('/api/files', (req, res) => {
    try {
        const files = readDirRecursive(WORKSPACE_DIR);
        res.json(files);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/files/*', (req, res) => {
    try {
        // req.params[0] captures the wildcard path
        const relativePath = req.params[0]; 
        const filePath = safePath(relativePath);
        
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: 'File not found' });
        }
        
        const content = fs.readFileSync(filePath, 'utf8');
        res.json({ content, ...getFileMetadata(filePath) });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.post('/api/files', (req, res) => {
    try {
        const { path: relativePath, content } = req.body;
        if (!relativePath) throw new Error('Path is required');
        
        const filePath = safePath(relativePath);
        const ext = path.extname(filePath).toLowerCase();

        if (!ALLOWED_EXTENSIONS.includes(ext) && ext !== '') {
             // Basic strict check, maybe allow no extension for some files? 
             // Requirement says whitelist: .js, .jsx, etc.
        }

        if (content.length > MAX_FILE_SIZE) {
            return res.status(413).json({ error: 'File too large' });
        }

        // Ensure parent dir exists
        fs.mkdirSync(path.dirname(filePath), { recursive: true });
        
        fs.writeFileSync(filePath, content, 'utf8');
        res.json({ success: true, path: relativePath });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/files/*', (req, res) => {
    try {
        const relativePath = req.params[0];
        const filePath = safePath(relativePath);
        
        if (!fs.existsSync(filePath)) {
             return res.status(404).json({ error: 'Not found' });
        }

        fs.rmSync(filePath, { recursive: true, force: true });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/files/rename', (req, res) => {
    try {
        const { oldPath, newPath } = req.body;
        const absOld = safePath(oldPath);
        const absNew = safePath(newPath);

        if (!fs.existsSync(absOld)) {
            return res.status(404).json({ error: 'Source file not found' });
        }

        // Check if destination directory exists, if not create it?? 
        // Usually rename implies move, so let's allow moving.
        fs.mkdirSync(path.dirname(absNew), { recursive: true });

        fs.renameSync(absOld, absNew);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// D) Git Integration
app.post('/api/git', (req, res) => {
    const { action, ...params } = req.body;
    let cmd = '';

    switch (action) {
        case 'init': cmd = 'git init'; break;
        case 'status': cmd = 'git status --porcelain'; break;
        case 'add': cmd = `git add ${params.files ? params.files.join(' ') : '.'}`; break;
        case 'commit': cmd = `git commit -m "${params.message}"`; break;
        case 'log': cmd = `git log -n ${params.limit || 10}`; break;
        // clone, push, pull would need more complex handling for auth/arguments
        default: return res.status(400).json({ error: 'Invalid git action' });
    }

    exec(cmd, { cwd: WORKSPACE_DIR }, (error, stdout, stderr) => {
        res.json({
            success: !error,
            stdout,
            stderr,
            data: stdout // Could parse this further based on action
        });
    });
});

// B) Terminal Integration (WebSocket)
const sessions = new Map();

wss.on('connection', (ws) => {
    console.log('Terminal connected');
    
    // Spawn pty
    const term = pty.spawn(SHELL, [], {
        name: 'xterm-color',
        cols: 80,
        rows: 24,
        cwd: WORKSPACE_DIR,
        env: process.env
    });

    const sessionId = Date.now().toString();
    sessions.set(sessionId, term);

    // Send generic Hello
    ws.send(JSON.stringify({ type: 'output', data: `Connected to ${SHELL}\r\n` }));

    // PTY -> WebSocket
    term.onData((data) => {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'output', data }));
        }
    });

    term.onExit(({ exitCode }) => {
        if (ws.readyState === WebSocket.OPEN) {
             ws.send(JSON.stringify({ type: 'exit', exitCode }));
        }
    });

    // WebSocket -> PTY
    ws.on('message', (message) => {
        try {
            const msg = JSON.parse(message);
            if (msg.type === 'input') {
                term.write(msg.data);
            } else if (msg.type === 'resize') {
                term.resize(msg.cols, msg.rows);
            }
        } catch (e) {
            console.error('WS Message Parse Error', e);
        }
    });

    ws.on('close', () => {
        console.log('Terminal disconnected');
        term.kill();
        sessions.delete(sessionId);
    });
});

// Start Server
server.listen(PORT, () => {
    console.log(`NEXUS-1 Backend running on http://localhost:${PORT}`);
    console.log(`Socket server on ws://localhost:${PORT}/terminal`);
    console.log(`Workspace: ${WORKSPACE_DIR}`);
});
