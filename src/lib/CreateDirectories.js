import mkdirp from 'mkdirp'

const createDirectories = directoryPath => {
  mkdirp(directoryPath, (err, data) => err ? console.log(err) : console.log('Directory created'))
}

export default createDirectories
