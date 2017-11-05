import aws from 'aws-sdk'
const s3 = new aws.S3()

class S3Service {

  static getObject(getObjectParams) {
    return new Promise((resolve, reject) => {
      s3.getObject(getObjectParams, (getObjectError, data) => {
        getObjectError ? reject(getObjectError) : resolve(data)
      })
    })
  }

  static uploadObject(uploadParams) {
    return new Promise((resolve, reject) => {
      s3.upload(uploadParams, (uploadError, data) => {
        uploadError ? reject(uploadError) : resolve(data)
      })
    })
  }
}

export default S3Service
