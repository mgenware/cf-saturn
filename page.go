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

type PageContent struct {
	Post string
	List []*PagePathComponent
}

func NewPostPageContent(post string) *PageContent {
	return &PageContent{Post: post}
}
func NewListPageContent(list []*PagePathComponent) *PageContent {
	return &PageContent{List: list}
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

func (content *PageContent) String() string {
	if content.List != nil {
		return fmt.Sprint(content.List)
	}
	return fmt.Sprint(content.Post)
}

func (comp *PagePathComponent) String() string {
	return fmt.Sprintf("[%v](%v)", comp.Name, comp.URL)
}
