import React from "react";

import styled from "styled-components";
import { useProjectStore } from "../../store";
import { observer } from "mobx-react";

const Container = styled.div`
  /* position: absolute;
  top: 0;
  bottom: 0;
  right: 0;
  overflow-y: scroll;
  padding: 10px 20px; */
`;

export const ProjectChooser = observer(() => {
  const { project } = useProjectStore();

  return (
    <Container>
      <button
        onClick={async () => {
          const projectFileLocation =
            await window.backend.Project.OpenFileConfiguration();
          console.log(projectFileLocation);
        }}
      >
        Load project
      </button>
      <div>
        {project?.recentProjectsFiles.map((file) => {
          return (
            <div key={file}>
              {file}
              <button
                onClick={() => {
                  window.backend.Project.SetCurrentProjectFile(file);
                }}
              >
                Choose
              </button>
            </div>
          );
        })}
      </div>
    </Container>
  );
});
