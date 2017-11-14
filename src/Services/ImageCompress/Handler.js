import path from 'path'
import SharpService from '../SharpImageService/SharpImageService'
import S3Service from '../S3Service/S3Service'
import clearDirectoryContents from '../../lib/ClearDirectories'

const config = require('../../config.json')

exports.imageResize = (event, context, callback) => {
  const getEventObjectKey = event.Records[0].s3.object.key
  const getFileNameProperties = path.parse(`/tmp/${getEventObjectKey}`)
  const fileName = getFileNameProperties.name
  const fileNameExtension = getFileNameProperties.ext

  // Remove contents inside temp directory on AWS Lambda as to not run out of space
  clearDirectoryContents('/tmp')

  const newFileCreatedMessage = newFile => console.log(`New file created: ${newFile.key}`)
  const successfulResizedMessage = () => console.log('S3 compressed the object successfully')
  const getObjectErrorMessage = getObjectError => console.log(`Could not retrieve object from s3: ${getEventObjectKey}`)
  const uploadErrorMessage = error => console.log(`There was an error uploading: ${error}`)

  S3Service.getObject(getEventObjectKey)
    .then(objectData => {
      Object.keys(config.resolutions).forEach(resolution => {
        const width = config.resolutions[resolution].width
        const uploadFileNameObjectKey = `${fileName}/${width}${fileNameExtension}`
        const imageBufferData = objectData.Body

        SharpService.setImageQuality(fileNameExtension)
        SharpService.resize(imageBufferData, width)
          .then(imageBuffer => S3Service.uploadObject(uploadFileNameObjectKey, imageBuffer))
          .then(newFileCreatedMessage)
          .then(successfulResizedMessage)
          .catch(uploadErrorMessage)
      })
    })
    .catch(getObjectErrorMessage)
}
