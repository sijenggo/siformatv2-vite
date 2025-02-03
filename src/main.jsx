import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./assets/css/index.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./assets/css/fontawesome-free-6.5.2-web/css/all.min.css";
import Home from "./pages/Home";
import Papan from "./pages/Papan";
import Admin from "./pages/Admin";

const queryClient = new QueryClient();

const App = () => (
    <BrowserRouter basename="/siformat">
        <QueryClientProvider client={queryClient}> 
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/papan" element={<Papan />} />
                <Route path="/admin" element={<Admin />} />
            </Routes>
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
