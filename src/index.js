import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";

import { createRoot } from "react-dom/client"; // New import in React 18

const root = createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
