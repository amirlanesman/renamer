
const fs = require('fs-extra');
const path = require('path');
const renamer = require('./renamerV2')
const config = require('./config/config')
const {listRar, extractFilesRar} = require('./rarHandler')
const os = require('os')
const {inspect} = require('util')

async function logToFile(log) {
  console.log(log)
  await fs.ensureDir(path.dirname(config.logs.moveLog))
  await fs.ensureFile(config.logs.moveLog)
  await fs.appendFile(config.logs.moveLog, getLogLine(log))
}

function getLogLine(log) {
  return new Date().toLocaleString() + "\t" + log + os.EOL;
}

async function processFiles(path, execConfig, keepFiles = true, forcedType) {
  const processedFiles = await getProcessedFiles()
  execConfig.fetchers = renamer.getFetchers(execConfig)
  console.log(`processing path '${path}'`)
  const files = (await getFiles(path, new RegExp(execConfig.fileFilter)))
  if (!files || files.length === 0) {
    console.log(`Couldn't find any files in ${path} to match /${execConfig.fileFilter}/`)
    return
  }
  const filteredFiles = files.filter(file => (!processedFiles || !processedFiles.includes(file)))
  const commands = (await Promise.all(filteredFiles.map(async file => {   
    try { 
      return {file, commands: await handleFile(file, execConfig, keepFiles)}
    } catch (error) {
      console.log(`failed handling file: ${file}`, error)
    }
  }))).filter(f => (f && f.commands))
  const successful = await runFileCommands(commands)
  await saveProcessedFiles(successful)
}

async function runFileCommands(commands) { 
  const successful = [];
  console.log('running commands: ', inspect(commands, undefined, null, true))
  for (const command of commands) {
    if (await runCommands(command.commands)){
      successful.push(command.file)
    }
  }
  return successful
}

async function runCommands(commands) {
  let successful = true;
  for (const command of commands) {
    try {
      if(command.type === 'copy') {
        successful = successful && await copyFile(command.file, command.newPath)
      } else if(command.type === 'move') {
        successful = successful && await moveFile(command.file, command.newPath)
      }
    } catch (e) {
      successful = false
    }
  }
  return successful
}

async function getProcessedFiles() {
  const processedFilesDbFile = config.fileMover.processedFilesDbFile
  if (!processedFilesDbFile || !(await fs.pathExists(processedFilesDbFile))) {
    return
  }
  const buf = await fs.readFile(processedFilesDbFile)
  return buf.toString().split('\n').filter(line => (line !== ''))
}

async function saveProcessedFiles(files) {
  if (!files) {
    return
  }
  const processedFilesDbFile = config.fileMover.processedFilesDbFile
  if (!processedFilesDbFile) {
    return
  }
  await fs.ensureDir(path.dirname(processedFilesDbFile))
  console.log(`saving processedFiles: '${files.join('\n')}'`)
  await fs.writeFile(processedFilesDbFile, files.join('\n') + '\n', {flag: 'a'})
}

async function getFiles(p,filter){
  //console.log(`getting files for path '${p}'`)
  if (!await fs.pathExists(p)){
      return;
  }
  const stat = await fs.lstat(p)
  if (stat.isFile()) {
    return [p]
  } else if (stat.isDirectory()) {
    const paths = await fs.readdir(p);
    const res = []
    const files = await Promise.all(paths.map(async p2 => {
      return await getFiles(path.join(p,p2), filter)
    }))
    files.forEach(f => {
      if (f) {
        res.push(...f) 
      }
    })
    return res
  }
}

async function handleFile(file, execConfig, keepFile, forcedType) {
  const videoFilePattern = new RegExp(execConfig.videoFilter)
  const rarFilePattern = new RegExp(execConfig.rarFilter)
  if (videoFilePattern.test(file)) {
    return await getVideoFileCommands(file, execConfig, keepFile)
  } else if (rarFilePattern.test(file)) {
    return await getRarFileCommands(file, execConfig, videoFilePattern)
  }
  return undefined
}

async function getVideoFileCommands(file, execConfig, keepFile, forcedType) {
  const filename = path.basename(file)
  const newPath = await renamer.getFileData(execConfig.fetchers, filename, forcedType)
  if (!newPath) {
    return false
  }
  if (keepFile) {
    return [{type: 'copy', file, newPath}];
  } else {
    return [{type: 'move', file, newPath}];
  }
}

async function getRarFileCommands(file, execConfig, videoFilePattern, forcedType) {
  const files = await listRar(file)
  const filtered = files.filter(name => (videoFilePattern.test(name)))
  if (!filtered || filtered.length === 0) {
    return true
  }
  console.log(`unpacking file '${file}' to '${execConfig.unpackDir}' with files:`, filtered)
  await extractFilesRar(file, execConfig.unpackDir, filtered)
  const res = await Promise.all(filtered.map(async filename => {
    const newPath = await renamer.getFileData(execConfig.fetchers, filename, forcedType)
    return {type: 'move', file: path.join(execConfig.unpackDir, filename), newPath};
  }))
  return res;
}

async function copyFile(oldPath, newPath) {
  if (!newPath) {
    console.log(`not copying '${oldPath}' because missing new path`)
    return false
  }
  try {
    await logToFile(`copying '${oldPath}' => '${newPath}'`);
    let dir = path.dirname(newPath);
    await fs.ensureDir(dir)
    await fs.copy(oldPath, newPath);
    return true
  } catch (error) {
    console.log(`Can't copy file ${oldPath}:`, error)
    return false
  }
}

async function moveFile(oldPath, newPath) {
  if (!newPath) {
    console.log(`not moving '${oldPath}' because missing new path`)
    return false
  }
  try {
    await logToFile(`moving '${oldPath}' => '${newPath}'`);
    let dir = path.dirname(newPath);
    await fs.ensureDir(dir)
    await fs.move(oldPath, newPath);
    return true
  } catch (error) {
    console.log(`Can't move file ${oldPath}:`, error)
  }
}

module.exports = { processFiles }
// getFiles('/Users/amirlanesman/Documents/work/prycto/integrations', /.+\.ts/).then(console.log, console.error)
