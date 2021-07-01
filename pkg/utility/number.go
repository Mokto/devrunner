package utility

//Min getting minimum number
func Min(x, y uint) uint {
	if x < y {
		return x
	}
	return y
}

//Max getting maximum number
func Max(x, y uint) uint {
	if x > y {
		return x
	}
	return y
}

//MinUint32 getting minimum number
func MinUint32(x, y uint32) uint32 {
	if x < y {
		return x
	}
	return y
}

//MaxUint32 getting maximum number
func MaxUint32(x, y uint32) uint32 {
	if x > y {
		return x
	}
	return y
}
