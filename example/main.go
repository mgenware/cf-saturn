package main

import (
	"cf-saturn"
	"fmt"
	"log"
)

func main() {
	builder, err := saturn.NewBuilder("./data")
	builder.PrefixURL = "/my-lib"
	if err != nil {
		log.Fatal(err)
	}
	page, err := builder.Build("node.js/fs/readFileSync.md")
	if err != nil {
		log.Fatal(err)
	}
	fmt.Print(page)
}
