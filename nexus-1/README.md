
# NEXUS-1 // S.L.A.V.K.O. AI WORKBENCH
> **System Status:** ONLINE  
> **Aesthetic:** FORMATDISC v1.0 (Neon Green/Black/CRT)

NEXUS-1 is a locally hosted, offline-first AI development environment powered by **Ollama**, **React**, and **Node.js**. It features a split-pane code editor, integrated terminal, file system management, and a streaming AI chat interface for rapid prototyping.

## 🚀 FEATURES

- **100% Local AI**: Powered by Ollama (Llama2, CodeLlama, etc.) running on your machine.
- **Live Code Editor**: Monaco Editor (VS Code core) with syntax highlighting and auto-save.
- **Integrated Terminal**: Real `cmd.exe` or `PowerShell` session via WebSocket.
- **Live Preview**: Instant HTML/JS preview sandbox.
- **File System**: Create, edit, rename, and delete files in a dedicated `./workspace` directory.
- **Cyberpunk Aesthetic**: "FORMATDISC" theme with CRT scanlines and neon accents.

## 🛠️ PREREQUISITES

1. **Node.js**: v18+ installed.
2. **Ollama**: Installed and running (`http://localhost:11434`).
   - Run `ollama pull llama2` (or your preferred model) before starting.
3. **Browser**: Chrome/Edge/Firefox (modern version).

## 📦 INSTALLATION

1. **Navigate to the project root:**
   ```bash
   cd nexus-1
   ```

2. **Install Backend Dependencies:**
   ```bash
   npm install
   ```

3. **Install Frontend Dependencies:**
   ```bash
   cd client
   npm install
   ```

## ⚡ STARTUP COMMANDS

You need to run **TWO** terminals: one for the backend server, one for the frontend client.

**Terminal 1 (Backend):**
```bash
# In /nexus-1/ root
npm start
# Output should say: "NEXUS-1 Backend running on http://localhost:3001"
```

**Terminal 2 (Frontend):**
```bash
# In /nexus-1/client/ directory
npm run dev
# Click the link (http://localhost:5173) to open the workbench
```

## 🧪 VERIFICATION & TESTING

1. **Check Connectivity**:
   - Look at the **Status Bar** (bottom). 
   - Ensure "OLLAMA: ONLINE" is green.
   - Ensure "WS: CONNECTED" is visible.

2. **Test AI Chat**:
   - Type "Hello, who are you?" in the chat.
   - You should see a streaming response with the diamond cursor typing effect.

3. **Test File System**:
   - Right now, the file tree might be empty.
   - Create a file by using the Chat (ask AI to "Write a file called test.js").
   - OR, manually create a file in the `nexus-1/workspace/` folder on your disk.
   - Requires manual refresh (click the +/Refresh button in Explorer) if not auto-updating.

4. **Test Terminal**:
   - Type `dir` (Windows) or `ls` (Linux/Mac) in the bottom terminal panel.
   - You should see the directory listing of the workspace.

## 🔧 TROUBLESHOOTING

- **Ollama Offline**:
  - Ensure Ollama is running (`ollama serve`).
  - Check `http://localhost:11434` in your browser.
  
- **Terminal Disconnected**:
  - Check if backend is running (Port 3001).
  - Check browser console for WebSocket errors.

- **Preview Not Updating**:
  - The Live Preview currently expects an `.html` file to be the **active** file in the editor.
  - Switch tabs to your `.html` file to see it render.

---
*NEXUS-1 // ENTITY: S.L.A.V.K.O. // END OF LINE*
