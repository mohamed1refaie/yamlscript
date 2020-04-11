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

An easy to use package that let you write and run command line scripts in a yaml format, you can define which commands run in series and which commands run in parallel.
It let you load scripts to be used again, Also it create a log file for each run for tracking

## Installation

`npm i -g yamlscript`

## Script Format
You have to write the commands in a yaml format as a list of dictionaries, where the value of a key named `c` (required) of each dictionary is the command , and the value of a key named `next` (optional) is the next set of commands that will be excuted after the command finish

**Example of the yaml script file**
```YAML
- c : mkdir <somefolder>
- c : git clone https://github.com/<someuser>/<someNodeRepo>.git <somename>
  next :
    - c : cd <somename> && npm install
      next:
        - c : cd <somename> && mkdir <dummyname>
          next :
            - c : cd <somename> && git remote set-url origin <someurl>
              next :
                - c : touch <file.txt>
                - c : cd <somename> && git add . && git commit -m 'initial commit' && git push
                - c : cd <somename>/<dummyname> && touch <someotherfile>
        - c : cd <somename> && mkdir <anotherdummyname>
          next:
            - c : cp package.json <somename>/<anotherdummyname>/<myfile>
    - c : cd <somename> && touch <somefile>
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

### Initialize a script `yamlscript make [commands...]`
It creates an initial yaml script under the name of script.yaml, or a script with the commands if provided
  Example: `yamlscript make`
  



