import runtime from "@wailsapp/runtime";
import { makeObservable, observable } from "mobx";

interface Project {
  currentProjectFile: string;
  recentProjectsFiles: string[];
}

export class ProjectStore {
  public project: Project | null = null;
  private projectStore = runtime.Store.New("Project");

  public constructor() {
    makeObservable(this, {
      project: observable,
    } as any);

    this.init();

    this.projectStore.subscribe((project: Project) => {
      this.project = project;
    });
  }

  private async init() {
    this.project = await window.backend.Project.Get();
  }
}
