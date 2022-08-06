import React, { FC, memo, useState, useCallback } from "react";
import { Layout, Menu } from "antd";
import { Outlet } from "react-router-dom";
import { Button } from "antd";
import { invoke } from "@tauri-apps/api/tauri";

const { Header } = Layout;
export const GlobalLayout: FC = memo(() => {
  const [isRunning, setIsRunning] = useState<boolean>(false);

  const run = useCallback(async () => {
    await invoke("run");
    setIsRunning(true);
  }, []);

  const kill = useCallback(async () => {
    await invoke("kill");
    setIsRunning(false);
  }, []);

  return (
    <Layout style={{ height: "100%" }}>
      <Header className="header">
        <div
          style={{
            float: "left",
            width: "120px",
            height: "31px",
            margin: "16px 24px 16px 0",
            background: "rgba(255, 255, 255, 0.3)",
          }}
        />
        <div style={{ float: "right" }}>
          {isRunning && (
            <Button type="primary" onClick={kill}>
              Kill
            </Button>
          )}
          {!isRunning && (
            <Button type="primary" onClick={run}>
              Run
            </Button>
          )}
        </div>
        <Menu
          theme="dark"
          mode="horizontal"
          defaultSelectedKeys={["logs"]}
          items={[
            {
              key: "logs",
              label: "Logs",
            },
          ]}
        />
      </Header>
      <Outlet />
    </Layout>
  );
});
