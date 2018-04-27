package saturn

import "fmt"

type Page struct {
	Paths   []*PathComponent
	Content *PageContent
	Title   string
}

type PathComponent struct {
	Name  string
	Title string
	URL   string
}

func NewPathComponent(name, title, url string) *PathComponent {
	return &PathComponent{Name: name, Title: title, URL: url}
}

func NewPage(title string, content *PageContent, paths []*PathComponent) *Page {
	return &Page{
		Title:   title,
		Content: content,
		Paths:   paths,
	}
}

func (comp *PathComponent) String() string {
	return fmt.Sprintf("[%v](%v)", comp.Name, comp.URL)
}
