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
	if IsCurrentDirectory(path) {
		return "/"
	}
	list := strings.Split(path, string(filepath.Separator))
	var buffer bytes.Buffer
	for _, item := range list {
		buffer.WriteString("/")
		buffer.WriteString(url.PathEscape(item))
	}
	return buffer.String()
}

func JoinURL(a, b string) string {
	if a == "" {
		return b
	}
	if b == "" {
		return a
	}
	res := strings.TrimRight(a, "/")
	if b != "" {
		res += "/" + strings.TrimLeft(b, "/")
	}
	return res
}

func NameWithoutExt(file string) string {
	return strings.TrimSuffix(file, filepath.Ext(file))
}

func BaseWithoutExt(path string) string {
	return NameWithoutExt(filepath.Base(path))
}
