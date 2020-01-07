const path = require('path');

module.exports = {
    "port": "80",
    "default_readFile": "index.php",
    "php_Path": "C:/xampp/php/php.exe",
    "htdocs": path.resolve(__dirname, '/htdocs'),
    "max_cpus": 2
};