package config

import (
	"encoding/json"
	"io/ioutil"

	"github.com/wailsapp/wails"
)

type Service struct {
	Command          string            `json:"command"`
	Name             string            `json:"name"`
	Color            string            `json:"color"`
	Cwd              string            `json:"cwd"`
	WatchDirectories []string          `json:"watchDirectories"`
	WatchExclude     []string          `json:"watchExclude"`
	Env              map[string]string `json:"env"`
}

type ConfigurationFile struct {
	Env      map[string]string `json:"env"`
	Services []*Service        `json:"services"`
}

type Config struct {
	runtime *wails.Runtime
	store   *wails.Store
	ConfigurationFile
}

func NewConfig() *Config {
	return &Config{}
}

func (config *Config) WailsInit(runtime *wails.Runtime) error {
	config.runtime = runtime

	config.store = runtime.Store.New("Config", config)

	return nil
}

func (config *Config) ReadConfigurationFile(filePath string) {
	content, err := ioutil.ReadFile(filePath)

	if err != nil {
		panic(err)
		// return errors.Wrap(err)
	}

	var configFile *ConfigurationFile
	err = json.Unmarshal(content, &configFile)
	if err != nil {
		panic(err)
		// return errors.Wrap(err)
	}

	config.Env = configFile.Env
	config.Services = configFile.Services

	config.notify()
	// return nil
}

func (config *Config) Get() interface{} {
	return config.store.Get()
}

func (config *Config) notify() {
	config.store.Set(config)
}
