#!/usr/bin/env bash

source $(dirname $0)/config.sh

aws cloudformation delete-stack \
    --stack-name ${STACK_NAME} \
    --profile ${AWS_PROFILE}
