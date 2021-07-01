package logs

import (
	"github.com/wailsapp/wails"
)

type Log struct {
	ServiceName string `json:"serviceName"`
	Message     string `json:"message"`
}

type Logs struct {
	runtime *wails.Runtime
	store   *wails.Store
	Logs    []Log `json:"logs"`
}

func NewLogs() *Logs {
	return &Logs{
		Logs: []Log{},
	}
}

func (r *Logs) WailsInit(runtime *wails.Runtime) error {
	r.runtime = runtime
	r.store = runtime.Store.New("Logs", r)

	return nil
}

func (r *Logs) SendLog(message string, serviceName string) {
	r.Logs = append(r.Logs, Log{
		Message:     message,
		ServiceName: serviceName,
	})
	r.notify()
}

func (r *Logs) ClearLogs() {
	r.Logs = []Log{}
	r.notify()
}

func (r *Logs) Get() interface{} {
	return r.store.Get()
}

func (r *Logs) notify() {
	r.store.Set(r)
}
