package markdown

import "strings"

func TrimTitle(title string) string {
	return strings.TrimSpace(strings.TrimLeft(title, "#"))
}
