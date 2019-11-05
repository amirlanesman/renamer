
const fs = require('fs-extra');
const path = require('path');
const renamer = require('./renamerV2')
const config = require('./config/config')
const {listRar, extractFilesRar} = require('./rarHandler')
var os = require('os')

async function logToFile(log) {
  console.log(log)
  await fs.ensureDir(path.dirname(config.logs.moveLog))
  await fs.ensureFile(config.logs.moveLog)
  await fs.appendFile(config.logs.moveLog, getLogLine(log))
}

function getLogLine(log) {
  return new Date().toLocaleString() + "\t" + log + os.EOL;
}

async function processFiles(path, execConfig) {
  const processedFiles = await getProcessedFiles()
  execConfig.fetchers = renamer.getFetchers(execConfig)
  console.log(`processing path '${path}'`)
  const files = (await getFiles(path, new RegExp(execConfig.fileFilter)))
  if (!files) {
    return
  }
  const filteredFiles = files.filter(file => (!processedFiles || !processedFiles.includes(file)))
  const successful = (await Promise.all(filteredFiles.map(async file => {   
    try { 
      if (await handleFile(file, execConfig)) {
        return file
      } 
    } catch (error) {
      console.log(`failed handling file: ${file}`, error)
    }
  }))).filter(f => (!!f))
  await saveProcessedFiles(successful)
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

async function handleFile(file, execConfig) {
  const videoFilePattern = new RegExp(execConfig.videoFilter)
  const rarFilePattern = new RegExp(execConfig.rarFilter)
  if (videoFilePattern.test(file)) {
    return handleVideoFile(file, execConfig)
  } else if (rarFilePattern.test(file)) {
    return handleRarFile(file, execConfig)
  }
  return false
}

async function handleVideoFile(file, execConfig) {
  const filename = path.basename(file)
  const newPath = await renamer.getFileData(execConfig.fetchers, filename)
  if (!newPath) {
    return false
  }
  return await copyFile(file, newPath)
}

async function handleRarFile(file, execConfig) {
  const files = await listRar(file)
  const filtered = files.filter(name => (videoFilePattern.test(name)))
  if (!filtered || filtered.length === 0) {
    return true
  }
  console.log(`unpacking file '${file}' to '${execConfig.unpackDir}' with files:`, filtered)
  await extractFilesRar(file, execConfig.unpackDir, filtered)
  const res = await Promise.all(filtered.map(async filename => {
    const newPath = await renamer.getFileData(execConfig.fetchers, filename)
    return await moveFile(path.join(execConfig.unpackDir, filename), newPath)
  }))
  return (!res.every(r => (r)))
}

async function copyFile(oldPath, newPath) {
  if (!newPath) {
    console.log(`not moving '${oldPath}' because missing new path`)
    return false
  }
  try {
    let log = `copying '${oldPath}' => '${newPath}'`;
    await logToFile(log);
    let dir = path.dirname(newPath);
    console.log(`ensuring ${dir}`)
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