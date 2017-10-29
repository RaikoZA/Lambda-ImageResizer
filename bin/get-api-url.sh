#!/usr/bin/env bash

source $(dirname $0)/config.sh

API_FILTER="items[?name=='${STACK_NAME}']"
API_ID=$(aws apigateway get-rest-apis --query ${API_FILTER} | grep id | awk '{print $2}' | sed 's/[",]//g')

echo "https://${API_ID}.execute-api.${REGION}.amazonaws.com/Prod/"
