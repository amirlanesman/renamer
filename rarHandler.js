const util = require('util')
const unpacker = require('unpack-all')
const unpackerListRar = util.promisify(unpacker.list)
const unpackerExtractFiles = util.promisify(unpacker.unpack)
const {unrar, list} = require('unrar-promise');

async function listRar(file) {
  return await unpackerListRar(file, {})
}

async function extractFilesRar(file, distDir, fileList) {
  await unpackerExtractFiles(file, {
    files: fileList,
    targetDir: distDir,
  })
}

module.exports = {listRar, extractFilesRar}