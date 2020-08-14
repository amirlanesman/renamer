const fs = require('fs-extra')
const path = require('path')
const process = require('process')
const config = require('./config/config')
const util = require('util')

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
  let current = await getCurrentSync(syncFile)
  do {
    const now = new Date()
    if (!current || !current.timeNumber || (now.getTime() - current.timeNumber > config.sync.syncBackoffCheckMs)) {
      await writePidToFile(syncFile)
    }
    console.log(`waiting for ${config.sync.syncBackoffCheckMs} to check sync`)
    await sleep(config.sync.syncBackoffCheckMs)
    current = await getCurrentSync(syncFile)
  } while (!current || current.pid !== process.pid)
  console.log(`writing pid ${process.pid} to sync file again`)
  await writePidToFile(syncFile)  
}

async function getCurrentSync(syncFile) {
  let current
  try {
    current = await fs.readJson(syncFile)
    console.log(`found pid sync`, current)
  } catch (error) {
    console.log(`couldn't read json from sync file:`, error)
  }
  return current
}

async function writePidToFile(syncFile) {
  const now = new Date()
  const obj = {pid: process.pid, time: now, timeNumber: now.getTime() }
  console.log(`writing pid to sync file:`, JSON.stringify(obj))
  await fs.writeJson(syncFile, obj, {flag: 'w'})
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