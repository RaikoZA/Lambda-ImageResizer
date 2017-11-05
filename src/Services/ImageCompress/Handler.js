import aws from 'aws-sdk'
import im from 'imagemagick'
import fs from 'fs'
import path from 'path'
import S3Service from '../S3Service/S3Service'
import createDirectories from '../../lib/CreateDirectories'

const config = require('../../config.json')

exports.imageResize = (event, context, callback) => {
  const s3 = new aws.S3()
  const sourceBucket = process.env.SOURCE_BUCKET
  const destinationBucket = process.env.DESTINATION_BUCKET
  const getEventObjectKey = event.Records[0].s3.object.key
  const compressedJpegFileQuality = process.env.COMPRESS_JPG_RATIO
  const compressedPngFileQuality = process.env.COMPRESS_PNG_RATIO
  const uploadedFileName = `/tmp/${getEventObjectKey}`
  const getFileNameProperties = path.parse(uploadedFileName)
  const getDirectoryNames = getFileNameProperties.dir.split(path.sep)

  getDirectoryNames.push(getFileNameProperties.name)

  let quality

  const fileNameExtension = path.extname(uploadedFileName)
  const setPngQuality = () => quality = compressedPngFileQuality
  const setJpgQuality = () => quality = compressedJpegFileQuality
  const setImageQuality = () => fileNameExtension === '.jpg' ? setJpgQuality() : setPngQuality()

  const getObjectParams = {
    Bucket: sourceBucket,
    Key: getEventObjectKey
  }

  s3.getObject(getObjectParams, (getObjectError, data) => {
    if (getObjectError) {
      console.log(getObjectError, getObjectError.stack)
    } else {
      console.log('S3 object retrieval get successful.')
      console.log('File uploaded:', uploadedFileName)

      console.log('New directories:', getDirectoryNames)

      createDirectories(getDirectoryNames.join('/'))

      setImageQuality()

      Object.keys(config.resolutions).forEach(resolution => {
        const width = config.resolutions[resolution].width
        const destinationPath = `/tmp/${getFileNameProperties.name}/${width}${getFileNameProperties.ext}`
        const newFileCreated = `${width}${getFileNameProperties.ext}`
        const uploadFileNameObjectKey = `${getFileNameProperties.name}/${width}${getFileNameProperties.ext}`

        const resizeParams = {
          width: width,
          srcData: data.Body,
          dstPath: destinationPath,
          quality: quality,
          progressive: true,
          strip: true,
          customArgs: ['-sampling-factor', '4:2:0']
        }

        im.resize(resizeParams, (resizeError, stdout) => {
          if (resizeError) {
            throw resizeError
          }

          console.log('New file created:', newFileCreated)
          const content = new Buffer(fs.readFileSync(destinationPath))

          const uploadParams = {
            Bucket: destinationBucket,
            Key: uploadFileNameObjectKey,
            Body: content,
            ContentType: data.ContentType,
            StorageClass: 'STANDARD'
          }

          S3Service.uploadObject(uploadParams)
            .then(console.log('S3 compressed the object successfully'))
            .catch(console.error)
        })
      })
    }
  })
}
