import aws from 'aws-sdk'
const s3 = new aws.S3({'endpoint': 'http://localhost:4572'})

const config = require('../../config.json')

class S3Service {

  static getObject(eventObjectKey) {
    const source = process.env.SOURCE_BUCKET || config.bucket.source

    const getObjectParams = {
      Bucket: source,
      Key: eventObjectKey
    }

    return new Promise((resolve, reject) => {
      s3.getObject(getObjectParams, (getObjectError, data) => {
        getObjectError ? reject(getObjectError) : resolve(data)
      })
    })
  }

  static uploadObject(objectKey, buffer) {
    const destination = process.env.DESTINATION_BUCKET || config.bucket.destination

    const uploadParams = {
      Bucket: destination,
      Key: objectKey,
      Body: buffer,
      ContentType: buffer.ContentType,
      StorageClass: 'STANDARD'
    }

    return new Promise((resolve, reject) => {
      s3.upload(uploadParams, (uploadError, data) => {
        uploadError ? reject(uploadError) : resolve(data)
      })
    })
  }
}

export default S3Service
