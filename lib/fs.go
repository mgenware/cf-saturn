package lib

import (
	"bufio"
	"os"
	"path/filepath"

	"github.com/mgenware/go-packagex/iox"
)

const (
	TTxt = "t.txt"
)

func GetPathName(path string) string {
	return filepath.Base(path)
}

func GetFirstLineOfFile(file string) (string, error) {
	f, err := os.Open(file)
	if err != nil {
		return "", err
	}
	defer f.Close()

	scanner := bufio.NewScanner(f)
	if scanner.Scan() {
		return scanner.Text(), nil
	}
	if err := scanner.Err(); err != nil {
		return "", err
	}
	return "", nil
}

func GetFolderTitle(folder string) (string, error) {
	txtPath := filepath.Join(folder, TTxt)
	isFile, _ := iox.IsFile(txtPath)
	if isFile {
		return GetFirstLineOfFile(txtPath)
	}
	return "", nil
}
