// ===================Config======================

let port = 80 //listen
let Default_readFile = 'index.php' //default archive in /

// =================End Config====================

let express = require('express');
let fs = require('fs');
let app = express();
const runner = require("child_process");
const os = require("os");
const cluster = require("cluster");

//Get GlobalConfigs
fs.readFile('./config.json', async (err, stats) => {
        ClusterRun(JSON.parse(  stats.toString()  ))
})




//Motor
const ClusterRun = (GlobalConfigs)=>{
  // Cluster MultiCore Exec
    const PORT = process.env.PORT || GlobalConfigs.port
    const CPUS = os.cpus().length
    const Default_readFile = GlobalConfigs.port

    if (CPUS > 1) {
      switch (cluster.isMaster) {
        case true: // Cpu Control 1 Exec
            console.log('\x1b[31m%s\x1b[0m',`
               _____             _____     _     _
              |   __|___ ___ ___|   __|___|_|___| |_
              |   __|  _| -_| -_|__   | . | |  _|  _|
              |__|  |_| |___|___|_____|  _|_|_| |_|
                                      |_|            `);  //cyan
              console.log({cpus:CPUS,port:PORT});
              for (let i=0; i < CPUS; i++) { //Forge New process for Cpu
                cluster.fork()
              }
              cluster.on("exit", function(worker) {
                console.log("Worker", worker.id, " has exitted.")
              })
          break;
        default:
            const app = express()
            const SpiritMotor = new FreeSpiritMotor({
              process:process,
              port: PORT,
              GlobalConfigs:GlobalConfigs,
            });
            SpiritMotor.EngineRun(app,PORT,process);
          break;
      }
    }
} //end ClusterRun

class FreeSpiritMotor {
  constructor(info) {
      console.log('Spawn Motor FreeSpirt');
      this.info = info;
  }//end constructor

  async EngineRun(app,PORT,process){
      var FreeSpirt = this;
      app.get('*', async function(req, res) {
          var Express = {  respose:res,  request:req  }; //Objet Express
          var Directory = req.params[0].toString()

          //Ms to process CPU peticion
          console.time(FreeSpirt.info.process.pid); // PID Time Process

          fs.readFile('./htdocs' + Directory, async(err, stats) => {
              //console.log(Directory) //debug
              switch (Directory) {
                  case '/': //default archive
                      fs.readFile('./htdocs/' + Default_readFile, async(err, stats) => {
                          var response_complie = await FreeSpirt.open('/' + Default_readFile, stats)
                          Express.respose.send(response_complie)
                      });
                    break;

                  default:
                      if (err != null) {
                          //error 404
                          Express.respose.send('HTTP 404 Not Found')
                      } else {
                          var response_complie = await FreeSpirt.open(Directory, stats)
                          Express.respose.send(response_complie)
                      }
                    break;
              }
          })
      });
      app.listen(PORT, function () {
        console.log(`freeSpirit server listening on port ${PORT} and worker pid ${process.pid}`)
      })
  }//end EngineRun

  async open(Directory, stats) {
      var FreeSpirt = this;
      var Extencion = Directory.split('.')
      Extencion = Extencion[Extencion.length - 1];
      //Compilar
      var response_complie = await FreeSpirt.compile(Extencion, stats, Directory,FreeSpirt);
      //Get Ms response_compile
      console.log('\x1b[36m%s\x1b[0m',`${Directory}:`);
      console.timeEnd(FreeSpirt.info.process.pid);
      return response_complie
  }//end open

  async compile(Extencion, documento, docname,FreeSpirt) {
      var FreeSpirt = FreeSpirt;
      return new Promise((res, rej) => {
          switch (Extencion) {
            case 'html':
                res(documento.toString());
            break;
            case 'php':
                var dir = __dirname.toString().replace(/\\/g, '/')
                var exec_doc_dir = dir + '/htdocs' + docname
                var php_Path = FreeSpirt.info.GlobalConfigs.php_Path; // config in config.json exemple 'C:/xampp/php/php.exe'
                  runner.exec(php_Path + ' -f ' + exec_doc_dir, (err, phpResponse, stderr) => {
                      if(err){
                        rej('Error 500 php');
                        console.log(err);
                      }
                      res(phpResponse);
                  });  
             break;
            case 'jsx':
                var dir = __dirname.toString().replace(/\\/g, '/')
                var exec_doc_dir = dir + '/htdocs' + docname
                runner.exec('node ' + exec_doc_dir.trim(), (err, nodeResponse, stderr) => {
                    if(err){
                      rej('Error 500 jsx');
                      console.log(err);
                    }
                    res(nodeResponse);
                });
              break;
                  //Add more ....
            default:
                 res(documento) //send download document
              break;
          }
      });
  }//end compile
}//end class

/*
Colors in Console:
  Reset = "\x1b[0m"
  Bright = "\x1b[1m"
  Dim = "\x1b[2m"
  Underscore = "\x1b[4m"
  Blink = "\x1b[5m"
  Reverse = "\x1b[7m"
  Hidden = "\x1b[8m"

  FgBlack = "\x1b[30m"
  FgRed = "\x1b[31m"
  FgGreen = "\x1b[32m"
  FgYellow = "\x1b[33m"
  FgBlue = "\x1b[34m"
  FgMagenta = "\x1b[35m"
  FgCyan = "\x1b[36m"
  FgWhite = "\x1b[37m"

  BgBlack = "\x1b[40m"
  BgRed = "\x1b[41m"
  BgGreen = "\x1b[42m"
  BgYellow = "\x1b[43m"
  BgBlue = "\x1b[44m"
  BgMagenta = "\x1b[45m"
  BgCyan = "\x1b[46m"
  BgWhite = "\x1b[47m"
*/
