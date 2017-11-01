import aws from 'aws-sdk'
import im from 'imagemagick'
import fs from 'fs'
import path from 'path'
import createDirectories from '../lib/CreateDirectories'

const config = require('../config.json')

exports.imageResize = (event, context, callback) => {
  const s3 = new aws.S3()
  const sourceBucket = process.env.SOURCE_BUCKET
  const destinationBucket = process.env.DESTINATION_BUCKET
  const getEventObjectKey = event.Records[0].s3.object.key
  const compressedJpegFileQuality = process.env.COMPRESS_JPG_RATIO
  const compressedPngFileQuality = process.env.COMPRESS_PNG_RATIO

  const getObjectParams = {
    Bucket: sourceBucket,
    Key: getEventObjectKey
  }

  s3.getObject(getObjectParams, (getObjectError, data) => {
    if (getObjectError) {
      console.log(getObjectError, getObjectError.stack)
    } else {
      console.log('S3 object retrieval get successful.')

      const uploadedFileName = `/tmp/${getEventObjectKey}`
      const splitFileName = uploadedFileName.split('/')
      const directories = splitFileName.join('/').split('.')
      const splitImageFileName = splitFileName.slice(-1)
      const fileNameDirectory = splitImageFileName[0].split('.')[0]

      console.log('File uploaded:', uploadedFileName)

      createDirectories(directories[0])

      let quality

      if (uploadedFileName.toLowerCase().includes('png')) {
        quality = compressedPngFileQuality
      } else {
        quality = compressedJpegFileQuality
      }

      Object.keys(config.resolutions).forEach(resolution => {
        const width = config.resolutions[resolution].width
        const widthName = config.resolutions[resolution].name
        const pathParse = path.parse(uploadedFileName)
        const pathDir = pathParse.dir
        const parsedExt = pathParse.ext
        const destinationPath = `${pathDir}/${fileNameDirectory}/${widthName}${parsedExt}`
        const newFileCreated = `${widthName}${parsedExt}`
        const uploadFileNameObjectKey = `${fileNameDirectory}/${widthName}${parsedExt}`

        const resizeReq = {
          width: width,
          srcData: data.Body,
          dstPath: destinationPath,
          quality: quality,
          progressive: true,
          strip: true,
          customArgs: ['-sampling-factor', '4:2:0']
        }

        im.resize(resizeReq, (resizeError, stdout) => {
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

          s3.upload(uploadParams, (uploadError, data) => {
            if (uploadError) {
              console.log(uploadError, uploadError.stack)
            } else {
              console.log('S3 compressed object upload successful.')
            }
          })
        })
      })
    }
  })
}
