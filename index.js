const YAML = require('yaml');
const fs = require("fs");
const util = require("util");
const promiseExec = util.promisify(require("child_process").exec);

const file = fs.readFileSync('./file.yml', 'utf8')
let res = YAML.parse(file);
const Spinnies = require("spinnies");
const spinner = {
  interval: 80,
  frames: ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"]
};
let spinnies = new Spinnies({
  color: "yellow",
  succeedColor: "green",
  spinner
});
const camelize = str => {
    return str.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, function(match, index) {
      if (+match === 0) return ""; // or if (/\s+/.test(match)) for white spaces
      return index == 0 ? match.toLowerCase() : match.toUpperCase();
    });
  };
const snakeCase = str => {
    let res = camelize(str);
    res = res.replace(/[A-Z]/g, m => "_" + m.toLowerCase());
    return res;
  };
//console.log(res);
function read (arr,indent) {
    for(let i=0;i<arr.length;i++){
        let str=indent;
        str+="+- ";
        str+=arr[i].c;
        spinnies.add(arr[i].c, {
            text: str,
            color: "gray"
          });
        //spinnies.update(snakeCase(arr[i].c),{status:"non-spinnable"});
        //console.log(str);
        if(arr[i].next)
            read(arr[i].next,i!=arr.length-1?indent+"|  ":indent+"   ");
        //spinnies.succeed(str);
    }
}
read(res,"");
const exec = async (command) => {
    spinnies.update(command.c,{status:"spinning", color:"yellow"});
        try {
            const { stdout, stderr } = await promiseExec(command.c);
            if (stderr) console.log(stderr);
            if (stdout) console.log(stdout);
            spinnies.succeed(command.c);
            //return { stdout, stderr };
          } catch (e) {
            spinnies.fail(command.c);
            console.log(e.stderr);
          }
        if(command.next)
          execCommands(command.next);
}
//spinnies.update(snakeCase(res[0].c),{status:"spinning", color:"yellow"});
const execCommands = async (arr) => {
     for(let i=0;i<arr.length;i++) {
        exec(arr[i]);
        
     }
}



execCommands(res);
