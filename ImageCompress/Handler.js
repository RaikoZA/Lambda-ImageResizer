import aws from 'aws-sdk'
import im from 'imagemagick'
import fs from 'fs'
import path from 'path'

const compressedJpegFileQuality = process.env.COMPRESS_JPG_RATIO
const compressedPngFileQuality = process.env.COMPRESS_PNG_RATIO

exports.imageResize = (event, context, callback) => {
  const s3 = new aws.S3()
  const sourceBucket = process.env.SOURCE_BUCKET
  const destinationBucket = process.env.DESTINATION_BUCKET
  const objectKey = event.Records[0].s3.object.key

  const mkdirSync = fullDirPath => {
    const targetDir = fullDirPath
    const sep = path.sep
    const initDir = path.isAbsolute(targetDir) ? sep : ''
    targetDir.split(sep).reduce((parentDir, childDir) => {
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
    Key: objectKey
  }

  s3.getObject(getObjectParams, (getObjectError, data) => {
    if (getObjectError) {
      console.log(getObjectError, getObjectError.stack)
    } else {
      console.log('S3 object retrieval get successful.')

      const resizedFileName = `/tmp/${objectKey}`
      const splitFileName = resizedFileName.split('/')
      const directories = splitFileName.slice(0, -1).join('/')

      mkdirSync(directories)

      let quality

      if (resizedFileName.toLowerCase().includes('png')) {
        quality = compressedPngFileQuality
      } else {
        quality = compressedJpegFileQuality
      }

      const resizeReq = {
        width: '100%',
        height: '100%',
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
          Key: objectKey,
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
