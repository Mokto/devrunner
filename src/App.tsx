import React, { memo } from "react";
import "antd/dist/antd.css";
import "@fontsource/cascadia-code";

import { GlobalLayout } from "./layout";
import { LogsProvider } from "./logs/provider";
import { ConfigProvider } from "./config/provider";
import { combineProviders } from "react-combine-provider";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Logs } from "./routes/logs";

const App = memo(() => {
  const StateProviders = combineProviders([ConfigProvider, LogsProvider]);

  return (
    <StateProviders>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<GlobalLayout />}>
            <Route index element={<Logs />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </StateProviders>
  );
});

export default App;
