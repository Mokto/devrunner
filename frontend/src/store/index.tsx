import React, { FC } from "react";
import { RootStore } from "./root-store";

const storeContext = React.createContext<RootStore | null>(null);

export const StoreProvider: FC = ({ children }) => {
  const store = new RootStore();
  return (
    <storeContext.Provider value={store}>{children}</storeContext.Provider>
  );
};

const useStore = (): RootStore => {
  const store = React.useContext(storeContext);
  if (!store) {
    // this is especially useful in TypeScript so you don't need to be checking for null all the time
    throw new Error("useStore must be used within a StoreProvider.");
  }
  return store;
};

export const useProjectStore = () => {
  const rootStore = useStore();
  return rootStore.projectStore;
};

export const useConfigStore = () => {
  const rootStore = useStore();
  return rootStore.configStore;
};

export const useRunnerStore = () => {
  const rootStore = useStore();
  return rootStore.runnerStore;
};

export const useLogsStore = () => {
  const rootStore = useStore();
  return rootStore.logsStore;
};
