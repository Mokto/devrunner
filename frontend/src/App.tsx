import React from "react";
import { ServicesPage } from "./modules/services/page";
import { observer } from "mobx-react";
import { useProjectStore } from "./store";
import { ProjectChooser } from "./modules/project/project-chooser";

export default observer(() => {
  const { project } = useProjectStore();

  if (!project?.currentProjectFile) {
    return <ProjectChooser />;
  }

  return <ServicesPage />;
});
