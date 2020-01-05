const express = require('express');
const Compiler = require('../compiler');
const fs = require('fs');
const default_archive = 'index.php';

class FreeSpiritServer {
    constructor(dirProject, port = 80) {
        this.app = express();
        this.port = port;
        this.currentDir = dirProject;
        this.init();
    }

    init() {
        this.app.get('*', (req, res) => {
            var Directory = req.params[0].toString();
            fs.readFile('./htdocs' + Directory, async(err, stats) => {
                console.log(Directory) //debug
                switch (Directory) {
                    case '/': //default archive
                        this.sendDefaultFile(req, res);
                        break;
                    default:
                        if (err != null) {
                            this.send404(req, res);
                        } else {
                            this.sendFile(req, res, Directory, stats);
                        }
                        break;
                }
            })
        });
        this.app.listen(this.port, () => console.log(`Listen ${this.port}`))
    }

    send404(req, res) {
        res.status(404).send('HTTP 404 Not Found');
    }

    async sendDefaultFile(req, res) {
        fs.readFile('./htdocs/' + default_archive, async(err, stats) => {
            var response_complie = await this.open(res, '/' + default_archive, stats);
            res.send(response_complie);
        });
    }

    async sendFile(req, res, Directory, stats) {
        var response_complie = await this.open(res, Directory, stats)
        res.send(response_complie)
    }

    async open(res, Directory, stats) {
        var Extencion = Directory.split('.')
        Extencion = Extencion[Extencion.length - 1];
        var response_complie = await Compiler.compile(res, Extencion, stats, Directory, this.currentDir);
        return response_complie;
    }

    sendInternalServerError(req, res) {
        res.status(500).send('Internal server error');
    }
}

module.exports = FreeSpiritServer;