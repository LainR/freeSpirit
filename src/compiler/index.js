const runner = require("child_process");
const nodesass = require('node-sass');
const path = require('path');
const fs = require('fs');
const marked = require('marked');


class Compiler {

    static php_Path = '';

    static compile(res, extencion, filePath) {
        switch (extencion) {
            case 'php':
                return Compiler.php(filePath);
            case 'jsx':
                return Compiler.jsx(filePath);
            case 'scss':
                res.setHeader('content-type', 'text/css');
                return Compiler.sass(filePath);
            case 'md':
                return Compiler.md(filePath);
            default:
                return Compiler.staticFile(filePath);
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

    static php(filePath) {
        return new Promise((res, rej) => {
            var php_Path = Compiler.php_Path;
            runner.exec(php_Path + ' -f ' + filePath, (err, phpResponse, stderr) => {
                if (err)
                    rej(err);
                else
                    res(phpResponse);
            });
        });
    }

    static jsx(filePath) {
        return new Promise((res, rej) => {
            runner.exec('node ' + filePath, (err, nodeResponse, stderr) => {
                if (err)
                    rej(err);
                else
                    res(nodeResponse);
            });
        });
    }

    static sass(filePath) {
        return new Promise((res, rej) => {
            nodesass.render({
                file: filePath
            }, function(err, result) {
                if (err)
                    rej(err);
                else
                    res(result.css.toString());
            });
        });
    }

    static md(filePath) {
        return new Promise((res, rej) => {
            fs.readFile(filePath, "utf8", (err, data) => {
                if (err)
                    rej(err);
                else
                    marked(data, (errM, result) => {
                        if (err)
                            rej(errM);
                        else
                            res(result);
                    });
            });
        });
    }
}

module.exports = Compiler;