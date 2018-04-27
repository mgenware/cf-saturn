package main

import (
	"bytes"
	"cf-saturn"
	"fmt"
	"html/template"
	"log"
	"net/http"
	"os"

	"github.com/mgenware/go-packagex/templatex"
)

type PageData struct {
	Title, ContentHTML, PathHTML string
}

var builder *saturn.Builder
var pathCompTemplate *template.Template
var pageTemplate *template.Template

func init() {
	// Initialize builder
	b, err := saturn.NewBuilder("./data")
	if err != nil {
		log.Fatal(err)
	}
	b.PrefixURL = "/my-lib"
	if err != nil {
		log.Fatal(err)
	}

	builder = b

	// Load templates
	pathCompTemplate = templatex.MustParseFromFile("./template/pathComp.html")
	pageTemplate = templatex.MustParseFromFile("./template/page.html")
}

func renderComps(paths []*saturn.PathComponent, newline bool) string {
	var buffer bytes.Buffer
	for _, p := range paths {
		buffer.WriteString(templatex.ExecuteToString(pathCompTemplate, p))
	}
	return buffer.String()
}

func renderPage(page *saturn.Page) string {
	pageData := &PageData{}
	pageData.Title = page.Title
	pageData.PathHTML = renderComps(page.Paths, false)

	content := page.Content
	if content.Children != nil {
		pageData.ContentHTML = renderComps(content.Children, true)
	}
	return templatex.ExecuteToString(pageTemplate, pageData)
}

func main() {
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		page, err := builder.Build(r.URL.Path)
		if err != nil {
			if os.IsNotExist(err) {
				fmt.Fprint(w, "File not found")
				return
			}
			log.Fatal(err)
		}

		w.Header().Set("Content-Type", "text/html")
		fmt.Fprint(w, renderPage(page))
	})

	log.Print(builder)
	log.Fatal(http.ListenAndServe(":8080", nil))
}
