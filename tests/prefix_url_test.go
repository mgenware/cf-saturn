package tests

import "testing"

func TestPrefixURL(t *testing.T) {
	testBuilder(t, urlPrefixBuilder, "/url-prefix")
}
