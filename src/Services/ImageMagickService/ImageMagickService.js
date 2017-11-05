import im from 'imagemagick'

class ImageMagick {

  static resize(resizeParams) {
    return new Promise((resolve, reject) => {
      im.resize(resizeParams, (resizeError, data) => {
        resizeError ? reject(resizeError) : resolve(data)
      })
    })
  }
}

export default ImageMagick
