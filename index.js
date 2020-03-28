#!/usr/bin/env node

const fs = require("fs");
const YAML = require('yaml');
const util = require("util");
const promiseExec = util.promisify(require("child_process").exec);
const program = require("commander");
const pckg = require("./package.json");
const os = require('os');
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
let logName;
let scriptsPath = os.homedir()+'/yamlscript/';


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

const writeLog = log => {
  fs.appendFile("_logs/" + logName, log + "\n", function(err) {
    if (err) throw err;
  });
};


function read (arr,indent,level,type=true) {
  
    for(let i=0;i<arr.length;i++){
        let str=indent;
        if(i==arr.length-1)str+='└── '
        else str+="├── ";
        str+=arr[i].c;
        if(type){
        spinnies.add(arr[i].c+""+level+""+i, {
            text: str,
            color: "gray"
          });
        } else {
          console.log(str);
        }
        if(arr[i].next)
            read(arr[i].next,i!=arr.length-1?indent+"|  ":indent+"   ",level+1,type);
    }
}

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
          } catch (e) {
            spinnies.fail(command.c+""+level+""+i);
            writeLog("command : "+`'`+command.c+`',`+" failed");
            writeLog(e.stderr);
            if(command.next)
              stopChilds(command.next,level+1)
          }
        
}

const execCommands = async (arr,level) => {
     for(let i=0;i<arr.length;i++) {
        exec(arr[i],level,i);
     }
}

const fileExists = (filename) => {
  let file;
  try{
    file = fs.readFileSync(filename, 'utf8');
    return true;
  } catch (e) {
    return false;
  }
}

const validate = (filename,print=true) => {
  let file;
  try{
    file = fs.readFileSync(filename, 'utf8')
  } catch (e) {
    if(e.code==="ENOENT"){
      console.log(`No such file by name '`+filename+`'`);
    }
    return false;
  }
  try {
    let res = YAML.parse(file);
    if(res instanceof Array){
      if(print)
        console.log("Your YAML file is valid!");
    }
    else {
      console.log("The commands in the YAML file is not in the correct format");
      return false;
    }
  } catch (e){
    console.log("The YAML file is not well formated");
    return false;
  }
  return true;
}


const load = (filename,alias)  => {
    let isValid = validate(filename,false);
    if(isValid){
      let finalFileName;
      if(alias) {
        finalFileName = alias;
      } else {
        finalFileName = filename;
      }
      if (!fs.existsSync(scriptsPath)){
        fs.mkdirSync(scriptsPath);
      }
      if(fileExists(scriptsPath+finalFileName)){
        console.log("A script with the same name is already loaded!");
        return;
      }
      let file = fs.readFileSync(filename, 'utf8');
      try{
        fs.writeFileSync(scriptsPath+finalFileName, file);
        console.log("Successfully Loaded your script.");
      }
      catch(err){
        console.log("Error: "+err);
      };
    }
}

const list = () => {
  if (!fs.existsSync(scriptsPath)){
    fs.mkdirSync(scriptsPath);
  }
  fs.readdir(scriptsPath, function(err, items) { 
    if(items==null||items.length==0) {
      console.log("There is no loaded scripts");
      return;
    }
    console.log("")
    console.log("The number of loaded scripts is "+items.length)
    for (var i=0; i<items.length; i++) {
        let index=i+1;
        console.log(index+". "+items[i]);
    }
});
}

 const display = (filename) => {
  if (!fs.existsSync(scriptsPath)){
    fs.mkdirSync(scriptsPath);
  }
  if(fileExists(scriptsPath+filename)){
    const file = fs.readFileSync(scriptsPath+filename, 'utf8')
    let res = YAML.parse(file);
    console.log("");
    read(res,"",0,false);
  } else {
    console.log(`There is no loaded script with name `+filename+` to be displayed`);
  }
 }

 const remove = (filename) => {
  if (!fs.existsSync(scriptsPath)){
    fs.mkdirSync(scriptsPath);
  }
  if(fileExists(scriptsPath+filename)){
    fs.unlinkSync(scriptsPath+filename);
    console.log('\nScript removed succussfully!');
  } else {
    console.log(`There is no loaded script with name `+filename+` to be removed`);
  }
 }

// createLog();
// const file = fs.readFileSync('./file.yml', 'utf8')
// let res = YAML.parse(file);
// read(res,"",0);
// execCommands(res,0);

program.version(pckg.version);
program.name("yamlscript");
program.usage("[command]");

program
  .command("validate <file>") // sub-command name
  .alias("val") // alternative sub-command
  .description("validate that a script in a correct yaml format") // command description

  // function to execute when command is uses
  .action(function(file) {
    validate(file);
  });

program
  .command("load <file> [alias]") // sub-command name
  .alias("l") // alternative sub-command
  .description("Load and validate a script in a yaml format") // command description

  // function to execute when command is uses
  .action(function(file,alias) {
    load(file,alias);
  });

  program
  .command("list") // sub-command name
  .alias("ls") // alternative sub-command
  .description("List all the loaded scripts") // command description

  // function to execute when command is uses
  .action(function() {
    list();
  });

  program
  .command("display <script>") // sub-command name
  .alias("d") // alternative sub-command
  .description("Display an already loaded script") // command description

  // function to execute when command is uses
  .action(function(script) {
    display(script);
  });

  program
  .command("remove <script>") // sub-command name
  .alias("rm") // alternative sub-command
  .description("Remove an already loaded script") // command description

  // function to execute when command is uses
  .action(function(script) {
    remove(script);
  });


program.parse(process.argv);
