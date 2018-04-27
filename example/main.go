package main

import (
	"cf-saturn"
	"fmt"
	"log"
	"net/http"
	"os"
)

var builder *saturn.Builder

func init() {
	b, err := saturn.NewBuilder("./data")
	if err != nil {
		log.Fatal(err)
	}
	b.PrefixURL = "/my-lib"
	if err != nil {
		log.Fatal(err)
	}

	builder = b
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
		content := fmt.Sprintf("<html><body><b>%v</b><br/>%v</body></html>", r.URL.Path, page)
		fmt.Fprint(w, content)
	})

	log.Print(builder)
	log.Fatal(http.ListenAndServe(":8080", nil))
}
