import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css"; // Main styles for the popup
import App from "./App"; // Corrected import path if App.tsx is in the same folder

const rootElement = document.getElementById("root");

if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
} else {
  console.error(
    "Failed to find the root element. Popup UI will not be rendered.",
  );
}
