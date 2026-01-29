
import React, { useState, useRef, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Send, Trash2, StopCircle, Copy } from 'lucide-react';

const ChatInterface = () => {
    const { ollama, state, actions } = useAppContext();
    const { messages } = state;
    const { generateText, isGenerating } = ollama;
    const [input, setInput] = useState('');
    const chatEndRef = useRef(null);

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isGenerating) return;

        const userMsg = input;
        setInput('');
        
        // Add User Message
        actions.addMessage('user', userMsg);

        // Placeholder for AI response
        actions.addMessage('assistant', ''); 

        // Current message index to update
        let currentResponse = '';
        
        await generateText(
            userMsg, 
            (chunk) => {
                // Streaming update: Update the last message
                actions.setMessages(prev => {
                    const newMsgs = [...prev];
                    const lastMsg = newMsgs[newMsgs.length - 1];
                    // Append chunk to the last message if it's assistant
                    // Note: In strict React, we shouldn't mutate state objects directly like this usually in deep clones,
                    // but for streaming text it's performance sensitive.
                    // Better approach:
                    lastMsg.content += chunk; 
                    return newMsgs;
                });
            },
            (finalText) => {
                 // Finalize if needed
            }
        );
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
    };

    return (
        <div className="flex flex-col h-full bg-[#050505] border-l border-[#333]">
            {/* Header */}
            <div className="p-3 border-b border-[#333] flex justify-between items-center bg-[#111]">
                <span className="text-neon-green font-bold text-sm tracking-widest">NEXUS AI CHAT</span>
                <button 
                    onClick={actions.clearChat} 
                    className="text-[#666] hover:text-red-500 transition-colors"
                    title="Clear History"
                >
                    <Trash2 size={16} />
                </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                        <div className={`flex items-center mb-1 text-xs ${msg.role === 'user' ? 'text-neon-secondary' : 'text-neon-green'}`}>
                            <span className="uppercase font-bold tracking-wider">
                                {msg.role === 'user' ? 'USER' : 'SYSTEM'}
                            </span>
                        </div>
                        
                        <div className={`max-w-[95%] p-3 rounded-sm border ${
                            msg.role === 'user' 
                                ? 'bg-[#1a1a1a] border-[#333] text-gray-200' 
                                : 'bg-[#0a0a0a] border-neon-green/30 text-gray-300 shadow-[0_0_10px_rgba(0,255,136,0.05)]'
                        }`}>
                            {/* Render Markdown */}
                            <ReactMarkdown
                                components={{
                                    code({node, inline, className, children, ...props}) {
                                        const match = /language-(\w+)/.exec(className || '')
                                        return !inline && match ? (
                                            <div className="relative group my-2">
                                                <div className="absolute top-0 right-0 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button 
                                                        onClick={() => copyToClipboard(String(children))}
                                                        className="bg-[#333] p-1 rounded hover:bg-neon-green hover:text-black"
                                                    >
                                                        <Copy size={12} />
                                                    </button>
                                                </div>
                                                <SyntaxHighlighter
                                                    style={vscDarkPlus}
                                                    language={match[1]}
                                                    PreTag="div"
                                                    customStyle={{ margin: 0, borderRadius: '2px', fontSize: '12px' }}
                                                    {...props}
                                                >
                                                    {String(children).replace(/\n$/, '')}
                                                </SyntaxHighlighter>
                                            </div>
                                        ) : (
                                            <code className={`${className} bg-[#222] px-1 rounded text-neon-green`} {...props}>
                                                {children}
                                            </code>
                                        )
                                    }
                                }}
                            >
                                {msg.content}
                            </ReactMarkdown>
                            {msg.role === 'assistant' && isGenerating && idx === messages.length - 1 && (
                                <span className="typing-cursor"></span>
                            )}
                        </div>
                    </div>
                ))}
                <div ref={chatEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-[#111] border-t border-[#333]">
                <div className="relative">
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Enter command or prompt..."
                        className="w-full bg-[#0a0a0a] border border-[#333] text-gray-300 p-3 pr-12 text-sm focus:border-neon-green outline-none resize-none h-24 font-mono"
                        disabled={isGenerating}
                    />
                    <div className="absolute bottom-3 right-3 flex space-x-2">
                        {isGenerating ? (
                            <button className="text-red-500 hover:text-red-400">
                                <StopCircle size={18} />
                            </button>
                        ) : (
                            <button 
                                onClick={handleSend}
                                disabled={!input.trim()}
                                className="text-neon-green hover:text-white disabled:opacity-50"
                            >
                                <Send size={18} />
                            </button>
                        )}
                    </div>
                </div>
                <div className="text-[10px] text-[#555] mt-1 flex justify-between">
                     <span>SHIFT+ENTER for new line</span>
                     <span>{input.length} chars</span>
                </div>
            </div>
        </div>
    );
};

export default ChatInterface;
