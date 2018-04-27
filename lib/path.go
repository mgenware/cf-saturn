package lib

import "strings"

func IsRelPathOutside(path string) bool {
	return strings.HasPrefix(path, "..")
}

func IsRelPathTheSame(path string) bool {
	return path == "."
}
