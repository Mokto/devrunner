package storage

import (
	"encoding/json"
	"io/ioutil"
	"os"
	"path"

	"github.com/wailsapp/wails"
)

type Storage struct {
	runtime   *wails.Runtime
	filename  string
	HomeDir   string
	SavedData map[string]interface{}
}

func NewStorage() *Storage {
	return &Storage{}
}

func (data *Storage) WailsInit(runtime *wails.Runtime) error {
	data.runtime = runtime

	homedir, err := runtime.FileSystem.HomeDir()
	if err != nil {
		return err
	}
	data.HomeDir = homedir

	data.filename = path.Join(homedir, "devrunner.json")
	data.loadFile()

	return nil
}

func (data *Storage) SetData(key string, value interface{}) error {
	data.SavedData[key] = value
	a, err := json.Marshal(data.SavedData)
	if err != nil {
		return err
	}
	return ioutil.WriteFile(data.filename, []byte(a), 0600)
}

func (data *Storage) loadFile() {
	// Check status of file
	_, err := os.Stat(data.filename)
	// If it doesn't exist
	if os.IsNotExist(err) {
		// Create it with a blank list
		ioutil.WriteFile(data.filename, []byte("{}"), 0600)
		data.SavedData = map[string]interface{}{}
	} else if err != nil {
		panic(err)
	} else {
		fileData, err := os.ReadFile(data.filename)
		if err != nil {
			panic(err)
		}
		err = json.Unmarshal(fileData, &data.SavedData)
		if err != nil {
			panic(err)
		}

	}
}
