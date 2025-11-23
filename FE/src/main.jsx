import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// --- PERBAIKAN DI SINI ---
// Path "src/context/..." (salah) diubah menjadi "./context/..." (benar)
// Tanda "./" artinya "di folder yang sama dengan file ini"
import { ThemeProvider } from "./context/ThemeContext.jsx"; 

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </QueryClientProvider>
  </React.StrictMode>
);