import React from "react";
import { createRoot } from "react-dom/client";
import App from "./app";
import "./style/app.less";
import * as serviceWorker from "./serviceWorker";

const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}

serviceWorker.unregister();
