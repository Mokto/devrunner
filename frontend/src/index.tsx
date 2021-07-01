import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import { StoreProvider } from "./store";
import * as Wails from "@wailsapp/runtime";

Wails.Init(() =>
  // eslint-disable-next-line react/no-render-return-value
  ReactDOM.render(
    <React.StrictMode>
      <StoreProvider>
        <App />
      </StoreProvider>
    </React.StrictMode>,
    document.getElementById("app")
  )
);
