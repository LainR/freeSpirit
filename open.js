// ===================Config======================

let port = 80 //listen
let default_archive = 'index.php' //default archive to take

// =================End Config====================


let express = require('express');
let fs = require('fs');
let shell = require('shelljs');
let app = express();
const runner = require("child_process");

//Motor
(() => {
    app.get('*', async function(req, res) {
        var Directory = req.params[0].toString()
        fs.readFile('./htdocs' + Directory, async(err, stats) => {
            console.log(Directory) //debug
            switch (Directory) {
                case '/': //default archive
                    fs.readFile('./htdocs/' + default_archive, async(err, stats) => {
                        var response_complie = await open('/' + default_archive, stats)
                        res.send(response_complie)
                    });
                    break;

                default:
                    if (err != null) {
                        //error 404
                        res.send('HTTP 404 Not Found')
                    } else {
                        var response_complie = await open(Directory, stats)
                        res.send(response_complie)
                    }
                    break;
            }
        })
    });
})();

async function open(Directory, stats) {
    var Extencion = Directory.split('.')
    Extencion = Extencion[Extencion.length - 1];
    //Compilar
    var response_complie = await compile(Extencion, stats, Directory);
    return response_complie
}


//lenguajes de compilado Soportados
async function compile(Extencion, documento, docname) {
    return new Promise((res, rej) => {
        switch (Extencion) {
            case 'php':
                var dir = __dirname.toString().replace(/\\/g, '/')
                var exec_doc_dir = dir + '/htdocs' + docname
                var php_Path = 'C:/wamp64/bin/php/php7.1.22/php.exe'
                    //var code = shell.exec(php_Path + ' -f ' + exec_doc_dir)
                runner.exec(php_Path + ' -f ' + exec_doc_dir, (err, phpResponse, stderr) => {
                    if (err) console.log(err);
                    res(phpResponse);
                });
                break;

            case 'jsx':
                var dir = __dirname.toString().replace(/\\/g, '/')
                var exec_doc_dir = dir + '/htdocs' + docname
                runner.exec('node ' + exec_doc_dir.trim(), (err, nodeResponse, stderr) => {
                    if (err) console.log(err);
                    res(nodeResponse);
                });
                break;
                //Add more ....
            default:
                res(documento) //send download document
        }

    });

}

app.listen(port) // Mismo que apache
console.log("freeSpirit is Open in port:" + port)