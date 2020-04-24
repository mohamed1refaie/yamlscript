# yamlscript

<p align="center">
  <img width="250" height="205" src="https://user-images.githubusercontent.com/24723240/79042606-78ae8d80-7bf9-11ea-96c2-7d66c3febbab.png">
</p>

<p align="center">
   <a href="https://github.com/mohamed1refaie/yamlscript">
      <img src="https://img.shields.io/npm/v/yamlscript" alt="npm version">
   </a>
   <a href="https://www.npmjs.com/package/yamlscript">
      <img src="https://img.shields.io/bundlephobia/min/yamlscript" alt="npm bundle size (minified)">
   </a>
    <a href="https://www.npmjs.com/package/yamlscript">
      <img src="https://img.shields.io/npm/dt/yamlscript" alt="npm downloads">
   </a>
  <a href="https://github.com/mohamed1refaie/yamlscript/issues">
      <img src="https://img.shields.io/github/issues/mohamed1refaie/yamlscript" alt="Github issues">
   </a>
  <a href="https://github.com/mohamed1refaie/yamlscript/blob/master/LICENSE">
      <img src="https://img.shields.io/github/license/mohamed1refaie/yamlscript" alt="GitHub license">
   </a>
   
</p>

An easy to use npm package that lets you write and run command line scripts in a yaml format. You can define which commands run in series and which commands run in parallel.

It let you load scripts to be used again and also creates a log file for each run for tracking.

## Installation

`npm i -g yamlscript`

## Script Format

You have to write the commands in a yaml format as a list of dictionaries, where the value of a key named `c` (required) of each dictionary is the command, value of a key named `title` (optional) is the title of the command, and the value of a key named `next` (optional) is the next set of commands that will be excuted after the command finishes.

**Example of the yaml script file**

```YAML
- c : mkdir <somefolder>
  title : Making a directory named <somefolder>
- c : git clone https://github.com/<someuser>/<someNodeRepo>.git <somename>
  title : Cloning a node repo in a folder named <somename>
  next :
    - c : cd <somename> && npm install
      title : Installing node dependencies
      next:
        - c : cd <somename> && mkdir <dummyname>
          title : Making a directory named <dummyname>
          next :
            - c : cd <somename> && git remote set-url origin <someurl>
              title : Changing the remote of the node repo
              next :
                - c : touch <file.txt>
                  title : Creating <file.txt>
                - c : cd <somename> && git add . && git commit -m 'initial commit' && git push
                  title : Commit and push
                - c : cd <somename>/<dummyname> && touch <someotherfile>
                  title : Creating a file named <someotherfile>
        - c : cd <somename> && mkdir <anotherdummyname>
          title : Making a directory named <anotherdummyname>
          next:
            - c : cp package.json <somename>/<anotherdummyname>/<myfile>
              title : Copying a package.json into <myfile>
    - c : cd <somename> && touch <somefile>
      title : Making a file named <somefile>
- c : git clone https://github.com/<someuser>/<somePhpRepo>.git <someothername>
  next:
    - c : cd <someothername> && composer install
      next : 
        - c : cd <someothername> && cp .env.example .env
          next : 
            - c : cd <someothername> && php artisan migrate
            - c : cd <someothername> && mkdir <somefolder>
            - c : cd <someothername> && touch <somefile>
```

The commands will be executed in the following order
![flow](https://user-images.githubusercontent.com/24723240/79046723-e0250700-7c12-11ea-910d-6555d353a793.jpg)

## Usage

### - Initialize a script `yamlscript make [commands...]`

Creates an initial yaml script under the name of script.yaml, or a script with the commands if provided.

**Example:** `yamlscript make` or `yamlscript make "git clone <myrepourl>" "mkdir folder"`

### - Load a script `yamlscript load <script> [alias]`

Validates the script first then loads the script to be used later, it will be loaded under the alias name if provided if not it will be loaded under the script file name.

**Example:** `yamlscript load script.yaml` or `yamlscript load script.yaml myscript`

### - Run a script `yamlscript run <script>`

Run an already loaded script, or a quick run without the script being loaded by typing the path of the script.

**Example:** `yamlscript run myscript` or `yamlscript run ./script.yaml`

![executing example](https://user-images.githubusercontent.com/24723240/79808272-9f916000-836d-11ea-9cc0-467006734921.gif)

### - Display a script `yamlscript display <script>`

Display an already loaded script.

**Example:** `yamlscript display myscript` or `yamlscript d myscript`

![displayscript](https://user-images.githubusercontent.com/24723240/79808528-5988cc00-836e-11ea-81e8-3bdf33674060.png)

### - Validate a script `yamlscript validate <script>`

Validate that a script in a correct Yaml format without loading it.

**Example:** `yamlscript validate script.yaml` or `yamlscript val script.yaml`

### - Remove a script `yamlscript remove <script>`

Remove an already loaded script.

**Example:** `yamlscript remove myscript` or `yamlscript rm myscript`

### - List scripts `yamlscript ls`

List all the loaded scripts.

**Example:** `yamlscript list` or `yamlscript ls`

## License

[MIT](https://github.com/mohamed1refaie/yamlscript/blob/master/LICENSE) © [Mohamed Refaie](https://github.com/mohamed1refaie)

## Contribute

Contributions are always welcome!
