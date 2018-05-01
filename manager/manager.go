package manager

import (
	"path/filepath"
	"strings"

	"github.com/mgenware/cf-saturn/lib"
	"github.com/mgenware/cf-saturn/lib/markdown"

	"github.com/mgenware/go-packagex/iox"
)

type Manager struct {
	RootDirectory string
}

func NewManager(root string) *Manager {
	return &Manager{RootDirectory: root}
}

func (m *Manager) TitleForFile(relFile, absFile string) (string, error) {
	firstLine, err := lib.GetFirstLineOfFile(absFile)
	if err != nil {
		return "", err
	}
	return markdown.TrimTitle(firstLine), nil
}

func (m *Manager) TitleForDirectory(relDir, absDir string) (string, error) {
	title, err := lib.GetFolderTitle(absDir)
	if err != nil {
		return "", err
	}
	if title == "" {
		title = filepath.Base(relDir)
	}
	return strings.TrimSpace(title), nil
}

func (m *Manager) ContentForFile(relFile, absFile string) (string, error) {
	return iox.ReadFileText(absFile)
}

func (m *Manager) absPath(relPath string) string {
	return filepath.Join(m.RootDirectory, relPath)
}
