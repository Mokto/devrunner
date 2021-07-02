import React from "react";
import styled, { css } from "styled-components";
// import { websocket } from "../../services/websocket";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faRedo,
  faStop,
  faPlay,
  faEye,
  faEyeSlash,
} from "@fortawesome/free-solid-svg-icons";
import { observer } from "mobx-react";
import { useConfigStore, useRunnerStore } from "../../store";

const StateContainer = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  width: 300px;
  overflow-y: auto;
  padding: 10px 5px;
`;

const Service = styled.div<{ active: boolean; disabledWatching: boolean }>`
  height: 60px;
  border: 1px solid #aaa;
  border-right: 30px solid #ff5555;
  margin-bottom: 5px;
  padding-left: 10px;

  .title {
    height: 30px;
    line-height: 30px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  ${({ active }) =>
    active &&
    css`
      border-right-color: #50fa7b;
    `}

  ${({ disabledWatching }) =>
    disabledWatching &&
    css`
      border-right-color: #ff79c6;
    `}
`;

export const State = observer(() => {
  const configStore = useConfigStore();
  const runnerStore = useRunnerStore();

  if (!configStore.config?.services) {
    return null;
  }

  return (
    <StateContainer>
      {configStore.config?.services.map((service) => {
        const serviceState = runnerStore.runner?.services[service.name];
        if (!serviceState) {
          return null;
        }
        console.log(serviceState.isRunning, serviceState.isWatching);
        return (
          <Service
            key={service.name}
            active={serviceState?.isRunning}
            disabledWatching={
              service.watchDirectories &&
              serviceState.isRunning &&
              !serviceState.isWatching
            }
          >
            <div className="title">{service.name}</div>
            {serviceState.isRunning && (
              <button
                onClick={() => {
                  runnerStore.restart(service.name);
                }}
              >
                <FontAwesomeIcon icon={faRedo} />
              </button>
            )}
            <button
              onClick={() => {
                runnerStore.toggleRunning(service.name);
              }}
            >
              {serviceState.isRunning ? (
                <FontAwesomeIcon icon={faStop} />
              ) : (
                <FontAwesomeIcon icon={faPlay} />
              )}
            </button>
            {service.watchDirectories && serviceState.isRunning && (
              <button
                onClick={() => {
                  runnerStore.toggleWatching(service.name);
                }}
              >
                {serviceState.isWatching ? (
                  <FontAwesomeIcon icon={faEyeSlash} />
                ) : (
                  <FontAwesomeIcon icon={faEye} />
                )}
              </button>
            )}
          </Service>
        );
      })}
    </StateContainer>
  );
});
