const YAML = require('yaml');
const fs = require("fs");

const file = fs.readFileSync('./file.yml', 'utf8')
let res = YAML.parse(file);
console.log(res);