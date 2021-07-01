import runtime from "@wailsapp/runtime";
import { makeObservable, observable } from "mobx";

export interface Log {
  serviceName: string;
  message: string;
}

interface LogsService {
  logs: Log[];
}
export class LogsStore {
  public logs: Log[] = [];
  private logsStore = runtime.Store.New("Logs");

  public constructor() {
    makeObservable(this, {
      logs: observable,
    } as any);

    this.init();

    this.logsStore.subscribe((logs: LogsService) => {
      this.logs = logs.logs;
    });
  }

  private async init() {
    this.logs = (await window.backend.Logs.Get()).logs;
  }
}
