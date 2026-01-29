
import { useRef, useEffect, useCallback, useState } from 'react';
import { WS_ENDPOINTS } from '../utils/constants';

const useTerminal = () => {
    const ws = useRef(null);
    const [status, setStatus] = useState('disconnected'); // disconnected, connecting, connected
    const onDataCallback = useRef(null);

    const connect = useCallback((onData) => {
        if (ws.current) return;
        
        onDataCallback.current = onData;
        setStatus('connecting');

        ws.current = new WebSocket(WS_ENDPOINTS.TERMINAL);

        ws.current.onopen = () => {
            console.log('Terminal WS Opened');
            setStatus('connected');
        };

        ws.current.onmessage = (event) => {
            try {
                const msg = JSON.parse(event.data);
                if (msg.type === 'output' && onDataCallback.current) {
                    onDataCallback.current(msg.data);
                }
            } catch (e) {
                console.error('Term Parse Error', e);
            }
        };

        ws.current.onclose = () => {
             console.log('Terminal WS Closed');
             setStatus('disconnected');
             ws.current = null;
        };

        ws.current.onerror = (err) => {
            console.error('Terminal WS Error', err);
            setStatus('disconnected');
        };

    }, []);

    const sendData = useCallback((data) => {
        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
            ws.current.send(JSON.stringify({ type: 'input', data }));
        }
    }, []);

    const resize = useCallback((cols, rows) => {
        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
            ws.current.send(JSON.stringify({ type: 'resize', cols, rows }));
        }
    }, []);

    const disconnect = useCallback(() => {
        if (ws.current) {
            ws.current.close();
        }
    }, []);

    useEffect(() => {
        return () => {
            disconnect();
        };
    }, [disconnect]);

    return {
        connect,
        sendData,
        resize,
        disconnect,
        status
    };
};

export default useTerminal;
