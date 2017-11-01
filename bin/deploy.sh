#!/usr/bin/env bash

source $(dirname $0)/config.sh

RESOURCES=dist
ARCHIVE_NAME=resources.zip
TEMPLATE_FILE=sam.yaml
OUTPUT_TEMPLATE_FILE=serverless-output.yaml
CAPABILITIES=CAPABILITY_NAMED_IAM

# Create deployment archive
zip -r ${ARCHIVE_NAME} ${RESOURCES}

# Create S3 Lambda bucket
aws s3 mb s3://${S3_BUCKET} --region ${REGION}

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
