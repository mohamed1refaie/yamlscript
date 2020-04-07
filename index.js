#!/usr/bin/env node

const fs = require("fs");
const YAML = require('yaml');
const util = require("util");
const promiseExec = util.promisify(require("child_process").exec);
const program = require("commander");
const pckg = require("./package.json");
const os = require('os');
const prompt = require('prompt');
let Mutex = require('async-mutex').Mutex;
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
let property = {
  name: 'yesno',
  message: 'Do you want to replace the current loaded script with the new one?  (y/n)',
  validator: /y|Y[es]*|n|N[o]?/,
  warning: 'Must respond yes(y) or no(n)',
};
let logName;
let scriptsPath = os.homedir()+'/yamlscript/';
const mutex = new Mutex();


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
  mutex
    .acquire()
    .then(function(release) {
      let fileLog=`-----------------------------------------------------------\n`+log+`\n`;
      fs.appendFile("_logs/" + logName, fileLog, function(err) {
        if (err) throw err;
        release();
      });
    })
  
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
    spinnies.update(arr[i].c+""+level+""+i,{status:"fail", failColor:"gray", text:spinnies.spinners[arr[i].c+""+level+""+i].text+"  (terminated)"});
    writeLog("command : "+`'`+arr[i].c+`',`+" terminated");
    if(arr[i].next)
      stopChilds(arr[i].next,level+1);
  }
}

const exec = async (command,level,i) => {
    spinnies.update(command.c+""+level+""+i,{status:"spinning", color:"yellow"});
        let log="";
        try {
            const { stdout, stderr } = await promiseExec(command.c);
            if (stderr) log+=stderr;
            if (stdout) log+=stdout;
            spinnies.succeed(command.c+""+level+""+i);
            log+="command : "+`'`+command.c+`',`+" succeed";
            writeLog(log);
            if(command.next)
              execCommands(command.next,level+1);
          } catch (e) {
            spinnies.fail(command.c+""+level+""+i);
            log+=e.stderr;
            log+="command : "+`'`+command.c+`',`+" failed";
            writeLog(log);
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
        finalFileName = finalFileName.split('/');
        finalFileName = finalFileName[finalFileName.length-1];
      }
      if (!fs.existsSync(scriptsPath)){
        fs.mkdirSync(scriptsPath);
      }
      if(fileExists(scriptsPath+finalFileName)){
        console.log("A script with the same name is already loaded!");
        prompt.start();
        prompt.get(property, function (err, result) {
          if(result.yesno.toLowerCase()=='y'||result.yesno.toLowerCase()=='yes') {
            let file = fs.readFileSync(filename, 'utf8');
            try{
              fs.writeFileSync(scriptsPath+finalFileName, file);
              console.log("Successfully Loaded your script with name "+finalFileName);
            }
            catch(err){
              console.log("Error: "+err);
            };
          }
        });
        
      } else {
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

 const run = (filename) => {
  if (!fs.existsSync(scriptsPath)){
    fs.mkdirSync(scriptsPath);
  }
  if(fileExists(scriptsPath+filename)){
    createLog();
    console.log(`you can find a complete log for this run at ./_logs/`+logName)
    const file = fs.readFileSync(scriptsPath+filename, 'utf8')
    let res = YAML.parse(file);
    read(res,"",0);
    execCommands(res,0);
  } else {
    console.log(`There is no loaded script with name `+filename);
  }
 }

 const make = (commands) => {
   let text='';
   if(commands) {
     for(let i=0;i<commands.length;i++){
       text+= '- c : '+commands[i];
       if(i!==commands.length-1)text+='\n';
     }
   }
   text+=`
# - c : git clone https://github.com/<someuser>/<somerepo>.git <somename>
#   next :
#     - c : cd <somename> && npm install
#       next:
#         - c : cd <somename> && mkdir <dummyname>
#           next :
#             - c : cd <somename> && git remote set-url origin <someurl>
#               next :
#                 - c : npm start
#                 - c : cd <somename> && git add . && git commit -m 'initial commit' && git push
#                 - c : cd <somename>/<dummyname> && touch <someotherfile>
#         - c : cd <somename> && mkdir <anotherdummyname>
#           next:
#             - c : cp package.json <somename>/<anotherdummyname>/<myfile>
#     - c : cd <somename> && touch <somefile>
# - c : git clone https://github.com/<someuser>/<someotherrepo>.git <someothername>
#   next:
#     - c : cd <someothername> && composer install
#       next : 
#         - c : cd <someothername> && cp .env.example .env
#           next : 
#             - c : cd <someothername> && php artisan migrate
#             - c : cd <someothername> && mkdir <somefolder>
#             - c : cd <someothername> && touch <somefile>
   `;
   fs.writeFileSync("./dummyscript.yaml", text + "\n", { flag: "w" });
   console.log('A new script is found in ./dummyscript.yaml')
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
  .command("run <script>") // sub-command name
  .alias("r") // alternative sub-command
  .description("Run an already loaded script") // command description

  // function to execute when command is uses
  .action(function(script) {
    run(script);
  });

  program
  .command("remove <script>") // sub-command name
  .alias("rm") // alternative sub-command
  .description("Remove an already loaded script") // command description

  // function to execute when command is uses
  .action(function(script) {
    remove(script);
  });

  program
  .command("make [commands...]") // sub-command name
  .alias("m") // alternative sub-command
  .description("Create an initial dummy yaml script, or a script with the commands if provided") // command description

  // function to execute when command is uses
  .action(function(commands) {
    make(commands);
  });


program.parse(process.argv);
