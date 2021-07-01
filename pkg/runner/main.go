package runner

import (
	"devrunner/pkg/config"
	"devrunner/pkg/logs"
	"fmt"

	"github.com/logrusorgru/aurora"
	"github.com/wailsapp/wails"
)

type Runner struct {
	runtime  *wails.Runtime
	store    *wails.Store
	config   *config.Config
	logs     *logs.Logs
	Services map[string]*ServiceRunner `json:"services"`
}

func NewRunner(config *config.Config, logs *logs.Logs) *Runner {
	return &Runner{
		logs:     logs,
		Services: map[string]*ServiceRunner{},
		config:   config,
	}
}

func (runner *Runner) WailsInit(runtime *wails.Runtime) error {
	runner.runtime = runtime
	runner.store = runtime.Store.New("Runner", runner)

	return nil
}

func (r *Runner) InitAll(basePath string) {
	for _, service := range r.config.Services {
		r.Services[service.Name] = &ServiceRunner{
			service:  service,
			runner:   r,
			basePath: basePath,
		}
		r.Services[service.Name].Init()
	}
}

func (r *Runner) Restart(serviceName string) {
	r.Services[serviceName].Restart()
}

func (r *Runner) SetWatching(serviceName string, isWatching bool) {
	if isWatching {
		r.Services[serviceName].watch()
	} else {
		r.Services[serviceName].StopWatching()
	}
}

func (r *Runner) SetIsRunning(serviceName string, isRunning bool) {
	fmt.Println(aurora.Green(isRunning))

	if isRunning {
		r.Services[serviceName].Restart()
	} else {
		r.Services[serviceName].StopWatching()
		r.Services[serviceName].Stop()
	}
}

func (r *Runner) StopAll() {
	for _, service := range r.Services {
		service.Stop()
	}
}

func (r *Runner) Get() interface{} {
	return r.store.Get()
}

func (r *Runner) notify() {
	r.store.Set(r)
}
