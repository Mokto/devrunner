import { ConfigStore } from "./config-store";
import { LogsStore } from "./logs-store";
import { ProjectStore } from "./project-store";
import { RunnerStore } from "./runner-store";

export class RootStore {
  public projectStore = new ProjectStore();
  public configStore = new ConfigStore();
  public runnerStore = new RunnerStore();
  public logsStore = new LogsStore();
}
