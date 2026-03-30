'use client';

import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

const RAW_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
const SOCKET_URL = RAW_URL.replace(/\/api\/?$/, '');

let sharedSocket: Socket | null = null;
let refCount = 0;

function getSocket(): Socket {
    if (!sharedSocket) {
        sharedSocket = io(SOCKET_URL, {
            transports: ['websocket', 'polling'],
            reconnectionAttempts: 5,
            reconnectionDelay: 2000,
        });
    }
    refCount++;
    return sharedSocket;
}

function releaseSocket() {
    refCount--;
    if (refCount <= 0 && sharedSocket) {
        sharedSocket.disconnect();
        sharedSocket = null;
        refCount = 0;
    }
}

/**
 * Hook to listen for a specific Socket.IO event.
 * Uses a shared singleton socket connection.
 */
export function useSocket<T = any>(event: string, callback: (data: T) => void) {
    const callbackRef = useRef(callback);
    callbackRef.current = callback;

    useEffect(() => {
        const socket = getSocket();

        const handler = (data: T) => {
            callbackRef.current(data);
        };

        socket.on(event, handler);

        return () => {
            socket.off(event, handler);
            releaseSocket();
        };
    }, [event]);
}
