package env

import "os"

func IsDevServe() bool {
	return os.Getenv("WAILS_ENV") == "dev"
}
