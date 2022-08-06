import { invoke } from "@tauri-apps/api";
import { listen } from "@tauri-apps/api/event";
import React, {
  FC,
  PropsWithChildren,
  useCallback,
  useEffect,
  useState,
} from "react";
import { Application } from "../models/application";

export const ConfigContext = React.createContext<Application[]>([]);

export const ConfigProvider: FC<PropsWithChildren> = ({ children }) => {
  const [applications, setApplications] = useState<Application[]>([]);

  useEffect(() => {
    getConfig();
  }, []);

  const getConfig = useCallback(async () => {
    const applications: any[] = await invoke("get_applications");
    setApplications(applications);
  }, []);

  return (
    <ConfigContext.Provider value={applications}>
      {children}
    </ConfigContext.Provider>
  );
};
