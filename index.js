var through2  = require('through2'),
    fs        = require('fs'),
    gutil     = require('gulp-util'),
    NAMESPACE = 'MicroTemplates';

module.exports = function(fileName, opts) {
    opts = opts || {};
    var pool = {},
        firstFile,
        templateRegExp = opts.excludeTemplatesPath ?
          new RegExp(opts.excludeTemplatesPath + '(.*)' + '.html') : false;

    function transform(file, enc, callback) {
        var err;
        var templateName = file.path.replace(file.cwd + '/', '');
        if (templateRegExp) {
          templateName = templateRegExp.exec(templateName) ?
            templateRegExp.exec(templateName)[1] : templateName;
        }
        pool[templateName] = file.contents.toString();
        if (!firstFile) firstFile = file;
        callback(err);
    }
    function flush(callback) {
        var err,
            namespace = opts.namespace || NAMESPACE,
            rootNode = opts.rootNode || 'this',
            contents = rootNode+'.'+namespace+'='+JSON.stringify(pool)+';';

        var output = new gutil.File({
            cwd:  firstFile.cwd,
            base: firstFile.base,
            path: firstFile.base + fileName
        });
        output.contents = new Buffer(contents);
        this.push(output);

        callback(err);
    }
    return through2.obj(transform, flush);
};
