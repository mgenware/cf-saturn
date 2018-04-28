package lib

import (
	"bytes"
	"net/url"
	"path/filepath"
	"strings"
)

func IsRelPathOutside(path string) bool {
	return strings.HasPrefix(path, "..")
}

func IsCurrentDirectory(path string) bool {
	return path == "."
}

func FilePathToURL(path string) string {
	list := strings.Split(path, string(filepath.Separator))
	var buffer bytes.Buffer
	for _, item := range list {
		buffer.WriteString("/")
		buffer.WriteString(url.QueryEscape(item))
	}
	return buffer.String()
}
