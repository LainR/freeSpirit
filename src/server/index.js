const express = require('express');
const Compiler = require('../compiler');
const fs = require('fs');
let Default_readFile = 'index.php';
const os = require("os");
const cluster = require("cluster");
const configFile = require('../../freespirit.config.js');
const path = require('path');

class FreeSpiritServer {
    constructor() {
        this.app = express();
        this.port = configFile.port;
        console.log(configFile.htdocs);
        this.currentDir = configFile.htdocs;
        const CPUS = Math.min(os.cpus().length, configFile.max_cpus);
        if (CPUS > 1) {
            switch (cluster.isMaster) {
                case true: // Cpu Control 1 Exec
                    console.clear();
                    console.log('\x1b[31m%s\x1b[0m', `
                    _____             _____     _     _
                    |   __|___ ___ ___|   __|___|_|___| |_
                    |   __|  _| -_| -_|__   | . | |  _|  _|
                    |__|  |_| |___|___|_____|  _|_|_| |_|
                                            |_|            `); //cyan
                    console.log({ cpus: CPUS, port: this.port });
                    for (let i = 0; i < CPUS; i++) { //Forge New process for Cpu
                        cluster.fork();
                    }
                    cluster.on("exit", function(worker) {
                        console.log("Worker", worker.id, " has exitted.")
                    })
                    break;
                default:
                    this.init();
                    break;
            }
        } else {
            this.init();
        }
    }

    init() {
        this.app.get('*', (req, res) => {
            var Directory = req.params[0].toString();
            console.log(Directory)
            fs.stat(path.join(this.currentDir, Directory), (err, stats) => {
                if (err) {

                } else if (stats.isDirectory()) {
                    this.sendDefaultFile(req, res);
                } else if (stats.isFile()) {
                    this.sendFile(req, res, Directory, stats);
                } else {
                    console.log('unkwon type');
                }
            });

        });
        this.app.listen(this.port, () => console.log(`Listen ${this.port}`))
    }

    send404(req, res) {
        res.status(404).send('HTTP 404 Not Found');
    }

    async sendDefaultFile(req, res) {
        fs.readFile(path.join(this.currentDir, Default_readFile), async(err, stats) => {
            if (err) {
                this.send404(req, res);
            } else {
                let response_complie = await this.open(res, Default_readFile, stats);
                res.send(response_complie);
            }
        });
    }

    async sendFile(req, res, Directory, stats) {
        let response_complie = await this.open(res, Directory, stats);
        res.send(response_complie);
    }

    async open(res, filePath, stats) {
        let extension = path.extname(filePath).substr(1);
        let response_complie = await Compiler.compile(res, extension, stats, filePath, this.currentDir);
        return response_complie;
    }

    sendInternalServerError(req, res) {
        res.status(500).send('Internal server error');
    }
}

module.exports = FreeSpiritServer;