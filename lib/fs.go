package lib

import (
	"bufio"
	"os"
	"path/filepath"
	"strings"

	"github.com/mgenware/go-packagex/iox"
)

const (
	TTxt              = "t.txt"
	MarkdownExtension = ".md"
)

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
	if iox.IsFile(txtPath) {
		return GetFirstLineOfFile(txtPath)
	}
	return "", nil
}

func MarkdownFileExists(file string) string {
	if iox.IsFile(file + MarkdownExtension) {
		return MarkdownExtension
	}
	if iox.IsFile(file + strings.ToUpper(MarkdownExtension)) {
		return strings.ToUpper(MarkdownExtension)
	}
	return ""
}
