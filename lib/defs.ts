export default {
  src: {
    titleFile: 't.txt',
    seoTitleFile: 't_seo.txt',
  },
  dest: {
    // --- markdown content ---
    contentExt: '.g.html',

    // --- file title ---
    titleExt: '.t.g.txt',
    titleHtmlExt: '.t.g.html',
    seoTitleExt: '.t_seo.g.txt',
    seoTitleHtmlExt: '.t_seo.g.html',

    // --- directory title ---
    dirTitleFile: '__dir.t.g.txt',
    dirTitleHtmlFile: '__dir.t.g.html',
    dirSeoTitleFile: '__dir.t_seo.g.txt',
    dirSeoTitleHtmlFile: '__dir.t_seo.g.html',

    // --- path bar ---
    dirPathBarFile: '__dir.path.g.html',

    // --- file list ---
    dirFileListFile: '__dir.content.g.html',
  },
  system: {
    fileFilter: (fileName: string) => {
      return /.*\.(md|json)$/i.test(fileName)
        && !fileName.startsWith('.')
        && !fileName.startsWith('_');
    },
    dirFilter: (dirName: string) => {
      return !dirName.startsWith('.')
        && !dirName.startsWith('_');
    },
  },
};
