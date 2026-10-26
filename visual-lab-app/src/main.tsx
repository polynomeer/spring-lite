import React from "react";
import ReactDOM from "react-dom/client";
import { Shell } from "./app/Shell";
import "./styles.css";
import "./theme/theme.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Shell />
  </React.StrictMode>
);
