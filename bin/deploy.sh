#!/usr/bin/env bash

source $(dirname $0)/config.sh

RESOURCES=dist
ARCHIVE_NAME=resources.zip
TEMPLATE_FILE=sam.yaml
OUTPUT_TEMPLATE_FILE=serverless-output.yaml
CAPABILITIES=CAPABILITY_NAMED_IAM
LIST_S3_BUCKET=$(aws s3 ls "s3://${S3_BUCKET}" 2>&1)

# Create deployment archive
zip -r ${ARCHIVE_NAME} ${RESOURCES}


# Create S3 Lambda bucket
if [ $? != 0 ]
then
  NO_BUCKET_CHECK=$(echo $LIST_S3_BUCKET | grep -c 'NoSuchBucket')
  if [ $NO_BUCKET_CHECK = 1 ]; then
    echo "Bucket does not exist, creating bucket..."
    aws s3 mb s3://${S3_BUCKET} --region ${REGION}
  else
    echo "Error checking S3 Bucket"
    echo ${LIST_S3_BUCKET}
    exit 1
  fi
else
  echo "Bucket exists, create a new bucket"
fi

# Package cloudformation template
aws cloudformation package \
    --template-file ${TEMPLATE_FILE} \
    --output-template-file ${OUTPUT_TEMPLATE_FILE} \
    --s3-bucket ${S3_BUCKET} \
    --s3-prefix ${S3_PREFIX} \
    --profile ${AWS_PROFILE}

# Deploy stack
aws cloudformation deploy \
    --template-file ${OUTPUT_TEMPLATE_FILE} \
    --stack-name ${STACK_NAME} \
    --capabilities ${CAPABILITIES} \
    --profile ${AWS_PROFILE}

# Clean up artifacts
rm ${ARCHIVE_NAME}
rm ${OUTPUT_TEMPLATE_FILE}
