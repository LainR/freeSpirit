const express = require('express');
const Compiler = require('../compiler');
const fs = require('fs');
const os = require("os");
const cluster = require("cluster");
const configFile = require('../../freespirit.config.js');
const path = require('path');
const bodyParser = require('body-parser');
const compression = require('compression');
const http = require('http');
const https = require('https');
http.globalAgent.maxSockets = Infinity;
https.globalAgent.maxSockets = Infinity;
const DEFAULT_CONFIG = {
    "port": 80,
    "default_readFile": "index.php",
    "php_Path": "php",
    "htdocs": path.join(__dirname, '/htdocs'),
    "max_cpus": 2
};

class FreeSpiritServer {
    constructor() {
        this.config = Object.assign({}, DEFAULT_CONFIG, configFile);
        Compiler.php_Path = this.config.php_Path;
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
                    console.log({ cpus: CPUS, port: this.config.port });
                    for (let i = 0; i < CPUS; i++) { //Forge New process for Cpu
                        cluster.fork();
                    }
                    process.on("SIGHUP", function () {//for nodemon
                        for (const worker of Object.values(cluster.workers)) {
                            worker.process.kill("SIGTERM");
                        }
                    });
                    cluster.on("exit", function(worker) {
                        console.log("Worker", worker.id, " has exitted.")
                    });
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
        this.app = express();
        this.app.use(bodyParser.urlencoded({ extended: false }))
        this.app.use(bodyParser.json());
        this.app.use(compression());
        this.app.get('*', (req, res) => {
            let pathReq = req.params[0].toString();
            console.log(pathReq);
            //res.setHeader('Cache-Control', 'public, max-age=86400'); cahe example
            fs.stat(path.join(this.config.htdocs, pathReq), (err, stats) => {
                if (err) {
                    this.send404(req, res);
                } else if (stats.isDirectory()) {
                    this.sendDefaultFile(req, res, pathReq);
                } else if (stats.isFile()) {
                    this.sendFile(req, res, pathReq);
                } else {
                    this.send404(req, res);
                }
            });
        });
        this.app.listen(this.config.port, () => console.log(`Listen ${this.config.port}`));
    }

    send404(req, res) {
        res.status(404).send('HTTP 404 Not Found');
    }

    async sendDefaultFile(req, res, pathDir) {
        fs.stat(path.join(this.config.htdocs, pathDir ,this.config.default_readFile), async(err, stats) => {
            try {
                if (err) {
                    this.send404(req, res);
                } else if (stats.isFile()) {
                    let response_complie = await this.open(res, path.join(this.config.htdocs, pathDir ,this.config.default_readFile));
                    res.send(response_complie);
                } else {
                    this.send404(req, res);
                }
            } catch (exc) {
                console.error(exc);
                this.sendInternalServerError(req, res, exc);
            }
        });
    }

    async sendFile(req, res, filePath) {
        try {
            let response_complie = await this.open(res, path.join(this.config.htdocs, filePath));
            res.send(response_complie);
        } catch (exc) {
            console.error(exc);
            this.sendInternalServerError(req, res, exc);
        }
    }

    async open(res, filePath) {
        let extension = path.extname(filePath).substr(1);
        let response_complie = await Compiler.compile(res, extension, filePath);
        return response_complie;
    }

    sendInternalServerError(req, res, err) {
        res.status(500).send('Internal server error ' + JSON.stringify(err));
    }
}

module.exports = FreeSpiritServer;