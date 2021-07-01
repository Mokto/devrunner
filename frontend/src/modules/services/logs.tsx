import React, { useCallback, useLayoutEffect } from "react";
import { default as AnsiUp } from "ansi_up";
import { observer } from "mobx-react";
import styled from "styled-components";
import { useConfigStore, useLogsStore } from "../../store";
import { Log } from "../../store/runner-store";

const LogsContainer = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 300px;
  right: 0;
  overflow-y: scroll;
  padding: 10px 20px;
`;

const ansi_up = new AnsiUp();
ansi_up.use_classes = true;

interface Service {
  name: string;
  color: string;
  command: string;
  isWatching: boolean;
  isRunning: boolean;
  watchDirectories: string[];
}

interface LogData {
  message: string;
  service: Service;
}

export const Logs = observer(() => {
  const { logs } = useLogsStore();
  const configStore = useConfigStore();

  useLayoutEffect(() => {
    const logsElement = document.getElementById("logs");
    if (logsElement) {
      logsElement.scrollTop = logsElement?.scrollHeight;
    }
  }, [logs]);

  const applyPrefix = useCallback(
    (log: Log) => {
      const service = configStore.config?.services.find(
        (s) => s.name === log.serviceName
      );
      return (
        <>
          <span
            style={{ display: "inline-block", width: 200 }}
            className={`ansi-${service?.color}-fg`}
          >
            [{log.serviceName}]
          </span>
          {" - "}
          <span
            dangerouslySetInnerHTML={{
              __html: ansi_up.ansi_to_html(log.message),
            }}
          ></span>
        </>
      );
    },
    [configStore.config?.services]
  );

  if (!logs) {
    return null;
  }

  return (
    <LogsContainer id="logs">
      {logs.map((log, index) => {
        return <div key={index}>{applyPrefix(log)}</div>;
      })}
    </LogsContainer>
  );
});
