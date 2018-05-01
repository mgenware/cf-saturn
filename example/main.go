package main

import (
	"cf-saturn"
	"cf-saturn/tests"
	"fmt"
	"log"
	"net/http"
)

var builder *tests.TBuilder

func init() {
	builder = tests.NewTBuilder()
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
		html, err := builder.RenderPage(page)
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
