import React, { FC, memo, useContext, useEffect, useState } from "react";
import { LogsContext } from "../logs/provider";
import { ConfigContext } from "../config/provider";
import { Breadcrumb, Layout, Menu } from "antd";
import Sider from "antd/lib/layout/Sider";
import { Content } from "antd/lib/layout/layout";
import ansi2html from "ansi2html";
import { capitalizeFirstLetter } from "../utils";

export const Logs: FC = memo(() => {
  const logs = useContext(LogsContext);
  const applications = useContext(ConfigContext);
  const [activeApp, setActiveApp] = useState<string>("all");

  useEffect(() => {
    const logsContent = document.getElementById("logs-content");
    const diff =
      (logsContent?.scrollHeight || 0) -
      (logsContent?.scrollTop || 0) -
      (logsContent?.clientHeight || 0);
    if (diff < 500) {
      logsContent?.scroll(0, logsContent.scrollHeight);
    }
  }, [logs]);

  return (
    <Layout hasSider>
      <Sider width={200}>
        <Menu
          mode="inline"
          defaultSelectedKeys={["1"]}
          defaultOpenKeys={["sub1"]}
          style={{
            height: "100%",
            borderRight: 0,
          }}
          activeKey={activeApp}
          onClick={(info) => setActiveApp(info.key)}
          items={[
            {
              key: "all",
              label: "All",
            },
            ...applications.map((application) => ({
              key: application.name,
              label: capitalizeFirstLetter(application.name),
            })),
          ]}
        />
      </Sider>
      <Layout
        style={{
          padding: "0 24px 24px",
        }}
      >
        <Breadcrumb
          style={{
            margin: "16px 0",
          }}
        >
          <Breadcrumb.Item>Home</Breadcrumb.Item>
          <Breadcrumb.Item>Logs</Breadcrumb.Item>
          {activeApp !== "all" && (
            <Breadcrumb.Item>
              {capitalizeFirstLetter(activeApp)}
            </Breadcrumb.Item>
          )}
        </Breadcrumb>
        <Content>
          <div
            style={{
              background: "#001529",
              height: "100%",
              borderRadius: 3,
              overflowY: "auto",
              color: "white",
              padding: 5,
              lineHeight: 1.3,
              scrollBehavior: "smooth",
            }}
            id="logs-content"
          >
            {logs
              .filter(
                (log) => activeApp === "all" || activeApp === log.application
              )
              .map((log) => (
                <div key={log.id}>
                  <span
                    style={{
                      color: applications.find(
                        (application) => log.application === application.name
                      )?.color,
                    }}
                  >
                    [{log.application}]
                  </span>{" "}
                  <span
                    dangerouslySetInnerHTML={{ __html: ansi2html(log.message) }}
                  ></span>
                </div>
              ))}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
});
