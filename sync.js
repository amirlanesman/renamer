const fs = require('fs-extra')
const path = require('path')
const process = require('process')
const config = require('./config/config')

let syncInterval = undefined

async function startSync(syncFile) {
  console.log(`starting to sync processes`)
  await fs.ensureDir(path.dirname(syncFile))
  await getFileHandle(syncFile)
  const saveSync = generateSaveSync(syncFile)
  console.log(`starting recurring sync`)
  syncInterval = setInterval(saveSync, config.sync.syncBackoffMs)
}

function stopSync() {
  if (syncInterval) {
    console.log(`stopping recurring sync`)
    clearInterval(syncInterval)
    syncInterval = undefined
  }
}

async function getFileHandle(syncFile) {
  let current = {}
  while (current.pid !== process.pid) {
    console.log(`writing pid ${process.pid} to sync file`)
    await writePidToFile(syncFile)
    console.log(`waiting for ${config.sync.syncBackoffCheckMs} to check sync`)
    await sleep(config.sync.syncBackoffCheckMs)
    try {
      current = await fs.readJson(syncFile)
      console.log(`found pid sync`, current)
    } catch (error) {
      console.log(`couldn't read json from sync file:`, error)
    }
  }
  console.log(`writing pid ${process.pid} to sync file again`)
  await writePidToFile(syncFile)  
}

async function writePidToFile(syncFile) {
  await fs.writeJson(syncFile, {pid: process.pid, time: new Date()}, {flag: 'w'})
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function generateSaveSync(file) {
  return async () => {
    await writePidToFile(file)
  }
}


module.exports = {startSync, stopSync}