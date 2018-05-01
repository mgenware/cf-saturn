package tests

import (
	"fmt"
	"io/ioutil"
	"log"
	"path/filepath"
	"testing"
)

var defaultBuilder *TBuilder

func init() {
	defaultBuilder = NewTBuilder()
}

func testBuilder(t *testing.T, b *TBuilder, p string) {
	got := b.BuildHTMLOrPanic(p)
	bytes, err := ioutil.ReadFile(filepath.Join(workingDir, "expected", p, "e.html"))
	if err != nil {
		log.Fatal(err)
	}
	expected := string(bytes)
	if string(expected) != got {
		t.Fatal(fmt.Sprintf("Expected %v, got %v.", expected, got))
	}
}
