package saturn

import "fmt"

type Page struct {
	Paths   []*PagePathComponent
	Content *PageContent
	Title   string
}

type PagePathComponent struct {
	Name string
	URL  string
}

func NewPagePathComponent(name, url string) *PagePathComponent {
	return &PagePathComponent{Name: name, URL: url}
}

func NewPage(title string, content *PageContent, paths []*PagePathComponent) *Page {
	return &Page{
		Title:   title,
		Content: content,
		Paths:   paths,
	}
}

func (comp *PagePathComponent) String() string {
	return fmt.Sprintf("[%v](%v)", comp.Name, comp.URL)
}
