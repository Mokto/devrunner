package runner

import (
	"fmt"
	"io/fs"
	"os"
	"path/filepath"
	"strings"
	"time"

	p "path"

	"github.com/boz/go-throttle"
	"github.com/fsnotify/fsnotify"
	"github.com/logrusorgru/aurora"
)

func (serviceRunner *ServiceRunner) isWatchAllowed(path string) bool {
	if len(serviceRunner.service.WatchExclude) == 0 {
		return true
	}

	for _, exclude := range serviceRunner.service.WatchExclude {
		if strings.Contains(path, exclude) {
			return false
		}
	}

	return true
}

func (serviceRunner *ServiceRunner) watch() {

	if serviceRunner.IsWatching {
		return
	}
	serviceRunner.IsWatching = true
	serviceRunner.runner.notify()

	serviceRunner.watcher, _ = fsnotify.NewWatcher()
	defer serviceRunner.watcher.Close()

	for _, path := range serviceRunner.service.WatchDirectories {
		filePath := p.Clean(serviceRunner.basePath + "/" + serviceRunner.service.Cwd + "/" + path)
		if err := filepath.Walk(filePath, func(path string, info fs.FileInfo, err error) error {
			if !serviceRunner.isWatchAllowed(path) {
				return nil
			}
			if info != nil && info.Mode().IsDir() {
				err := serviceRunner.watcher.Add(path)
				if err != nil {
					fmt.Println(aurora.Red(err), path)
				}
				return nil
			}
			return nil
		}); err != nil {
			fmt.Println(aurora.Red(filePath))
			panic(err)
		}
	}

	serviceRunner.stopWatchingChannel = make(chan bool)
	throttle := throttle.ThrottleFunc(time.Millisecond*100, true, func() {
		serviceRunner.runner.logs.SendLog(aurora.Yellow("Changed a file. Reloading...").String(), serviceRunner.service.Name)
		serviceRunner.Restart()
	})

	go func() {
		for {
			select {
			// watch for events
			case event := <-serviceRunner.watcher.Events:
				if event.Op == fsnotify.Create {
					fi, err := os.Stat(event.Name)
					if err != nil {
						panic(err)
					}
					if fi.IsDir() && serviceRunner.isWatchAllowed(event.Name) {
						serviceRunner.watcher.Add(event.Name)
					}
				}
				if event.Op != fsnotify.Chmod && event.Name != "" {
					throttle.Trigger()
				}

				// watch for errors
			case err := <-serviceRunner.watcher.Errors:
				if err == nil {
					return
				}
				panic(err)
			}
		}
	}()

	<-serviceRunner.stopWatchingChannel

	serviceRunner.watcher.Close()
	serviceRunner.IsWatching = false
	serviceRunner.runner.notify()
	throttle.Stop()

}

func (serviceRunner *ServiceRunner) StopWatching() {
	if serviceRunner.IsWatching {
		serviceRunner.stopWatchingChannel <- true
	}
}
