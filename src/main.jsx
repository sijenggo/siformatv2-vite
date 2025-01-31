import { StrictMode, createContext, useState, useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./assets/css/index.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./assets/css/fontawesome-free-6.5.2-web/css/all.min.css";
import Home from "./pages/Home";
import Papan from "./pages/Papan";

const queryClient = new QueryClient();
export const WebSocketContext = createContext(null);

const WebSocketProvider = ({ children }) => {
    const [ws, setWs] = useState(null);
    const messageHandlerRef = useRef(null);

    useEffect(() => {
        const socket = new WebSocket("ws://192.168.3.7:93");

        socket.onopen = () => console.log("Connected to WebSocket");

        socket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (messageHandlerRef.current) {
                    messageHandlerRef.current(data);
                }
            } catch (error) {
                console.error("Error parsing WebSocket message:", error);
            }
        };

        socket.onclose = () => console.log("WebSocket Disconnected");

        setWs(socket);

        return () => socket.close();
    }, []);

    return (
        <WebSocketContext.Provider value={{ ws, setMessageHandler: (handler) => (messageHandlerRef.current = handler) }}>
            {children}
        </WebSocketContext.Provider>
    );
};

const App = () => (
    <BrowserRouter>
        <QueryClientProvider client={queryClient}> 
            <WebSocketProvider>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/papan" element={<Papan />} />
                </Routes>
            </WebSocketProvider>
        </QueryClientProvider>
    </BrowserRouter>
);

const rootElement = document.getElementById("root");
const root = createRoot(rootElement);
root.render(
    <StrictMode>
        <App /> 
    </StrictMode>
);
