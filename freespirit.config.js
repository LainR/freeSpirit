const path = require('path');

module.exports = {
    "port": 8080,
    "default_readFile": "index.php",
    "php_Path": "C:/wamp64/bin/php/php7.2.10/php.exe",
    "htdocs": path.join(__dirname, '/htdocs'),
    "max_cpus": 2
};