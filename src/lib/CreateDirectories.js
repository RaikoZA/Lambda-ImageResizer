import fs from 'fs'
import path from 'path'

const createDirectories = fullDirectoryPath => {
  const pathSeparator = path.sep
  const initDir = path.isAbsolute(fullDirectoryPath) ? pathSeparator : ''

  fullDirectoryPath.split(pathSeparator).reduce((parentDir, childDir) => {
    const curDir = path.resolve(parentDir, childDir)
    console.log(`Dir Name: ${curDir}`)
    if (!fs.existsSync(curDir)) {
      console.log('Created')
      fs.mkdirSync(curDir)
    }

    return curDir
  }, initDir)
}

export default createDirectories
