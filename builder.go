package saturn

import (
	"cf-saturn/lib"
	"cf-saturn/manager"
	"errors"
	"go-packagex/iox"
	"path"
	"path/filepath"
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

func (builder *Builder) Build(relPath string) (*Page, error) {
	absPath, err := filepath.Abs(builder.absPath(relPath))
	if err != nil {
		return nil, err
	}

	relPath, err = builder.relPath(absPath)
	if err != nil {
		return nil, err
	}
	if lib.IsRelPathOutside(relPath) {
		// path is outside builder.RootDirectory
		return nil, errors.New("Path is outside root")
	}

	if isFile, _ := iox.IsFile(absPath); isFile {
		return builder.buildFile(relPath, absPath)
	}
	return nil, errors.New("NOT SUPPORTED")
}

func (builder *Builder) buildFile(relFile, absFile string) (*Page, error) {
	title, err := builder.mgr.TitleForFile(relFile, absFile)
	if err != nil {
		return nil, err
	}
	content, err := builder.mgr.ContentForFile(relFile, absFile)
	if err != nil {
		return nil, err
	}
	paths, err := builder.getPathComponents(filepath.Dir(relFile), filepath.Dir(absFile), 0, nil)
	if err != nil {
		return nil, err
	}

	return NewPage(title, NewPostPageContent(content), paths), nil
}

func (builder *Builder) getPathComponents(relDir, absDir string, walkCount int, list []*PagePathComponent) ([]*PagePathComponent, error) {
	if walkCount > builder.MaxWalk {
		return nil, errors.New("MaxWalk number has been exceeded")
	}

	if lib.IsRelPathOutside(relDir) {
		return nil, errors.New("Path is outside the root")
	}

	if list == nil {
		list = make([]*PagePathComponent, 0)
	}

	title, err := builder.mgr.TitleForDirectory(relDir, absDir)
	if err != nil {
		return nil, err
	}

	pathComp := NewPagePathComponent(title, builder.urlString(relDir))
	result := append(list, pathComp)

	if lib.IsRelPathTheSame(relDir) {
		return result, nil
	}
	return builder.getPathComponents(filepath.Dir(relDir), filepath.Dir(absDir), walkCount+1, result)
}

func (builder *Builder) relPath(absPath string) (string, error) {
	return filepath.Rel(builder.RootDirectory, absPath)
}

func (builder *Builder) absPath(relPath string) string {
	return filepath.Join(builder.RootDirectory, relPath)
}

func (builder *Builder) urlString(relPath string) string {
	return path.Join(builder.PrefixURL, relPath)
}
