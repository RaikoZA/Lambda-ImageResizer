import fs from 'fs-extra'

const createDirectories = directoryPath => {
  fs.ensureDir(directoryPath)
    .then(console.log('Directory created'))
    .catch(mkdirError => console.error(mkdirError))
}

export default createDirectories
