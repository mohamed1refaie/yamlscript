const YAML = require('yaml');
const fs = require("fs");

const file = fs.readFileSync('./file2.yml', 'utf8')
let res = YAML.parse(file);
//console.log(res);
const read =  (arr,indent) => {
    for(let i=0;i<arr.length;i++){
        let str=indent;
        str+="+- ";
        str+=arr[i].c;
        console.log(str);
        if(arr[i].next)
            read(arr[i].next,i!=arr.length-1?indent+"|  ":indent+"   ");
    }
}
read(res,"");