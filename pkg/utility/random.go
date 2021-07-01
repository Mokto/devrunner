package utility

import (
	"math/rand"
	"time"
)

// RandomIntegerWithinRange returns a random integer between two numbers
func RandomIntegerWithinRange(min int, max int) int {
	rand.Seed(time.Now().UnixNano())
	return rand.Intn(max-min+1) + min
}
