import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

try {
  const root = document.getElementById("root");
  if (!root) {
    throw new Error("Root element not found");
  }
  createRoot(root).render(<App />);
  console.log("React app rendered successfully");
} catch (error) {
  console.error("Failed to render React app:", error);
  const errorMessage = error instanceof Error ? error.message : 'Unknown error';
  document.body.innerHTML = `<div style="padding: 20px; color: red;">Error loading application: ${errorMessage}</div>`;
}
