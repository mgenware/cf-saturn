package tests

import (
	"bytes"
	saturn "cf-saturn"
	"fmt"
	"io/ioutil"
	"log"
	"path/filepath"

	"text/template"

	"github.com/mgenware/go-packagex/templatex"
)

type PageData struct {
	Title, ContentHTML, PathHTML string
}

type TBuilder struct {
	WorkingDir string

	builder          *saturn.Builder
	pathCompTemplate *template.Template
	pageTemplate     *template.Template
}

func NewTBuilder(wd string) *TBuilder {
	b := &TBuilder{
		WorkingDir: wd,
	}

	builder, err := saturn.NewBuilder(filepath.Join(wd, "data"))
	if err != nil {
		log.Fatal(err)
	}

	// Load templates
	pathCompTemplate := templatex.MustParseFromFile(filepath.Join(wd, "template/pathComp.html"))
	pageTemplate := templatex.MustParseFromFile(filepath.Join(wd, "template/page.html"))

	b.builder = builder
	b.pathCompTemplate = pathCompTemplate
	b.pageTemplate = pageTemplate

	return b
}

func (builder *TBuilder) RenderComponents(paths []*saturn.PathComponent, newline bool) string {
	var buffer bytes.Buffer
	for _, p := range paths {
		if newline {
			buffer.WriteString(fmt.Sprintf("<li>%v</li>", templatex.ExecuteToString(builder.pathCompTemplate, p)))
		} else {
			buffer.WriteString(templatex.ExecuteToString(builder.pathCompTemplate, p))
			buffer.WriteString(": ")
		}
	}
	return buffer.String()
}

func (builder *TBuilder) RenderPage(page *saturn.Page) (string, error) {
	pageData := &PageData{}
	pageData.Title = page.Title
	pageData.PathHTML = builder.RenderComponents(page.Paths, false)

	content := page.Content
	if content.IsFile {
		fileBytes, err := ioutil.ReadFile(content.Path)
		pageData.ContentHTML = string(fileBytes) + "<hr/>" + builder.RenderComponents(content.Siblings, true)
		if err != nil {
			return "", err
		}
	} else {
		pageData.ContentHTML = builder.RenderComponents(content.Children, true)
	}

	html := templatex.ExecuteToString(builder.pageTemplate, pageData)
	return html, nil
}

func (builder *TBuilder) Build(path string) (*saturn.Page, error) {
	return builder.builder.Build(path)
}
