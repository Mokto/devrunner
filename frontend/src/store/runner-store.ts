import runtime from "@wailsapp/runtime";
import { makeObservable, observable } from "mobx";

interface ServiceRunner {
  isWatching: boolean;
  isRunning: boolean;
}

export interface Log {
  serviceName: string;
  message: string;
}
interface Runner {
  services: { [serviceName: string]: ServiceRunner };
}

export class RunnerStore {
  public runner: Runner | null = null;
  private runnerStore = runtime.Store.New("Runner");

  public constructor() {
    makeObservable(this, {
      runner: observable,
    } as any);

    this.init();

    this.runnerStore.subscribe((runner: Runner) => {
      this.runner = runner;
    });
  }

  public async restart(serviceName: string) {
    await window.backend.Runner.Restart(serviceName);
  }

  public async toggleRunning(serviceName: string) {
    const serviceState = this.runner?.services[serviceName];
    if (!serviceState) {
      return;
    }
    serviceState.isRunning = !serviceState.isRunning;
    serviceState.isWatching = serviceState.isRunning;
    console.warn(
      "SERVICE State set to",
      serviceState.isRunning,
      serviceState.isWatching
    );
    await window.backend.Runner.SetIsRunning(
      serviceName,
      serviceState.isRunning
    );
  }

  public async toggleWatching(serviceName: string) {
    const serviceState = this.runner?.services[serviceName];
    if (!serviceState) {
      return;
    }
    serviceState.isWatching = !serviceState.isWatching;
    await window.backend.Runner.SetWatching(
      serviceName,
      serviceState.isWatching
    );
  }

  private async init() {
    this.runner = await window.backend.Runner.Get();
  }
}
