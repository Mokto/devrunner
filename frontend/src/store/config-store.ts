import runtime from "@wailsapp/runtime";
import { makeObservable, observable } from "mobx";

interface Service {
  name: string;
  color: string;
  command: string;
  // isWatching: boolean;
  // isRunning: boolean;
  watchDirectories: string[];
}

interface Config {
  services: Service[];
}

export class ConfigStore {
  public config: Config | null = null;
  private configStore = runtime.Store.New("Config");

  public constructor() {
    makeObservable(this, {
      config: observable,
    } as any);

    this.init();

    this.configStore.subscribe((config: Config) => {
      this.config = config;
    });
  }

  private async init() {
    this.config = await window.backend.Config.Get();
  }
}
