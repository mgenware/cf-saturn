package main

import (
	"bytes"
	"cf-saturn"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"text/template"

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
		if newline {
			buffer.WriteString(fmt.Sprintf("<li>%v</li>", templatex.ExecuteToString(pathCompTemplate, p)))
		} else {
			buffer.WriteString(templatex.ExecuteToString(pathCompTemplate, p))
			buffer.WriteString(": ")
		}
	}
	return buffer.String()
}

func renderPage(page *saturn.Page) (string, error) {
	pageData := &PageData{}
	pageData.Title = page.Title
	pageData.PathHTML = renderComps(page.Paths, false)

	content := page.Content
	if content.IsFile {
		fileBytes, err := ioutil.ReadFile(content.Path)
		pageData.ContentHTML = string(fileBytes) + "<hr/>" + renderComps(content.Siblings, true)
		if err != nil {
			return "", err
		}
	} else {
		pageData.ContentHTML = renderComps(content.Children, true)
	}

	html := templatex.ExecuteToString(pageTemplate, pageData)
	return html, nil
}

func main() {
	// Define HTTP routers
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		path := r.URL.Path
		log.Printf("Serving %v", path)

		page, err := builder.Build(path)
		if err != nil {
			if err == saturn.ErrPathNotFound {
				fmt.Fprint(w, "File not found")
				return
			}
			log.Fatal(err)
		}

		w.Header().Set("Content-Type", "text/html")
		html, err := renderPage(page)
		if err != nil {
			log.Fatal(err)
		}
		fmt.Fprint(w, html)
	})

	// Start the server
	log.Print(builder)
	port := ":8080"
	log.Print("Server starting at " + port)
	log.Fatal(http.ListenAndServe(port, nil))
}
