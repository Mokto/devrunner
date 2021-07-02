package project

import (
	"devrunner/pkg/config"
	"devrunner/pkg/env"
	"devrunner/pkg/runner"
	"devrunner/pkg/storage"
	"devrunner/pkg/utility"
	"strings"

	"github.com/wailsapp/wails"
)

type Project struct {
	runtime             *wails.Runtime
	store               *wails.Store
	storage             *storage.Storage
	config              *config.Config
	runner              *runner.Runner
	CurrentProjectFile  string   `json:"currentProjectFile"`
	RecentProjectsFiles []string `json:"recentProjectsFiles"`
}

func NewProject(storage *storage.Storage, config *config.Config, runner *runner.Runner) *Project {
	return &Project{
		storage: storage,
		config:  config,
		runner:  runner,
	}
}

func (p *Project) WailsInit(runtime *wails.Runtime) error {
	p.runtime = runtime

	p.RecentProjectsFiles = []string{}
	if p.storage.SavedData["RecentProjectsFiles"] != nil {
		for _, val := range p.storage.SavedData["RecentProjectsFiles"].([]interface{}) {
			p.RecentProjectsFiles = append(p.RecentProjectsFiles, val.(string))
		}
	}

	p.store = runtime.Store.New("Project", p)

	return nil
}

func (p *Project) OpenFileConfiguration() string {
	file := p.runtime.Dialog.SelectFile("Select your configuration file", "*.json")
	if env.IsDevServe() {
		file = p.storage.HomeDir + "/Projects/platforms/.services.json"
	}
	p.SetCurrentProjectFile(file)
	return p.CurrentProjectFile
}

func (p *Project) SetCurrentProjectFile(file string) {
	p.CurrentProjectFile = file
	if !utility.Includes(p.RecentProjectsFiles, p.CurrentProjectFile) {
		p.RecentProjectsFiles = append(p.RecentProjectsFiles, p.CurrentProjectFile)
		p.storage.SetData("RecentProjectsFiles", p.RecentProjectsFiles)
	}
	p.config.ReadConfigurationFile(p.CurrentProjectFile)
	p.runner.InitAll(file[:strings.LastIndex(file, "/")])

	p.notify()
}

func (p *Project) DeleteRecentProjectFile(file string) {
	if utility.Includes(p.RecentProjectsFiles, file) {
		p.RecentProjectsFiles = utility.Remove(p.RecentProjectsFiles, file)
		p.storage.SetData("RecentProjectsFiles", p.RecentProjectsFiles)
	}

	p.notify()
}

func (p *Project) Get() interface{} {
	return p.store.Get()
}

func (p *Project) notify() {
	p.store.Set(p)
}
