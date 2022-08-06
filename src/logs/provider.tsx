import React, {
  memo,
  FC,
  PropsWithChildren,
  useEffect,
  useReducer,
  useRef,
} from "react";
import { listen, UnlistenFn } from "@tauri-apps/api/event";

interface Log {
  message: string;
  application: string;
  id: string;
  color: string;
}

export const LogsContext = React.createContext<Log[]>([]);

function logsReducer(state: Log[], log: Log): Log[] {
  return [...state, log];
}

export const LogsProvider: FC<PropsWithChildren> = memo(({ children }) => {
  const [logs, addLog] = useReducer(logsReducer, []);
  const unlistener = useRef<UnlistenFn>();

  useEffect(() => {
    let isSubscribed = true;
    const listenLogs = async () => {
      unlistener.current = await listen<Log>("log", (event) => {
        if (isSubscribed) {
          addLog(event.payload);
        }
      });
    };
    listenLogs();
    return () => {
      isSubscribed = false;
      if (unlistener.current) {
        unlistener.current();
      }
    };
  }, []);

  return <LogsContext.Provider value={logs}>{children}</LogsContext.Provider>;
});
