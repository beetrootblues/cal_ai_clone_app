import React from "react";
import ReactDOM from "react-dom/client";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import App from "./App";
import "./index.css";

const address = import.meta.env.VITE_CONVEX_URL as string | undefined;
if (!address) {
  // The Freebuff environment injects VITE_CONVEX_URL; fail loudly instead of a blank screen.
  throw new Error("VITE_CONVEX_URL is not set");
}
const convex = new ConvexReactClient(address);

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {
      /* offline support is best-effort */
    });
  });
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ConvexProvider client={convex}>
      <App />
    </ConvexProvider>
  </React.StrictMode>
);
