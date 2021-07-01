package main

import (
	"devrunner/pkg/config"
	"devrunner/pkg/logs"
	"devrunner/pkg/project"
	"devrunner/pkg/runner"
	"devrunner/pkg/storage"
	"devrunner/pkg/ulimit"
	_ "embed"

	"github.com/wailsapp/wails"
)

//go:embed frontend/build/static/js/main.js
var js string

//go:embed frontend/build/static/css/main.css
var css string

func main() {

	ulimit.Increase()

	app := wails.CreateApp(&wails.AppConfig{
		MinWidth:  1024,
		MinHeight: 768,
		Title:     "devrunner",
		JS:        js,
		CSS:       css,
		Colour:    "#131313",
		Resizable: true,
	})

	storageState := storage.NewStorage()
	configState := config.NewConfig()
	logsState := logs.NewLogs()
	runnerState := runner.NewRunner(configState, logsState)

	app.Bind(storageState)
	app.Bind(configState)
	app.Bind(runnerState)
	app.Bind(logsState)
	app.Bind(project.NewProject(storageState, configState, runnerState))
	app.Run()
}

// window.backend.basic().then((result) => setResult(result));
