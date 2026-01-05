import { useEffect, useState, useRef } from "react";
import useGameStoreData, { GameStoreData } from "@/app/store/gameStoreData";

// Get WebSocket URL from environment or use default
const getWebSocketUrl = (): string | null => {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL;
    if (!wsUrl) {
        console.warn("NEXT_PUBLIC_WS_URL is not set in environment variables");
        return null;
    }
    // Ensure the URL is properly formatted
    if (!wsUrl.startsWith("ws://") && !wsUrl.startsWith("wss://")) {
        console.warn("WebSocket URL must start with ws:// or wss://");
        return null;
    }
    return wsUrl;
};

export const useGameStore = (roomId: string, name: string) => {
    const setPlayers = useGameStoreData( (state: GameStoreData) => state.setPlayers);
    const setOrb = useGameStoreData( (state: GameStoreData) => state.setOrb);
    const setOrbsCollected = useGameStoreData( (state: GameStoreData) => state.setOrbsCollected);
    const players = useGameStoreData( (state: GameStoreData) => state.players);
    const setPlayers = useGameStoreData( (state: GameStoreData) => state.setPlayers);
    const setOrb = useGameStoreData( (state: GameStoreData) => state.setOrb);
    const setOrbsCollected = useGameStoreData( (state: GameStoreData) => state.setOrbsCollected);
    const players = useGameStoreData( (state: GameStoreData) => state.players);
    const [error, setError] = useState<string | null>(null);
    const wsRef = useRef<WebSocket | null>(null);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const isConnectingRef = useRef<boolean>(false);
    const isUnmountingRef = useRef<boolean>(false);

    const sendMessage = (message: object) => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify(message));
        } else {
            console.warn("WebSocket is not connected");
        }
    };
    const orbsCollected = players.map(player => player.orbsCollected).reduce((a, b) => a + b, 0);

    useEffect(() => {
        if (!roomId) return;
        
        // Ensure we're in the browser environment
        if (typeof window === "undefined") return;
        
        // Reset unmounting flag
        isUnmountingRef.current = false;
        
        // Prevent multiple connection attempts
        if (isConnectingRef.current || (wsRef.current && wsRef.current.readyState === WebSocket.CONNECTING)) {
            console.log("WebSocket connection already in progress");
            return;
        }

        const connectWebSocket = () => {
            // Don't connect if component is unmounting
            if (isUnmountingRef.current) {
                return;
            }
            
            try {
                const wsUrl = getWebSocketUrl();
                
                if (!wsUrl) {
                    setError("WebSocket URL is not configured. Please set NEXT_PUBLIC_WS_URL environment variable.");
                    return;
                }

                // Close existing connection if any
                if (wsRef.current) {
                    const existingWs = wsRef.current;
                    // Only close if not already closed or closing
                    if (existingWs.readyState === WebSocket.CONNECTING || existingWs.readyState === WebSocket.OPEN) {
                        try {
                            existingWs.close(1000, "Reconnecting");
                        } catch (error) {
                            // Ignore errors when closing (e.g., already closed)
                            console.log("Error closing existing WebSocket:", error);
                        }
                    }
                    wsRef.current = null;
                }

                isConnectingRef.current = true;
                console.log(`Attempting to connect to WebSocket: ${wsUrl}`);
                const ws = new WebSocket(wsUrl);
                wsRef.current = ws;

                ws.onopen = () => {
                    if (isUnmountingRef.current) {
                        ws.close(1000, "Component unmounting");
                        return;
                    }
                    isConnectingRef.current = false;
                    console.log(`WebSocket connected`);
                    const canvasElement = document.querySelector('canvas') as HTMLCanvasElement;
                    sendMessage({
                        type: "join",
                        roomId: roomId,
                        name,
                        height: canvasElement.height,
                        width: canvasElement.width,
                    });
                    setError(null); // Clear any previous errors on successful connection
                };

                ws.onmessage = (event) => {
                    try {
                        const data = JSON.parse(event.data);
                        if(data.type === "tick") {
                            setPlayers(data.players);
                            setOrb(data.orb);
                        }
                    } catch (error) {
                        console.error("Error parsing WebSocket message:", error);
                        setError("Error parsing WebSocket message");
                    }
                };

                ws.onerror = (error) => {
                    console.error("WebSocket error:", error);
                };

                ws.onclose = (event) => {
                    isConnectingRef.current = false;
                    console.log("WebSocket closed:", event.code, event.reason);
                    
                    // Only update ref if this is still the current WebSocket
                    if (wsRef.current === ws) {
                        wsRef.current = null;
                    }
                    
                    // Don't reconnect if component is unmounting
                    if (isUnmountingRef.current) {
                        return;
                    }
                    
                    // Set error message for non-normal closures
                    if (event.code !== 1000) {
                        let errorMessage = "WebSocket connection closed";
                        if (event.code === 1006) {
                            errorMessage = "WebSocket connection failed. Server may be unreachable.";
                        } else if (event.reason) {
                            errorMessage = `WebSocket closed: ${event.reason}`;
                        }
                        setError(errorMessage);
                        
                        // Attempt to reconnect after 3 seconds
                        reconnectTimeoutRef.current = setTimeout(() => {
                            if (!isUnmountingRef.current) {
                                console.log("Attempting to reconnect...");
                                connectWebSocket();
                            }
                        }, 3000);
                    }

                };
            } catch (error) {
                isConnectingRef.current = false;
                console.error("Failed to create WebSocket connection:", error);
                const errorMessage = error instanceof Error 
                    ? `Failed to create WebSocket connection: ${error.message}`
                    : "Failed to create WebSocket connection";
                if (!isUnmountingRef.current) {
                    setError(errorMessage);
                }
            }
        };

        connectWebSocket();

        // Cleanup function
        return () => {
            // Mark as unmounting to prevent new connections and reconnections
            isUnmountingRef.current = true;
            isConnectingRef.current = false;
            
            // Clear any pending reconnection attempts
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
                reconnectTimeoutRef.current = null;
            }
            
            // Close WebSocket if it exists
            const ws = wsRef.current;
            if (ws) {
                // Remove handlers to prevent them from running after cleanup
                ws.onopen = null;
                ws.onmessage = null;
                ws.onerror = null;
                ws.onclose = null;
                
                // Only close if not already closed
                if (ws.readyState !== WebSocket.CLOSED && ws.readyState !== WebSocket.CLOSING) {
                    try {
                        ws.close(1000, "Component unmounting");
                    } catch (error) {
                        // Ignore errors when closing
                        console.log("Error closing WebSocket during cleanup:", error);
                    }
                }
                wsRef.current = null;
            }
        };
    }, [roomId, name, setPlayers, setOrb]);

    const prevOrbsCollectedRef = useRef<number>(-1);
    const prevPlayersLengthRef = useRef<number>(0);

    useEffect(() => {
        const playersLengthChanged = prevPlayersLengthRef.current !== players.length;
        if (playersLengthChanged) {
            prevPlayersLengthRef.current = players.length;
        }

        const orbsCollectedChanged = prevOrbsCollectedRef.current !== orbsCollected;
        if (orbsCollectedChanged) {
            prevOrbsCollectedRef.current = orbsCollected;
        }
    
        if (playersLengthChanged || orbsCollectedChanged) {
            setOrbsCollected(players.map(player => ({ playerId: player.id, playerName: player.name, orbCollected: player.orbsCollected })));
        }
    }, [orbsCollected, players, setOrbsCollected]);

    useEffect(() => {
        window.addEventListener("keydown", (event) => {
            console.log(event.key);
            if (event.key === "ArrowUp") {
                sendMessage({"type":"input","seq":1,"pressed":["UP"]});
            }
            if (event.key === "ArrowDown") {
                sendMessage({"type":"input","seq":1,"pressed":["DOWN"]});
            }
            if (event.key === "ArrowLeft") {
                sendMessage({"type":"input","seq":1,"pressed":["LEFT"]});
            }
            if (event.key === "ArrowRight") {
                sendMessage({"type":"input","seq":1,"pressed":["RIGHT"]});
            }
        });
        return () => {
            window.removeEventListener("keydown", () => {});
        };
    }, []);

    const clearError = () => {
        setError(null);
    };

    return {
        sendMessage,
        error,
        clearError,
    };
};