import fs from 'fs-extra'

const clearDirectoryContents = directoryPath => {
  fs.emptyDir(directoryPath)
    .then(console.log('Directory contents cleared'))
    .catch(clearDirectoryError => console.error(clearDirectoryError))
}

export default clearDirectoryContents
