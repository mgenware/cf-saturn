package saturn

import (
	"errors"
	"io/ioutil"
	"net/url"
	"path/filepath"
	"strings"

	"github.com/mgenware/cf-saturn/lib"
	"github.com/mgenware/cf-saturn/manager"

	"github.com/mgenware/go-packagex/iox"
)

var (
	ErrPathNotFound = errors.New("The path you requested does not exist")
)

type Builder struct {
	RootDirectory string
	MaxWalk       int
	PrefixURL     string

	mgr *manager.Manager
}

func NewBuilder(root string) (*Builder, error) {
	absRoot, err := filepath.Abs(root)
	if err != nil {
		return nil, err
	}
	return &Builder{
		RootDirectory: absRoot,
		MaxWalk:       30,
		mgr:           manager.NewManager(root),
		PrefixURL:     "/",
	}, nil
}

func (builder *Builder) Build(path string) (*Page, error) {
	if path == "" {
		return nil, errors.New("Path must not be empty")
	}
	if !strings.HasPrefix(path, "/") {
		return nil, errors.New("Path must start with /")
	}

	// Strip the starting /
	path = path[1:]

	absPath, err := filepath.Abs(builder.absPath(path))
	if err != nil {
		return nil, err
	}

	relPath, err := builder.relPath(absPath)
	if err != nil {
		return nil, err
	}
	if lib.IsRelPathOutside(relPath) {
		// path is outside builder.RootDirectory
		return nil, errors.New("Path is outside root")
	}

	if iox.IsDirectory(absPath) {
		return builder.buildDir(relPath, absPath)
	}

	mdExt := lib.MarkdownFileExists(absPath)
	if mdExt == "" {
		return nil, ErrPathNotFound
	}
	return builder.buildFile(relPath+mdExt, absPath+mdExt)
}

func (builder *Builder) buildFile(relFile, absFile string) (*Page, error) {
	title, err := builder.mgr.TitleForFile(relFile, absFile)
	if err != nil {
		return nil, err
	}
	paths, err := builder.getParentPaths(filepath.Dir(relFile), filepath.Dir(absFile))
	if err != nil {
		return nil, err
	}

	name := filepath.Base(relFile)
	siblings, err := builder.getChildEntries(builder.getCurrentURL(paths, ""), filepath.Dir(relFile), filepath.Dir(absFile), name)
	if err != nil {
		return nil, err
	}

	return NewPage(title, NewFileContent(absFile, siblings), paths), nil
}

func (builder *Builder) buildDir(relDir, absDir string) (*Page, error) {
	title, err := builder.mgr.TitleForDirectory(relDir, absDir)
	if err != nil {
		return nil, err
	}

	var paths []*PathComponent
	isRoot := lib.IsCurrentDirectory(relDir)

	name := ""
	if !isRoot {
		name = filepath.Base(relDir)
	}

	if isRoot {
		// Return an empty path array for root directory
		paths = make([]*PathComponent, 0)
	} else {
		paths, err = builder.getParentPaths(filepath.Dir(relDir), filepath.Dir(absDir))
		if err != nil {
			return nil, err
		}
	}
	childComps, err := builder.getChildEntries(builder.getCurrentURL(paths, name), relDir, absDir, "")

	return NewPage(title, NewDirectoryContent(relDir, childComps), paths), nil
}

func (builder *Builder) getParentPaths(relDir, absDir string) ([]*PathComponent, error) {
	result, err := builder.getParentPathsInternal(relDir, absDir, 0, nil)
	if err != nil {
		return nil, err
	}

	// Reverse the result array
	for i := len(result)/2 - 1; i >= 0; i-- {
		opp := len(result) - 1 - i
		result[i], result[opp] = result[opp], result[i]
	}

	return result, nil
}

func (builder *Builder) getCurrentURL(comps []*PathComponent, suffix string) string {
	escapedName := url.PathEscape(suffix)
	if len(comps) <= 0 {
		return "/" + escapedName
	}
	return lib.JoinURL(comps[len(comps)-1].URL, escapedName)
}

func (builder *Builder) getParentPathsInternal(relDir, absDir string, walkCount int, list []*PathComponent) ([]*PathComponent, error) {
	if walkCount > builder.MaxWalk {
		return nil, errors.New("MaxWalk number has been exceeded")
	}

	if lib.IsRelPathOutside(relDir) {
		return nil, errors.New("Path is outside the root")
	}

	if list == nil {
		list = make([]*PathComponent, 0)
	}

	title, err := builder.mgr.TitleForDirectory(relDir, absDir)
	if err != nil {
		return nil, err
	}

	pathComp := NewPathComponent(filepath.Base(relDir), title, lib.FilePathToURL(relDir))
	result := append(list, pathComp)

	if lib.IsCurrentDirectory(relDir) {
		return result, nil
	}
	return builder.getParentPathsInternal(filepath.Dir(relDir), filepath.Dir(absDir), walkCount+1, result)
}

func (builder *Builder) getChildEntries(parentURL, relDir, absDir string, exclude string) ([]*PathComponent, error) {
	if lib.IsRelPathOutside(relDir) {
		return nil, errors.New("Path is outside the root")
	}
	list := make([]*PathComponent, 0)
	files, err := ioutil.ReadDir(absDir)
	if err != nil {
		return nil, err
	}

	for _, childName := range files {
		name := childName.Name()
		if name == exclude {
			continue
		}
		isValid, err := builder.isValidChild(absDir, name)
		if err != nil {
			return nil, err
		}
		if !isValid {
			continue
		}

		comp, err := builder.getPathComponent(parentURL, filepath.Join(relDir, name), filepath.Join(absDir, name))
		if err != nil {
			return nil, err
		}

		list = append(list, comp)
	}
	return list, nil
}

func (builder *Builder) getPathComponent(parentURL, relPath, absPath string) (*PathComponent, error) {
	isFile, err := iox.FileExists(absPath)
	if err != nil {
		return nil, err
	}

	var name, title string
	if isFile {
		title, err = builder.mgr.TitleForFile(relPath, absPath)
		if err != nil {
			return nil, err
		}
		name = lib.BaseWithoutExt(relPath)
	} else {
		title, err = builder.mgr.TitleForDirectory(relPath, absPath)
		if err != nil {
			return nil, err
		}
		name = filepath.Base(relPath)
	}

	URL := lib.JoinURL(parentURL, url.PathEscape(name))
	return NewPathComponent(name, title, URL), nil
}

func (builder *Builder) relPath(absPath string) (string, error) {
	return filepath.Rel(builder.RootDirectory, absPath)
}

func (builder *Builder) absPath(relPath string) string {
	return filepath.Join(builder.RootDirectory, relPath)
}

func (builder *Builder) isValidChild(parentPath, childName string) (bool, error) {
	// Directories and .md files are considered valid children
	isDir, err := iox.DirectoryExists(filepath.Join(parentPath, childName))
	if err != nil {
		return false, err
	}
	if isDir {
		return true, nil
	}

	ext := filepath.Ext(childName)
	return strings.EqualFold(ext, lib.MarkdownExtension), nil
}
