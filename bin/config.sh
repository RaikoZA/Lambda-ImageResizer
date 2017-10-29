#!/usr/bin/env bash

SERVICE_NAME=LambdaImageCompressor
S3_BUCKET=LambdaImageCompressor
AWS_PROFILE=default

AWS_USER=$(aws iam get-user --profile ${AWS_PROFILE} | grep UserName | awk '{print $2}' | sed 's/[",]//g')
ACCOUNT_PREFIX=G2A-${AWS_USER}

S3_PREFIX=${SERVICE_NAME}
STACK_NAME=${SERVICE_NAME}
REGION=eu-west-1
