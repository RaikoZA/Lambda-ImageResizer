const path = require('path')
const config = require('../../config.json')

const getImageResolutionProperties = (imageMagick, s3Service) => Object.keys(config.resolutions)
  .forEach(res => console.log(config.resolutions[res].width))

getImageResolutionProperties()
