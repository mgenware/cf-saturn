package saturn

import "fmt"

type PageContent struct {
	Path string
}

type DirectoryPageContent struct {
	PageContent

	Children []*PagePathComponent
}

func NewFileContent(path string) *PageContent {
	return &PageContent{Path: path}
}

func NewDirectoryContent(path string, children []*PagePathComponent) *DirectoryPageContent {
	res := &DirectoryPageContent{}
	res.Path = path
	res.Children = children
	return res
}

func (content *PageContent) String() string {
	return fmt.Sprint(content.Path)
}

func (content *DirectoryPageContent) String() string {
	return fmt.Sprintf("%v: %v", content.Path, content.Children)
}
