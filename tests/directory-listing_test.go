package tests

import "testing"

func TestDirectoryListing(t *testing.T) {
	testBuilder(t, defaultBuilder, "/directory-listing")
}
