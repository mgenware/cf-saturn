package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"

	saturn "github.com/mgenware/cf-saturn/v2"
	"github.com/mgenware/cf-saturn/v2/tests"
)

var builder *tests.TBuilder
var subdirMode bool

const subdirPath = "/sub1/sub2"

func init() {
	subdirMode = os.Getenv("subdir") != ""

	prefixURL := ""
	if subdirMode {
		prefixURL = subdirPath
	}
	builder = tests.NewTBuilder(prefixURL)
}

func main() {
	entryURL := "/"
	if subdirMode {
		entryURL = subdirPath + "/"
	}
	log.Printf("Registered router at %v", entryURL)

	// Define HTTP routers
	http.HandleFunc(entryURL, func(w http.ResponseWriter, r *http.Request) {
		path := r.URL.Path
		log.Printf("Serving %v", path)

		if subdirMode {
			path = strings.TrimPrefix(path, subdirPath)
			if path == "" {
				path = "/"
			}
		}
		page, err := builder.Build(path)
		if err != nil {
			if err == saturn.ErrPathNotFound {
				fmt.Fprint(w, "File not found")
				return
			}
			log.Fatal(err)
		}

		w.Header().Set("Content-Type", "text/html")
		html, err := builder.RenderPage(page)
		if err != nil {
			log.Fatal(err)
		}
		fmt.Fprint(w, html)
	})

	// Start the server
	port := ":8080"
	log.Print("Server starting at " + port)
	log.Fatal(http.ListenAndServe(port, nil))
}
