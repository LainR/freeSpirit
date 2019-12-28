// ===================Config======================
let port = 80 //listen
let default_archive = 'index.php' //default archive to take
// =================End Config====================


let express = require('express');
let fs = require('fs');
let shell = require('shelljs');
let app = express();

//Motor
(async ()=>{
    app.get('*', function (req, res) {
      var Directory = req.params[0].toString()
      fs.readFile('./htdocs'+Directory,(err, stats) => {
          console.log(Directory) //debug
          switch (Directory) {
            case '/': //default archive
                fs.readFile('./htdocs/'+default_archive,(err, stats) => {
                    var response_complie = open('/'+default_archive,stats)
                    res.send(response_complie)
                });
            break;

            default:
                if(err != null){
                  //error 404
                  res.send('HTTP 404 Not Found')
                }else{
                  var response_complie = open(Directory,stats)
                  res.send(response_complie)
                }
            break;
          }
      })
    });
})();

function open(Directory,stats){
    var Extencion =  Directory.split('.')
    Extencion = Extencion[Extencion.length-1];
    //Compilar
    var response_complie = compile(Extencion,stats,Directory);
    return response_complie
}


//lenguajes de compilado Soportados
function compile(Extencion,documento,docname){
  switch (Extencion) {

    case 'php':
        var dir = __dirname.toString().replace(/\\/g,'/')
        var exec_doc_dir = dir+'/htdocs'+docname
        var php_Path = 'C:/xampp/php/php'
        var code = shell.exec(php_Path+' -f '+exec_doc_dir)
        return code.stdout;
      break;

    //Add more ....
    default:
        return Buffer.from(documento).toString('base64') //download document
      break;
  }
}

app.listen(port)// Mismo que apache
console.log("freeSpirit is Open in port:"+port)
