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

  const resolutions = {
    small: {
      name: 'small',
      width: '360'
    },
    mobile: {
      name: 'mobile',
      width: '425'
    },
    mobilePlus: {
      name: 'mobilePlus',
      width: '480'
    },
    maxWidth: {
      name: 'maxWidth',
      width: '620'
    },
    tablet: {
      name: 'tablet',
      width: '768'
    },
    tabletPlus: {
      name: 'tabletPlus',
      width: '960'
    },
    laptop: {
      name: 'laptop',
      width: '1024'
    },
    monitor: {
      name: 'monitor',
      width: '1220'
    },
    big: {
      name: 'big',
      width: '1440'
    },
    bigger: {
      name: 'bigger',
      width: '1680'
    },
    huge: {
      name: 'huge',
      width: '1920'
    }
  }

  const createDirectories = fullDirectoryPath => {
    const pathSeparator = path.sep
    const initDir = path.isAbsolute(fullDirectoryPath) ? pathSeparator : ''
    fullDirectoryPath.split(pathSeparator).reduce((parentDir, childDir) => {
      console.log('Fullpath split:', fullDirectoryPath.split(pathSeparator))
      console.log('Initdir', initDir)
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
      const directoriesold = splitFileName.slice(0, -1).join('/')
      const directories = splitFileName.join('/').split('.')
      const splitImageFileName = splitFileName.slice(-1)
      const fileNameDirectory = splitImageFileName[0].split('.')[0]

      console.log('Resized filename:', resizedFileName)
      console.log('Split filename:', splitFileName)
      console.log('Directories:', directories[0], directoriesold)
      console.log('Filenamedir:', fileNameDirectory)

      createDirectories(directories[0])

      let quality

      if (resizedFileName.toLowerCase().includes('png')) {
        quality = compressedPngFileQuality
      } else {
        quality = compressedJpegFileQuality
      }

      Object.keys(resolutions).forEach(res => {
        const width = resolutions[res].width
        const widthName = resolutions[res].name
        const pathParse = path.parse(resizedFileName)
        const pathDir = pathParse.dir
        const parsedExt = pathParse.ext
        const newFileName = `${widthName}.${resizedFileName.split('.')}`

        const resizeReq = {
          width: width,
          srcData: data.Body,
          // dstPath: `${resizedFileName}/${fileNameDirectory}`,
          dstPath: `${pathDir}/${fileNameDirectory}/${widthName}${parsedExt}`,
          quality: quality,
          progressive: true,
          strip: true,
          customArgs: ['-sampling-factor', '4:2:0']
        }

        im.resize(resizeReq, (resizeError, stdout) => {
          if (resizeError) {
            throw resizeError
          }

          console.log('NewFileName', `${widthName}${parsedExt}`)
          const content = new Buffer(fs.readFileSync(`${pathDir}/${fileNameDirectory}/${widthName}${parsedExt}`))
          console.log('SplitFileName Func:', splitImageFileName)
          console.log('Resized filename:', newFileName)
          console.log(content)

          const uploadParams = {
            Bucket: destinationBucket,
            Key: `${fileNameDirectory}/${widthName}${parsedExt}`,
            Body: content,
            ContentType: data.ContentType,
            StorageClass: 'STANDARD'
          }
          console.log('Object key:', getEventObjectKey)
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
