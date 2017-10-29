import aws from 'aws-sdk'
import im from 'imagemagick'
import fs from 'fs'
import path from 'path'

exports.imageResize = (event, context, callback) => {
  const s3 = new aws.S3()
  const sourceBucket = process.env.SOURCE_BUCKET
  const destinationBucket = process.env.DESTINATION_BUCKET
  const getEventObjectKey = event.Records[0].s3.object.key
  const compressedJpegFileQuality = process.env.COMPRESS_JPG_RATIO
  const compressedPngFileQuality = process.env.COMPRESS_PNG_RATIO

  const createDirectories = fullDirectoryPath => {
    const targetDirectory = fullDirectoryPath
    const pathSeparator = path.sep
    const initDir = path.isAbsolute(targetDirectory) ? pathSeparator : ''
    targetDirectory.split(pathSeparator).reduce((parentDir, childDir) => {
      const curDir = path.resolve(parentDir, childDir)
      console.log(`Dir Name: ${curDir}`)
      if (!fs.existsSync(curDir)) {
        console.log('Created')
        fs.mkdirSync(curDir)
      }

      return curDir
    }, initDir)
  }

  const getObjectParams = {
    Bucket: sourceBucket,
    Key: getEventObjectKey
  }

  s3.getObject(getObjectParams, (getObjectError, data) => {
    if (getObjectError) {
      console.log(getObjectError, getObjectError.stack)
    } else {
      console.log('S3 object retrieval get successful.')

      const resizedFileName = `/tmp/${getEventObjectKey}`
      const splitFileName = resizedFileName.split('/')
      const directories = splitFileName.slice(0, -1).join('/')

      createDirectories(directories)

      let quality

      if (resizedFileName.toLowerCase().includes('png')) {
        quality = compressedPngFileQuality
      } else {
        quality = compressedJpegFileQuality
      }

      const resizeReq = {
        width: '1024',
        height: '728',
        srcData: data.Body,
        dstPath: resizedFileName,
        quality: quality,
        progressive: true,
        strip: true,
        customArgs: ['-sampling-factor', '4:2:0']
      }

      im.resize(resizeReq, (resizeError, stdout) => {
        if (resizeError) {
          throw resizeError
        }

        const content = new Buffer(fs.readFileSync(resizedFileName))
        console.log('Resized filename:', resizedFileName)

        const uploadParams = {
          Bucket: destinationBucket,
          Key: getEventObjectKey,
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
    }
  })
}
