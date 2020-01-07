const runner = require("child_process");
const nodesass = require('node-sass');
const path = require('path');
const fs = require('fs');


class Compiler {

    static compile(res, extencion, documento, docname, baseDir) {
        switch (extencion) {
            case 'php':
                return Compiler.php(docname, baseDir);
            case 'jsx':
                return Compiler.jsx(docname, baseDir);
            case 'scss':
                res.setHeader('content-type', 'text/css');
                return Compiler.sass(docname, baseDir);
            default:
                return Compiler.staticFile(path.join(baseDir, docname));
        }
    }


    static staticFile(filePath) {
        return new Promise((res, rej) => {
            fs.readFile(filePath, (err, stats) => {
                if (err)
                    rej(err);
                else
                    res(stats);
            });
        });
    }

    static php(docname, baseDir) {
        return new Promise((res, rej) => {
            var dir = baseDir.toString().replace(/\\/g, '/');
            var exec_doc_dir = path.join(dir, docname);
            var php_Path = 'C:/wamp64/bin/php/php7.1.22/php.exe';
            runner.exec(php_Path + ' -f ' + exec_doc_dir, (err, phpResponse, stderr) => {
                if (err)
                    rej(err);
                else
                    res(phpResponse);
            });
        });
    }

    static jsx(docname, baseDir) {
        return new Promise(() => {
            var dir = baseDir.toString().replace(/\\/g, '/')
            var exec_doc_dir = path.join(dir, docname);
            runner.exec('node ' + exec_doc_dir.trim(), (err, nodeResponse, stderr) => {
                if (err)
                    rej(err);
                else
                    res(nodeResponse);
            });
        });
    }

    static sass(docname, baseDir) {
        return new Promise((res, rej) => {
            var dir = baseDir.toString().replace(/\\/g, '/');
            var exec_doc_dir = path.join(dir, docname);
            nodesass.render({
                file: exec_doc_dir.trim()
            }, function(err, result) {
                if (err)
                    rej(err);
                else
                    res(result.css.toString());
            });
        });
    }
}

module.exports = Compiler;