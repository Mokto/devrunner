package utility

// FindIndex find index of found string a in array of string
func FindIndex(slice []string, item string) int {
	for i := range slice {
		if slice[i] == item {
			return i
		}
	}
	return -1
}

// UniqueArray return a uniq list of strings
func UniqueArray(array []string) []string {
	list := []string{}
	for _, elm := range array {
		if !Includes(list, elm) {
			list = append(list, elm)
		}
	}
	return list
}

// Includes check if array includes the string
func Includes(s []string, e string) bool {
	for _, a := range s {
		if a == e {
			return true
		}
	}
	return false
}

// IncludesInt check if array includes the int
func IncludesInt(s []int, e int) bool {
	for _, a := range s {
		if a == e {
			return true
		}
	}
	return false
}

// IncludesInt64 check if array includes the int
func IncludesInt64(s []int64, e int64) bool {
	for _, a := range s {
		if a == e {
			return true
		}
	}
	return false
}

func Remove(slice []string, item string) []string {
	index := FindIndex(slice, item)
	if index != -1 {
		return append(slice[:index], slice[index+1:]...)
	} else {
		return slice
	}
}

// GetBatches creates batches from an array
func GetBatches(array []string, batchSize int) [][]string {

	result := [][]string{}
	for i := 0; i < len(array); i += batchSize {
		j := i + batchSize
		if j >= len(array) {
			j = len(array)
		}

		result = append(result, array[i:j])
	}

	return result
}

func Intersection(s1, s2 []string) (inter []string) {
	hash := make(map[string]bool)
	for _, e := range s1 {
		hash[e] = true
	}
	for _, e := range s2 {
		// If elements present in the hashmap then append intersection list.
		if hash[e] {
			inter = append(inter, e)
		}
	}
	//Remove dups from slice.
	inter = removeDups(inter)
	return
}

//Remove dups from slice.
func removeDups(elements []string) (nodups []string) {
	encountered := make(map[string]bool)
	for _, element := range elements {
		if !encountered[element] {
			nodups = append(nodups, element)
			encountered[element] = true
		}
	}
	return
}
