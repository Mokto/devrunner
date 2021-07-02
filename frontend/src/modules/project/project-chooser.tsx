import React from "react";

import styled, { css } from "styled-components";
import { useProjectStore } from "../../store";
import { observer } from "mobx-react";

const Container = styled.div<{ hasRecentProjectsFiles: boolean }>`
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;

  .left-box,
  .right-box {
    position: absolute;
    top: 20px;
    bottom: 20px;
    padding: 20px;
    border: 1px solid white;
  }

  .left-box {
    left: 20px;
    right: calc(50% + 20px);
    ${({ hasRecentProjectsFiles }) =>
      !hasRecentProjectsFiles &&
      css`
        right: 20px;
      `}
    text-align: center;
    padding: 10%;
    display: flex;
    justify-content: center;
    align-content: center;
    flex-direction: column;

    :hover {
      background: rgba(255, 255, 255, 0.1);
      cursor: pointer;
    }
  }

  .right-box {
    left: calc(50% + 20px);
    right: 20px;
  }

  .right-box-file {
    border: 1px solid white;
    padding: 10px;
    margin-bottom: 20px;

    > div {
      margin-top: 20px;
    }
  }
`;

export const ProjectChooser = observer(() => {
  const { project } = useProjectStore();

  return (
    <Container hasRecentProjectsFiles={!!project?.recentProjectsFiles.length}>
      <div
        className="left-box"
        onClick={async () => {
          const projectFileLocation =
            await window.backend.Project.OpenFileConfiguration();
          console.log(projectFileLocation);
        }}
      >
        <h1>Choose a file from your computer</h1>
      </div>
      {!!project?.recentProjectsFiles.length && (
        <div className="right-box">
          {project?.recentProjectsFiles.map((file) => {
            return (
              <div className="right-box-file" key={file}>
                {file}
                <div>
                  <button
                    className="big"
                    onClick={() =>
                      window.backend.Project.SetCurrentProjectFile(file)
                    }
                  >
                    Choose
                  </button>
                  <button
                    className="big"
                    onClick={() =>
                      window.backend.Project.DeleteRecentProjectFile(file)
                    }
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Container>
  );
});
