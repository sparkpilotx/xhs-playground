import ReactDOM from "react-dom/client";
import React from "react";
import App from "./App";
import "./index.css";

/**
 * Initialize the React application in the renderer process.
 *
 * Creates a React root and renders the main App component wrapped in
 * StrictMode for development-time checks and warnings.
 */
ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
