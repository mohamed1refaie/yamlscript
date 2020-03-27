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

let logName;
const writeLog = log => {
  fs.appendFile("_logs/" + logName, log + "\n", function(err) {
    if (err) throw err;
  });
};
const createLog = () => {
  fs.mkdir("_logs", { recursive: true }, err => {
    if (err) throw err;
  });
  let dateTime = new Date();
  dateTime = dateTime.toISOString();
  dateTime = dateTime.replace(/-/gi, "_");
  dateTime = dateTime.replace(/:/gi, "_");
  dateTime = dateTime.replace(".", "_");
  dateTime = dateTime + "-debug.log";
  logName = dateTime;
  fs.writeFile("./_logs/" + dateTime, dateTime + "\n", { flag: "w" }, err => {
    // In case of a error throw err.
    if (err) {
      throw err;
    }
  });
};


function read (arr,indent,level) {
  
    for(let i=0;i<arr.length;i++){
        let str=indent;
        if(i==arr.length-1)str+='└── '
        else str+="├── ";
        str+=arr[i].c;
        spinnies.add(arr[i].c+""+level+""+i, {
            text: str,
            color: "gray"
          });
        //spinnies.update(snakeCase(arr[i].c),{status:"non-spinnable"});
        //console.log(str);
        if(arr[i].next)
            read(arr[i].next,i!=arr.length-1?indent+"|  ":indent+"   ",level+1);
        //spinnies.succeed(str);
    }
}
createLog();
read(res,"",0);
const stopChilds = async (arr,level) =>{
  for(let i=0;i<arr.length;i++){
    spinnies.update(arr[i].c+""+level+""+i,{status:"fail", failColor:"gray"});
    writeLog("command : "+`'`+arr[i].c+`',`+" terminated");
    if(arr[i].next)
      stopChilds(arr[i].next,level+1);
  }
}
const exec = async (command,level,i) => {
    spinnies.update(command.c+""+level+""+i,{status:"spinning", color:"yellow"});
        try {
            const { stdout, stderr } = await promiseExec(command.c);
            if (stderr) writeLog(stderr);
            if (stdout) writeLog(stdout);
            spinnies.succeed(command.c+""+level+""+i);
            writeLog("command : "+`'`+command.c+`',`+" succeed");
            if(command.next)
              execCommands(command.next,level+1);
            //return { stdout, stderr };
          } catch (e) {
            spinnies.fail(command.c+""+level+""+i);
            writeLog("command : "+`'`+command.c+`',`+" failed");
            writeLog(e.stderr);
            if(command.next)
              stopChilds(command.next,level+1)
          }
        
}
//spinnies.update(snakeCase(res[0].c),{status:"spinning", color:"yellow"});
const execCommands = async (arr,level) => {
     for(let i=0;i<arr.length;i++) {
        exec(arr[i],level,i);
        
     }
}



execCommands(res,0);
