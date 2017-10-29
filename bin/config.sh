#!/usr/bin/env bash

SERVICE_NAME=ImageCompressor
S3_BUCKET=lambda-image-compress-bucket
AWS_PROFILE=default

AWS_USER=$(aws iam get-user --profile ${AWS_PROFILE} | grep UserName | awk '{print $2}' | sed 's/[",]//g')
ACCOUNT_PREFIX=G2A-${AWS_USER}

S3_PREFIX=${SERVICE_NAME}
STACK_NAME=${SERVICE_NAME}
REGION=eu-west-1
