package saturn

import (
	"cf-saturn/lib"
	"cf-saturn/manager"
	"errors"
	"go-packagex/iox"
	"io/ioutil"
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

	isFile, err := iox.IsFile(absPath)
	if err != nil {
		return nil, err
	}
	if isFile {
		return builder.buildFile(relPath, absPath)
	}
	return builder.buildDir(relPath, absPath)
}

func (builder *Builder) buildFile(relFile, absFile string) (*Page, error) {
	title, err := builder.mgr.TitleForFile(relFile, absFile)
	if err != nil {
		return nil, err
	}
	paths, err := builder.getPathComponents(filepath.Dir(relFile), filepath.Dir(absFile), 0, nil)
	if err != nil {
		return nil, err
	}

	return NewPage(title, NewFileContent(absFile), paths), nil
}

func (builder *Builder) buildDir(relDir, absDir string) (*Page, error) {
	title, err := builder.mgr.TitleForDirectory(relDir, absDir)
	if err != nil {
		return nil, err
	}
	paths, err := builder.getPathComponents(filepath.Dir(relDir), filepath.Dir(absDir), 0, nil)
	if err != nil {
		return nil, err
	}
	childComps, err := builder.getChildList(relDir, absDir)

	return NewPage(title, NewDirectoryContent(relDir, childComps), paths), nil
}

func (builder *Builder) getPathComponents(relDir, absDir string, walkCount int, list []*PathComponent) ([]*PathComponent, error) {
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

	pathComp := NewPathComponent(filepath.Base(relDir), title, builder.urlString(relDir))
	result := append(list, pathComp)

	if lib.IsRelPathTheSame(relDir) {
		return result, nil
	}
	return builder.getPathComponents(filepath.Dir(relDir), filepath.Dir(absDir), walkCount+1, result)
}

func (builder *Builder) getChildList(relDir, absDir string) ([]*PathComponent, error) {
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
		comp, err := builder.getChildComponent(filepath.Join(relDir, name), filepath.Join(absDir, name))
		if err != nil {
			return nil, err
		}

		list = append(list, comp)
	}
	return list, nil
}

func (builder *Builder) getChildComponent(relPath, absPath string) (*PathComponent, error) {
	isFile, err := iox.IsFile(absPath)
	if err != nil {
		return nil, err
	}

	var url, name, title string
	url = builder.urlString(relPath)
	name = filepath.Base(relPath)
	if isFile {
		title, err = builder.mgr.TitleForFile(relPath, absPath)
		if err != nil {
			return nil, err
		}
	} else {
		title, err = builder.mgr.TitleForDirectory(relPath, absPath)
		if err != nil {
			return nil, err
		}
	}

	return NewPathComponent(name, title, url), nil
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
