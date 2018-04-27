package saturn

import "fmt"

type PageContent struct {
	Path     string
	Children []*PathComponent
}

func NewFileContent(path string) *PageContent {
	return &PageContent{Path: path}
}

func NewDirectoryContent(path string, children []*PathComponent) *PageContent {
	res := &PageContent{}
	res.Path = path
	res.Children = children
	return res
}

func (content *PageContent) String() string {
	if content.Children != nil {
		return fmt.Sprintf("%v: %v", content.Path, content.Children)
	}
	return fmt.Sprint(content.Path)
}
