import sharp from 'sharp'

const config = require('../../config.json')

class SharpService {

  static resize(buffer, width) {
    return new Promise((resolve, reject) => {
      sharp(buffer)
        .resize(width)
        .toBuffer((resizeError, info) => {
          resizeError ? reject(resizeError) : resolve(info)
        })
    })
  }

  static setImageQuality(fileNameExtension) {
    const compressedJpegFileQuality = process.env.COMPRESS_JPG_RATIO || config.imagequality.jpeg
    const compressedPngFileQuality = process.env.COMPRESS_PNG_RATIO | config.imagequality.png

    let quality

    const setPngQuality = () => quality = compressedPngFileQuality
    const setJpgQuality = () => quality = compressedJpegFileQuality

    return fileNameExtension === '.jpg' ? setJpgQuality() : setPngQuality()
  }
}

export default SharpService
