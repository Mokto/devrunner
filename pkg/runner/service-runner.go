package runner

import (
	"devrunner/pkg/config"
	"os"
	"os/exec"

	"github.com/fsnotify/fsnotify"
)

type ServiceRunner struct {
	runner              *Runner
	cmd                 *exec.Cmd
	watcher             *fsnotify.Watcher
	stopWatchingChannel chan bool
	service             *config.Service
	basePath            string
	IsWatching          bool `json:"isWatching"`
	IsRunning           bool `json:"isRunning"`
}

func (serviceRunner *ServiceRunner) Init() {
	go func() {
		serviceRunner.execCommand()
	}()
	if len(serviceRunner.service.WatchDirectories) > 0 {
		go func() {
			serviceRunner.watch()
		}()
	}
}

func (serviceRunner *ServiceRunner) Restart() {
	serviceRunner.Stop()
	serviceRunner.Init()
}

func (serviceRunner *ServiceRunner) Stop() {
	if serviceRunner.cmd.Process == nil {
		panic("Process is nil")
	}
	err := serviceRunner.cmd.Process.Signal(os.Kill)
	if err != nil {
		panic(err)
	}
}
