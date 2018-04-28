package saturn

import "fmt"

type PageContent struct {
	IsFile   bool
	Path     string
	Siblings []*PathComponent
	Children []*PathComponent
}

func NewFileContent(path string, siblings []*PathComponent) *PageContent {
	return &PageContent{
		Path:     path,
		IsFile:   true,
		Siblings: siblings,
	}
}

func NewDirectoryContent(path string, children []*PathComponent) *PageContent {
	res := &PageContent{
		Path:     path,
		IsFile:   false,
		Children: children,
	}
	return res
}

func (content *PageContent) String() string {
	if content.Children != nil {
		return fmt.Sprintf("%v: %v", content.Path, content.Children)
	}
	return fmt.Sprint(content.Path)
}
