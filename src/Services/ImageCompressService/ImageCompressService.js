import S3Service from '../S3Service/S3Service'
import ImageMagickService from '../ImageMagickService/ImageMagickService'
import createDirectories from '../../lib/CreateDirectories'

class ImageCompressService {

  static setDirectories(directories) {
    return Promise.resolve(createDirectories(directories))
  }

  static setQuality

}
